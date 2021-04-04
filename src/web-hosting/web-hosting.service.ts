import { Injectable, Inject } from '@nestjs/common'
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
import { Website } from './website.entity'
import { AuthenticatedUser } from '../auth/types'
import { InjectLogger } from '../app.decorator'

@Injectable()
export class WebService extends BaseCrudService<Website> {
  constructor(
    @InjectRepository(Website) repo: Repository<Website>,
    @Inject(AWS_S3_PROVIDER) private s3: S3,
    @Inject(AWS_ROUTE_53_PROVIDER) private route53: Route53,
    @Inject(AWS_CLOUDFRONT_PROVIDER) private cloudfront: CloudFront,
    @InjectLogger() private logger: Logger,
  ) {
    super(repo)
  }

  async uploadStaticFiles(bucketName: string, files: any[]) {
    try {
      const checkValid = files.some(
        (file) =>
          file.mimetype === 'text/html' && file.originalname === 'index.html',
      )
      if (!checkValid) return 'Must include at least one index.html file'

      const fileUploads = files.map(async (file) => {
        const uploadParam = {
          Bucket: bucketName,
          Body: file.buffer,
          Key: file.originalname,
        }

        return this.s3
          .upload(uploadParam)
          .promise()
          .then((res) => res.Bucket)
      })

      return Promise.all(fileUploads)
    } catch (error) {
      this.logger.error(error.message)
      return error.message as string
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
      return error.message as string
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
      return await this.s3.putBucketWebsite(params).promise()
    } catch (error) {
      this.logger.error(error.message)
      return error.message as string
    }
  }

  async configureBucketPolicy(bucketName: string, originId: string) {
    try {
      const params = {
        Bucket: bucketName,
        Policy: `
        {
          "Version": "2012-10-17",
          "Statement": [{ 
            "Effect": "Allow",
            "Principal": {"AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${originId}"},
            "Action": [ "s3:GetObject" ],
            "Resource": ["arn:aws:s3:::${bucketName}/*"]
            }]
        }`,
      }
      return await this.s3.putBucketPolicy(params).promise()
    } catch (error) {
      this.logger.error(error.message)
      return error.message as string
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
    }
  }

  async createCloudFrontOAI(websiteDomain: string) {
    const params = {
      CloudFrontOriginAccessIdentityConfig: {
        CallerReference: websiteDomain,
        Comment: `OAI for ${websiteDomain}`,
      },
    }

    return await this.cloudfront
      .createCloudFrontOriginAccessIdentity(params)
      .promise()
      .then((res) => res.CloudFrontOriginAccessIdentity.Id)
  }

  async createAndConfigureCloudFront(user: AuthenticatedUser) {
    const originId = await this.createCloudFrontOAI(
      user.website.getWebsiteDomain,
    )
    const res = await this.createCloudfrontDist(
      user.website.getWebsiteDomain,
      user.website.getBucketDomain,
      originId,
    )

    await this.configureBucketPolicy(user.website.getWebsiteDomain, originId)
    return res
  }

  async createRoute53Record(
    cloudfrontDist: CloudFront.Distribution,
    websiteDomain: string,
  ) {
    try {
      // Create traffic policy
      const document = {
        ChangeBatch: {
          Changes: [
            {
              Action: 'CREATE',
              ResourceRecordSet: {
                AliasTarget: {
                  DNSName: cloudfrontDist.DomainName,
                  EvaluateTargetHealth: false,
                  HostedZoneId: process.env.AWS_CLOUDFRONT_HOSTED_ZONE_ID,
                },
                Name: websiteDomain,
                Type: 'A',
              },
            },
          ],
          Comment: `Route53 record for ${websiteDomain}`,
        },
        HostedZoneId: process.env.AWS_ROUTE_53_HOSTED_ZONE_ID,
      }

      return this.route53.changeResourceRecordSets(document).promise()
    } catch (error) {
      this.logger.error(error.message)
    }
  }
}
