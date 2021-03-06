import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { BaseEntity } from 'typeorm/repository/BaseEntity'
import { IsString } from 'class-validator'

@Entity()
export default class Card extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number

    @IsString()
    @Column('text')
    value: string


    @IsString()
    @Column('text')
    suits: string
}
