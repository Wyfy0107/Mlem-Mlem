import { Injectable } from '@nestjs/common'
import { Connection } from 'typeorm'

import { Role, Users } from '../src/users/user.entity'
import { Websites } from '../src/web-hosting/website.entity'
import { AuthService } from '../src/auth/auth.service'

@Injectable()
export class TestUtil {
  constructor(
    private connection: Connection,
    private authService: AuthService,
  ) {}

  async beforeEach() {
    const user = new Users()
    user.email = 'test@example.com'
    user.firstName = 'test'
    user.lastName = 'example'
    user.role = Role.Admin

    const webRepository = this.connection.getRepository(Websites)
    const website = new Websites()
    website.alias = 'mlem-test'
    website.owner = user
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
