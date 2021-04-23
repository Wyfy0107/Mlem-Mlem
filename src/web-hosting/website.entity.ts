import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { CloudFront } from 'aws-sdk'
import { IsString } from 'class-validator'

import { Users } from '../users/user.entity'

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

  @ManyToOne(() => Users, (user) => user.websites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: Users

  @Column({ name: 'owner_id' })
  ownerId: string

  // This is also the bucket name
  get websiteDomain() {
    const domain = `${this.alias}.mlem-mlem.net`
    return domain
  }

  get bucketDomain() {
    return `${this.websiteDomain}.s3.us-east-1.amazonaws.com`
  }
}
