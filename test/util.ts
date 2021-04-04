import { Injectable } from '@nestjs/common'
import { Connection } from 'typeorm'

import { User } from '../src/users/user.entity'
import { Website } from '../src/web-hosting/website.entity'
import { AuthService } from '../src/auth/auth.service'

@Injectable()
export class TestUtil {
  constructor(
    private connection: Connection,
    private authService: AuthService,
  ) {}

  async beforeEach() {
    const user = new User()
    user.email = 'test@example.com'
    user.firstName = 'test'
    user.lastName = 'example'
    user.roles = ['admin']

    const webRepository = this.connection.getRepository(Website)
    const website = new Website()
    website.alias = 'mlem-test'
    website.user = user
    await webRepository.save(website)

    return { user, website }
  }

  async closeDbConnection() {
    if (this.connection.isConnected) {
      await this.connection.close()
    }
  }

  async afterEach() {
    for (const entity of this.connection.entityMetadatas) {
      const repository = this.connection.getRepository(entity.name)
      await repository.query(`DELETE FROM ${entity.tableName};`)
    }
  }

  async generateJwtToken(email: string) {
    return this.authService.sign(email)
  }
}
