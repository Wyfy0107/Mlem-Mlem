import * as request from 'supertest'
import { Test } from '@nestjs/testing'
import { UserController } from '../../src/user/user.controller'
import { UserService } from '../../src/user/user.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '../../src/app.module'

describe('Cats', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('create a user', async () => {
    const res = await request(app.getHttpServer()).get('/user')
    expect(res.status).toBe(200)
  })
})
