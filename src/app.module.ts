import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
import { ConfigModule } from '@nestjs/config'
import { WinstonModule, utilities } from 'nest-winston'
import winston from 'winston'

import { UserModule } from './users/user.module'
import { AuthModule } from './auth/auth.module'
import { WebHostingModule } from './web-hosting/web-hosting.module'
import { AwsModule } from './aws/aws.module'
import { User } from './users/user.entity'
import { Website } from './web-hosting/website.entity'

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike(),
          ),
        }),
      ],
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'secret',
      database: 'survey',
      entities: [User, Website],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    WebHostingModule,
    AwsModule,
  ],
  providers: [],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
