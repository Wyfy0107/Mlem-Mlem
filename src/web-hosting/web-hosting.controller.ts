import { UploadedFiles, UseInterceptors, Param, Post } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'

import AppController from 'src/app.decorator'
import { AppFeatures } from 'src/app.types'
import { WebData } from './web.entity'
import { WebService } from './web-hosting.service'
import BypassAuth from 'src/auth/bypass-auth.decorator'
import { BaseCrudController } from 'src/base.controller'

@AppController(AppFeatures.WebHosting, {
  model: { type: WebData },
  params: {},
})
export class WebHostingController extends BaseCrudController<WebData> {
  constructor(public service: WebService) {
    super()
  }

  @BypassAuth()
  @UseInterceptors(FilesInterceptor('files'))
  @Post('bucket/files/:userId')
  createOne(@UploadedFiles() files: any[], @Param('userId') userId: string) {
    return this.service.uploadStaticFiles(userId, files, body.alias)
  }

  @BypassAuth()
  @Post('bucket/:userId')
  createBucket(@Param('userId') userId: string) {
    return this.service.createBucket(userId)
  }
}
