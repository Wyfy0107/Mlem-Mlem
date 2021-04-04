import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

import { Module } from '@nestjs/common'
import { WebHostingController } from './web-hosting.controller'
import { WebService } from './web-hosting.service'
import { AwsModule } from '../aws/aws.module'
import { Website } from './website.entity'

@Module({
  controllers: [WebHostingController],
  providers: [WebService],
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Website]),
    AwsModule,
  ],
})
export class WebHostingModule {}
