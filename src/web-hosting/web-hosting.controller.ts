import {
  UploadedFiles,
  UseInterceptors,
  Post,
  BadRequestException,
  Param,
  Body,
} from '@nestjs/common'
import { Override, ParsedBody, ParsedRequest } from '@nestjsx/crud'
import { AnyFilesInterceptor } from '@nestjs/platform-express'

import AppController from '../app.decorator'
import { AppFeatures } from '../app.types'
import { Websites } from './website.entity'
import { WebService } from './web-hosting.service'
import { BaseCrudController } from '../base.controller'
import { User } from '../users/user.decorator'
import { AuthenticatedUser } from '../auth/types'
import { Payload, File, UniqueExceptionCode } from './types'

@AppController(AppFeatures.WebHosting, {
  model: { type: Websites },
})
export class WebHostingController extends BaseCrudController<Websites> {
  constructor(public service: WebService) {
    super()
  }

  @Override()
  createOne(
    @ParsedRequest() request,
    @ParsedBody() body: Payload,
    @User() user: AuthenticatedUser,
  ) {
    const payload = { alias: body.alias, owner: { id: user.id } } as Websites

    return this.base.createOneBase(request, payload).catch((error) => {
      if (error.code === UniqueExceptionCode)
        throw new BadRequestException(`Alias ${body.alias} already exists`)
    })
  }

  @Post('/bucket')
  async createBucket(@Body() body: Payload) {
    const website = await this.service.repository.findOne({
      where: { alias: body.alias },
    })

    return this.service.createBucket(website.websiteDomain)
  }

  @Post('/cloudfront')
  async createOAI(@Body() body: Payload) {
    const website = await this.service.repository.findOne({
      where: { alias: body.alias },
    })

    return this.service.createAndConfigureCloudFront(website)
  }

  @Post('/record')
  async createRecord(@Body() body: Payload) {
    const website = await this.service.repository.findOne({
      where: { alias: body.alias },
    })

    return this.service.createRoute53Record(website)
  }

  @UseInterceptors(AnyFilesInterceptor())
  @Post('/bucket/upload/:alias')
  async uploadFiles(
    @UploadedFiles() files: File[],
    @Param('alias') alias: Payload,
  ) {
    const website = await this.service.repository.findOne({
      where: { alias },
    })

    return this.service.uploadStaticFiles(website, files)
  }
}
