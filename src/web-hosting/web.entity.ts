import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm'
import { IsString } from 'class-validator'
import { User } from '../user/user.entity'

@Entity()
export class WebData extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @IsString()
  alias: string

  @OneToOne(() => User)
  user: User

  // This is also the bucket name
  public get getWebsiteDomain() {
    const domain = `${this.alias}.mlem-mlem.net`
    return domain
  }

  public get getBucketDomain() {
    return `http://${this.getWebsiteDomain}.s3-website-us-east-1.amazonaws.com`
  }
}
