import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

import { Module } from '@nestjs/common'
import { WebHostingController } from './web-hosting.controller'
import { WebService } from './web-hosting.service'
import { AwsModule } from '../aws/aws.module'
import { Websites } from './website.entity'
import { UserModule } from 'src/users/user.module'

@Module({
  controllers: [WebHostingController],
  providers: [WebService],
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Websites]),
    AwsModule,
    UserModule,
  ],
})
export class WebHostingModule {}
