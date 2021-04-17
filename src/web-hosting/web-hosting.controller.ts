import { UploadedFiles, UseInterceptors, Post } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'

import AppController from '../app.decorator'
import { AppFeatures } from '../app.types'
import { Website } from './website.entity'
import { WebService } from './web-hosting.service'
import { BaseCrudController } from '../base.controller'
import { User } from '../users/user.decorator'
import { AuthenticatedUser } from '../auth/types'
import { Override, ParsedBody, ParsedRequest } from '@nestjsx/crud'

type Payload = { alias: string }

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
    return this.base.createOneBase(request, payload)
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

  @UseInterceptors(FilesInterceptor('files'))
  @Post('/bucket/upload')
  uploadFiles(@UploadedFiles() files: any[], @User() user: AuthenticatedUser) {
    return this.service.uploadStaticFiles(user, files)
  }
}
