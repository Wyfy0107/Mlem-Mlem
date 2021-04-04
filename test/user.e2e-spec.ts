import * as request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { AppModule } from '../src/app.module'
import { TestUtil } from './util'
import { User } from '../src/users/user.entity'

describe('User controller', () => {
  let app: INestApplication
  let testUtil: TestUtil
  let adminUser: User

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [TestUtil],
    }).compile()

    app = moduleRef.createNestApplication()
    testUtil = moduleRef.get<TestUtil>(TestUtil)

    await app.init()
  })

  beforeEach(async () => {
    const init = await testUtil.beforeEach()
    adminUser = init.user
  })

  afterEach(async () => {
    await testUtil.afterEach()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should get users', async () => {
    const res = await request(app.getHttpServer()).get('/user')
    expect(res.status).toBe(200)

    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', await testUtil.generateJwtToken(adminUser.email))
      .expect(200)
      .then((response) => {
        expect(response.body.length).toEqual(1)
      })
  })
})
