import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { S3, CloudFront, Route53 } from 'aws-sdk'
import { Repository } from 'typeorm'
import { Logger } from 'winston'

import {
  AWS_S3_PROVIDER,
  AWS_ROUTE_53_PROVIDER,
  AWS_CLOUDFRONT_PROVIDER,
} from '../aws/aws.constants'
import { BaseCrudService } from '../base.service'
import { Websites } from './website.entity'
import { InjectLogger } from '../app.decorator'
import { File } from './types'

@Injectable()
export class WebService extends BaseCrudService<Websites> {
  constructor(
    @InjectRepository(Websites) repo: Repository<Websites>,
    @Inject(AWS_S3_PROVIDER) private s3: S3,
    @Inject(AWS_ROUTE_53_PROVIDER) private route53: Route53,
    @Inject(AWS_CLOUDFRONT_PROVIDER) private cloudfront: CloudFront,
    @InjectLogger() private logger: Logger,
  ) {
    super(repo)
  }

  async uploadStaticFiles(website: Websites, files: File[]) {
    try {
      const fileUploads = files.map(async (file) => {
        const uploadParam = {
          Bucket: website.websiteDomain,
          Body: file.buffer,
          Key: file.fieldname,
          ContentType: file.mimetype,
        }

        return this.s3
          .upload(uploadParam)
          .promise()
          .then((res) => res.Bucket)
      })

      await this.purgeCloudfront(website.cloudfrontDist.Id)
      return Promise.all(fileUploads)
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  async purgeCloudfront(distributionId: string) {
    try {
      const params = {
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: new Date().toString(),
          Paths: {
            Quantity: 1,
            Items: ['/*'],
          },
        },
      }

      return this.cloudfront.createInvalidation(params).promise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  async createBucket(websiteDomain: string) {
    try {
      const uploadParams = {
        Bucket: websiteDomain,
      }

      const res = await this.s3.createBucket(uploadParams).promise()
      await this.configureBucketWebsite(uploadParams.Bucket)
      return res
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  async configureBucketWebsite(bucketName: string) {
    try {
      const params = {
        Bucket: bucketName,
        WebsiteConfiguration: {
          ErrorDocument: {
            Key: 'error.html',
          },
          IndexDocument: {
            Suffix: 'index.html',
          },
        },
      }
      return this.s3.putBucketWebsite(params).promise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  async configureBucketPolicy(bucketName: string, originId: string) {
    try {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              AWS: `arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${originId}`,
            },
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`,
          },
        ],
      }

      const params = {
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
      }

      return this.s3.putBucketPolicy(params).promise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  async createCloudfrontDist(
    websiteDomain: string,
    bucketDomain: string,
    originId: string,
  ) {
    try {
      const params = {
        DistributionConfig: {
          CallerReference: websiteDomain,
          Aliases: {
            Quantity: 1,
            Items: [websiteDomain],
          },
          DefaultRootObject: 'index.html',
          Origins: {
            Quantity: 1,
            Items: [
              {
                Id: bucketDomain,
                DomainName: bucketDomain,
                S3OriginConfig: {
                  OriginAccessIdentity: `origin-access-identity/cloudfront/${originId}`,
                },
              },
            ],
          },
          DefaultCacheBehavior: {
            TargetOriginId: bucketDomain,
            ViewerProtocolPolicy: 'redirect-to-https',
            AllowedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD'],
              CachedMethods: {
                Quantity: 2,
                Items: ['GET', 'HEAD'],
              },
            },
            MinTTL: 0,
            DefaultTTL: 3600,
            MaxTTL: 86400,
            ForwardedValues: {
              QueryString: false,
              Cookies: {
                Forward: 'none',
              },
            },
          },
          Comment: `Cloudfront distribution for ${bucketDomain}`,
          Enabled: true,
          ViewerCertificate: {
            CloudFrontDefaultCertificate: false,
            ACMCertificateArn: process.env.AWS_CERTIFICATE_ARN,
            SSLSupportMethod: 'sni-only',
          },
        },
      }

      return this.cloudfront
        .createDistribution(params)
        .promise()
        .then((res) => res.Distribution)
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  async createCloudFrontOAI(websiteDomain: string) {
    const params = {
      CloudFrontOriginAccessIdentityConfig: {
        CallerReference: websiteDomain,
        Comment: `OAI for ${websiteDomain}`,
      },
    }

    return this.cloudfront
      .createCloudFrontOriginAccessIdentity(params)
      .promise()
      .then((res) => res.CloudFrontOriginAccessIdentity.Id)
  }

  async createAndConfigureCloudFront(website: Websites) {
    try {
      const originId = await this.createCloudFrontOAI(website.websiteDomain)
      const cloudfrontDist = await this.createCloudfrontDist(
        website.websiteDomain,
        website.bucketDomain,
        originId,
      )

      const update = {
        originId,
        cloudfrontDist,
      }

      const web = await this.repository.findOne({ alias: website.alias })
      web.cloudfrontDist = cloudfrontDist
      web.originId = originId
      await this.repository.save(web)

      await this.configureBucketPolicy(website.websiteDomain, originId)
      return update
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException(error.message)
    }
  }

  async createRoute53Record(website: Websites) {
    try {
      // Create traffic policy
      const document = {
        ChangeBatch: {
          Changes: [
            {
              Action: 'CREATE',
              ResourceRecordSet: {
                AliasTarget: {
                  DNSName: website.cloudfrontDist.DomainName,
                  EvaluateTargetHealth: false,
                  HostedZoneId: process.env.AWS_CLOUDFRONT_HOSTED_ZONE_ID,
                },
                Name: website.websiteDomain,
                Type: 'A',
              },
            },
          ],
          Comment: `Route53 record for ${website.websiteDomain}`,
        },
        HostedZoneId: process.env.AWS_ROUTE_53_HOSTED_ZONE_ID,
      }

      return this.route53.changeResourceRecordSets(document).promise()
    } catch (error) {
      this.logger.error(error.message)
      throw new InternalServerErrorException(error.message)
    }
  }
}
