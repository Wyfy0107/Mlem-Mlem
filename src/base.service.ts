import { TypeOrmCrudService } from '@nestjsx/crud-typeorm'
import { Repository } from 'typeorm'

export abstract class BaseCrudService<T> extends TypeOrmCrudService<T> {
  get repository(): Repository<T> {
    return this.repo
  }
}
