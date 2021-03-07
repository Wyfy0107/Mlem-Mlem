import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm'
import { IsString, IsEmail } from 'class-validator'
import { WebData } from '../web-hosting/web.entity'

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @IsEmail()
  @Column()
  email: string

  @IsString()
  @Column({ nullable: true })
  password: string

  @IsString()
  @Column()
  firstName: string

  @IsString()
  @Column()
  lastName: string

  @OneToOne(() => WebData)
  website: WebData
}
