import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

Entity
export class Employer {  
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  address: string

  @Column()
  identityNumber: number

  @Column()
  pib: number

  @Column()
  responsiblePerson: string
}