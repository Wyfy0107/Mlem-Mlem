import { UploadedFiles, UseInterceptors, Post, Body } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { CloudFront } from 'aws-sdk'

import AppController from '../app.decorator'
import { AppFeatures } from '../app.types'
import { Website } from './website.entity'
import { WebService } from './web-hosting.service'
import { BaseCrudController } from '../base.controller'
import { User } from '../users/user.decorator'
import { AuthenticatedUser } from '../auth/types'

type RecordPayload = {
  cloudfrontDist: CloudFront.Distribution
  websiteDomain: string
}

@AppController(AppFeatures.WebHosting, {
  model: { type: Website },
})
export class WebHostingController extends BaseCrudController<Website> {
  constructor(public service: WebService) {
    super()
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
  createRecord(@Body() body: RecordPayload) {
    return this.service.createRoute53Record(
      body.cloudfrontDist,
      body.websiteDomain,
    )
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Post('/bucket/upload')
  createOne(@UploadedFiles() files: any[], @User() user: AuthenticatedUser) {
    return this.service.uploadStaticFiles(user, files)
  }
}
