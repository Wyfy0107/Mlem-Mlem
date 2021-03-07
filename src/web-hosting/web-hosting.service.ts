import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { S3, CloudFront, Route53 } from 'aws-sdk'
import { Repository } from 'typeorm'

import {
  AWS_S3_PROVIDER,
  AWS_ROUTE_53_PROVIDER,
  AWS_CLOUDFRONT_PROVIDER,
} from 'src/aws/aws.constants'
import { BaseCrudService } from 'src/base.service'
import { WebData } from './web.entity'
import { AuthenticatedUser } from 'src/auth/types'

@Injectable()
export class WebService extends BaseCrudService<WebData> {
  constructor(
    @InjectRepository(WebData) repo: Repository<WebData>,
    @Inject(AWS_S3_PROVIDER) private s3: S3,
    @Inject(AWS_ROUTE_53_PROVIDER) private route53: Route53,
    @Inject(AWS_CLOUDFRONT_PROVIDER) private cloudfront: CloudFront,
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
      console.log(error.message)
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
      console.log(error.message)
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
      console.log(error.message)
      return error.message as string
    }
  }

  async configureBucketPolicy(bucketName: string, originId: string) {
    try {
      const params = {
        Bucket: bucketName,
        Policy: `{
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
      console.log(error.message)
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
          CallerReference: Date.now().toString(),
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
              },
            ],
            S3OriginConfig: {
              OriginAccessIdentity: `origin-access-identity/cloudfront/${originId}`,
            },
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
          },
          Comment: `Cloudfront distribution for ${bucketDomain}`,
          Enabled: true,
          ViewerCertificate: {
            CloudFrontDefaultCertificate: false,
            ACMCertificateArn: process.env.CERTIFICATE_ARN,
            SSLSupportMethod: 'sni-only',
          },
        },
      }
      return await this.cloudfront
        .createDistribution(params)
        .promise()
        .then((res) => res.Distribution)
    } catch (error) {
      console.log(error.message)
      return error.message as string
    }
  }

  async createCloudFrontOAI(websiteDomain: string) {
    const params = {
      CloudFrontOriginAccessIdentityConfig: {
        CallerReference: Date.now().toString(),
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

  async createRoute53Record(cloudfrontDomain: string, websiteDomain: string) {
    // Create traffic policy
    const document = `
      {
        "AWSPolicyFormatVersion": "2015-10-01",
        "RecordType": "A",
        "Endpoints": {
          "Type": cloudfront,
          "Region": ${process.env.AWS_REGION},
          "Value": ${cloudfrontDomain}
        }
      }
    `
    const policyParams = {
      Document: document,
      Name: cloudfrontDomain,
    }

    const { Id, Version } = await this.route53
      .createTrafficPolicy(policyParams)
      .promise()
      .then((res) => res.TrafficPolicy)

    // Create traffic policy instance
    const instanceParams = {
      HostedZoneId: process.env.AWS_ROUTE_53_HOSTED_ZONE_ID,
      Name: websiteDomain,
      TTL: 0,
      TrafficPolicyId: Id,
      TrafficPolicyVersion: Version,
    }

    return this.route53.createTrafficPolicyInstance(instanceParams)
  }
}
