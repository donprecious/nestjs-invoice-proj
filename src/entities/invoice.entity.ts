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

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discountAmount: number;

  @Column({ nullable: true })
  paymentReference: string;

  @Column({ type: 'timestamp', nullable: true })
  paymentDate: Date;

  @Column({ nullable: true, default: 'accepted' })
  status: string;

  @ManyToOne(type => Organization)
  createdForOrganization: Organization;

  @ManyToOne(type => Organization)
  createdByOrganization: Organization;
}
