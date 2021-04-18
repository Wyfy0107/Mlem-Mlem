import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { json, urlencoded } from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()
  app.use(json({ limit: '4mb' }))
  app.use(urlencoded({ limit: '4mb' }))
  await app.listen(process.env.PORT || 3000)
}
bootstrap()
