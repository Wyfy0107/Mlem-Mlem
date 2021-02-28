import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { IsString } from 'class-validator'

@Entity()
export class WebData extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @IsString()
  websiteDomain: string
}
