import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import {
  awsS3Provider,
  awsCloudfrontProvider,
  awsRoute53Provider,
} from './aws.providers'

@Module({
  imports: [ConfigModule.forRoot()],
  exports: [awsS3Provider, awsCloudfrontProvider, awsRoute53Provider],
  providers: [awsS3Provider, awsCloudfrontProvider, awsRoute53Provider],
})
export class AwsModule {}
