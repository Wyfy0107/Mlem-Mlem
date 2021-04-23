import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
import { ConfigModule } from '@nestjs/config'
import { WinstonModule, utilities } from 'nest-winston'
import * as winston from 'winston'

import { UserModule } from './users/user.module'
import { AuthModule } from './auth/auth.module'
import { WebHostingModule } from './web-hosting/web-hosting.module'
import { AwsModule } from './aws/aws.module'
import { Users } from './users/user.entity'
import { Websites } from './web-hosting/website.entity'

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => {
        const config = {
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                utilities.format.nestLike(),
              ),
            }),
          ],
        }
        return config
      },
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.db_host,
      port: 5432,
      username: process.env.db_username,
      password: process.env.db_password,
      database: process.env.db_name,
      entities: [Users, Websites],
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
