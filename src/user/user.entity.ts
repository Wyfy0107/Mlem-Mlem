import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { IsString, IsEmail, IsEmpty } from 'class-validator'

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @IsEmail()
  @Column()
  email: string

  @IsString()
  @Column()
  firstName: string

  @IsString()
  @Column()
  lastName: string
}
