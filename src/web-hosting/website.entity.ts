import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm'
import { IsString } from 'class-validator'
import { User } from '../users/user.entity'
import { CloudFront } from 'aws-sdk'

@Entity('websites')
export class Websites extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  @IsString()
  alias: string

  @Column({ type: 'jsonb', nullable: true })
  cloudfrontDist: CloudFront.Distribution

  @Column({ nullable: true, unique: true })
  originId: string

  @ManyToOne(() => User, (user) => user.websites, { cascade: true })
  owner: User

  // This is also the bucket name
  get websiteDomain() {
    const domain = `${this.alias}.mlem-mlem.net`
    return domain
  }

  get bucketDomain() {
    return `${this.websiteDomain}.s3.us-east-1.amazonaws.com`
  }
}
