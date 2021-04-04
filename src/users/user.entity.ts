import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { IsString, IsEmail } from 'class-validator'
import { Website } from '../web-hosting/website.entity'

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @IsEmail()
  @Column({ unique: true })
  email: string

  @IsString()
  @Column()
  firstName: string

  @IsString()
  @Column()
  lastName: string

  @OneToOne(() => Website, (website) => website.user, { eager: true })
  @JoinColumn()
  website: Website

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role
}
