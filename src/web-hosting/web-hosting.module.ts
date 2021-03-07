import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

import { Module } from '@nestjs/common'
import { WebHostingController } from './web-hosting.controller'
import { WebService } from './web-hosting.service'
import { AwsModule } from 'src/aws/aws.module'
import { WebData } from './web.entity'

@Module({
  controllers: [WebHostingController],
  providers: [WebService],
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([WebData]),
    AwsModule,
  ],
})
export class WebHostingModule {}
