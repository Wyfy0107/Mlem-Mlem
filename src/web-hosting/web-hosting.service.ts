import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { S3, CloudFront, Route53 } from 'aws-sdk'

import {
  AWS_S3_PROVIDER,
  AWS_ROUTE_53_PROVIDER,
  AWS_CLOUDFRONT_PROVIDER,
} from 'src/aws/aws.constants'
import { BaseCrudService } from 'src/base.service'
import { WebData } from './web.entity'

@Injectable()
export class WebService extends BaseCrudService<WebData> {
  constructor(
    @InjectRepository(WebData) repo,
    @Inject(AWS_S3_PROVIDER) private s3: S3,
    @Inject(AWS_ROUTE_53_PROVIDER) private route53: Route53,
    @Inject(AWS_CLOUDFRONT_PROVIDER) private cloudfront: CloudFront,
  ) {
    super(repo)
  }

  async uploadStaticFiles(userId: string, files: any[], alias?: string) {
    console.log('files', files)

    const checkValid = files.some(
      (file) =>
        file.mimetype === 'text/html' && file.originalname === 'index.html',
    )
    if (!checkValid) return 'Must include at least one index.html file'

    const fileUploads = files.map(async (file) => {
      const uploadParam = {
        Bucket: `user-${userId}-mlem-mlem`,
        Body: file.buffer,
        Key: file.originalname,
      }

      return this.s3.upload(uploadParam).promise()
    })

    const res = await Promise.all(fileUploads)
      .then(() => 'Uploaded')
      .catch((err) => {
        console.log(err)
        return err.message
      })

    return res
  }

  async createBucket(userId: string) {
    try {
      const uploadParams = {
        Bucket: `user-${userId}-mlem-mlem`,
      }

      const res = await this.s3.createBucket(uploadParams).promise()
      await this.configureBucketWebsite(uploadParams.Bucket)
      return res.Location
    } catch (error) {
      console.log(error.message)
      return error.message
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
      await this.s3.putBucketWebsite(params).promise()
      return 'Success'
    } catch (error) {
      console.log(error.message)
      return error.message
    }
  }

  async configureBucketPolicy(bucketName: string, cloudfrontIdentity: string) {
    try {
      const params = {
        Bucket: bucketName,
        Policy: `{
                  "Version": "2012-10-17",
                  "Statement": [{ 
                    "Effect": "Allow",
                    "Principal": {"AWS": "arn:aws:cloudfront::${cloudfrontIdentity}"},
                    "Action": [ "s3:GetObject" ],
                    "Resource": ["arn:aws:s3:::${bucketName}/*"]
                   }]
                 }`,
      }
      await this.s3.putBucketPolicy(params).promise()
      return 'Success'
    } catch (error) {
      console.log(error.message)
      return error.message
    }
  }

  async createCloudfrontDist(
    alias: string,
    bucketDomainName: string,
    originAccessIdentity: string,
  ) {
    try {
      const params = {
        DistributionConfig: {
          CallerReference: Date.now().toString(),
          Aliases: {
            Quantity: 1,
            Items: [`${alias}.mlem-mlem.net`],
          },
          DefaultRootObject: 'index.html',
          Origins: {
            Quantity: 1,
            Items: [
              {
                Id: `${alias}.mlem-mlem.net`,
                DomainName: bucketDomainName,
              },
            ],
            S3OriginConfig: {
              OriginAccessIdentity: originAccessIdentity,
            },
          },
          DefaultCacheBehavior: {
            TargetOriginId: `${alias}.mlem-mlem.net`,
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
          Comment: `Cloudfront distribution for ${alias}.mlem-mlem.net`,
          Enabled: true,
          ViewerCertificate: {
            CloudFrontDefaultCertificate: false,
            ACMCertificateArn: process.env.CERTIFICATE_ARN,
            SSLSupportMethod: 'sni-only',
          },
        },
      }
      await this.cloudfront.createDistribution(params).promise()
      return 'Success'
    } catch (error) {
      console.log(error.message)
      return error.message
    }
  }
}
