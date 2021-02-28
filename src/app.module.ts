import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
import { ConfigModule } from '@nestjs/config'

import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { WebHostingModule } from './web-hosting/web-hosting.module'
import { AwsModule } from './aws/aws.module'
import { User } from './user/user.entity'
import { WebData } from './web-hosting/web.entity'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'secret',
      database: 'survey',
      entities: [User, WebData],
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
