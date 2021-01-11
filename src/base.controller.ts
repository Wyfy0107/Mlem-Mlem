import { CrudController, CrudService } from '@nestjsx/crud'

export abstract class BaseCrudController<T> implements CrudController<T> {
  public service: CrudService<T>

  get base(): CrudController<T> {
    return this
  }
}
