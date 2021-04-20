import { UploadedFiles, UseInterceptors, Post } from '@nestjs/common'
import { Override, ParsedBody, ParsedRequest } from '@nestjsx/crud'
import { AnyFilesInterceptor } from '@nestjs/platform-express'

import AppController from '../app.decorator'
import { AppFeatures } from '../app.types'
import { Website } from './website.entity'
import { WebService } from './web-hosting.service'
import { BaseCrudController } from '../base.controller'
import { User } from '../users/user.decorator'
import { AuthenticatedUser } from '../auth/types'

type Payload = { alias: string }
export type File = {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  buffer: Buffer
}

@AppController(AppFeatures.WebHosting, {
  model: { type: Website },
})
export class WebHostingController extends BaseCrudController<Website> {
  constructor(public service: WebService) {
    super()
  }

  @Override()
  createOne(
    @ParsedRequest() request,
    @ParsedBody() body: Payload,
    @User() user: AuthenticatedUser,
  ) {
    const payload = { alias: body.alias, user: { id: user.id } } as Website
    return this.base.createOneBase(request, payload).catch((error) => {
      if (error.code === '23505') return `Alias ${body.alias} already exists`
    })
  }

  @Post('/bucket')
  createBucket(@User() user: AuthenticatedUser) {
    return this.service.createBucket(user.website.getWebsiteDomain)
  }

  @Post('/cloudfront')
  createOAI(@User() user: AuthenticatedUser) {
    return this.service.createAndConfigureCloudFront(user)
  }

  @Post('/record')
  createRecord(@User() user: AuthenticatedUser) {
    return this.service.createRoute53Record(user)
  }

  @UseInterceptors(AnyFilesInterceptor())
  @Post('/bucket/upload')
  uploadFiles(@UploadedFiles() files: File[], @User() user: AuthenticatedUser) {
    return this.service.uploadStaticFiles(user, files)
  }
}
