import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
import { ConfigModule } from '@nestjs/config'

import { UserModule } from './user/user.module'
import { User } from './user/user.entity'
import { AuthModule } from './auth/auth.module'

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
      entities: [User],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
  ],
  providers: [],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
