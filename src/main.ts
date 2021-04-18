import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { json, urlencoded } from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()
  app.use(json({ limit: '50mb' }))
  app.use(
    urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }),
  )
  await app.listen(process.env.PORT || 3000)
}
bootstrap()
