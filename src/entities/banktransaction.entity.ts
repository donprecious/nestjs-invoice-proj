import { Organization } from './organization.entity';
import { User } from './User.entity';
import { BaseEntity } from '../shared/entity/baseEntity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class BankTransactions extends BaseEntity {
  @Column()
  recordId: string;

  @Column()
  provider: string;

  @Column()
  recordType: string;

  @Column('simple-json')
  data: {};

  @ManyToOne(type => Organization)
  organization: Organization;
}
