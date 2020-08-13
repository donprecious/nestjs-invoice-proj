import { Organization } from './organization.entity';
import { User } from './User.entity';
import { BaseEntity } from '../shared/entity/baseEntity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class Invoice extends BaseEntity {
  @Column()
  invoiceNumber: string;
  @Column()
  currencyCode: string;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'decimal', nullable: true })
  discountAmount: number;

  @ManyToOne(type => Organization)
  createdForOrganization: Organization;

  @ManyToOne(type => Organization)
  createdByOrganization: Organization;
}
