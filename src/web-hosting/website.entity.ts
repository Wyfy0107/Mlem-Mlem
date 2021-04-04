import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm'
import { IsString } from 'class-validator'
import { User } from '../users/user.entity'

@Entity('websites')
export class Website extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @IsString()
  alias: string

  @OneToOne(() => User, (user) => user.website, { cascade: true })
  user: User

  // This is also the bucket name
  get getWebsiteDomain() {
    const domain = `${this.alias}.mlem-mlem.net`
    return domain
  }

  get getBucketDomain() {
    return `${this.getWebsiteDomain}.s3.us-east-1.amazonaws.com`
  }
}
