import { S3, CloudFront, Route53 } from 'aws-sdk'
import {
  AWS_S3_PROVIDER,
  AWS_ROUTE_53_PROVIDER,
  AWS_CLOUDFRONT_PROVIDER,
} from './aws.constants'

export const awsS3Provider = {
  provide: AWS_S3_PROVIDER,
  useValue: new S3(),
}

export const awsCloudfrontProvider = {
  provide: AWS_CLOUDFRONT_PROVIDER,
  useValue: new CloudFront(),
}

export const awsRoute53Provider = {
  provide: AWS_ROUTE_53_PROVIDER,
  useValue: new Route53(),
}
