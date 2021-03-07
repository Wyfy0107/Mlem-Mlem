import { UploadedFiles, UseInterceptors, Post } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'

import AppController from 'src/app.decorator'
import { AppFeatures } from 'src/app.types'
import { WebData } from './web.entity'
import { WebService } from './web-hosting.service'
import { BaseCrudController } from 'src/base.controller'
import { User } from '../user/user.decorator'
import { AuthenticatedUser } from 'src/auth/types'

@AppController(AppFeatures.WebHosting, {
  model: { type: WebData },
})
export class WebHostingController extends BaseCrudController<WebData> {
  constructor(public service: WebService) {
    super()
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Post('bucket/upload')
  createOne(@UploadedFiles() files: any[], @User() user: AuthenticatedUser) {
    return this.service.uploadStaticFiles(user.website.getWebsiteDomain, files)
  }

  @Post('bucket')
  createBucket(@User() user: AuthenticatedUser) {
    return this.service.createBucket(user.website.getWebsiteDomain)
  }

  @Post('oai')
  createOAI(@User() user: AuthenticatedUser) {
    return this.service.createAndConfigureCloudFront(user)
  }
}
