import { Invoice } from './invoice.entity';
import { BaseEntity } from './../shared/entity/baseEntity';
import { Entity, ManyToOne } from 'typeorm';
import { Column } from 'typeorm/decorator/columns/Column';

@Entity()
export class InvoiceChangeLog extends BaseEntity {
  @Column()
  invoiceId: string;

  @ManyToOne(
    () => Invoice,
    invoice => invoice.invoiceChangeLogs,
  )
  invoice: Invoice;

  @Column()
  invoiceNumber: string;

  @Column()
  changeYear: number;

  @Column()
  changeMonth: number;

  @Column()
  changeWeekInYear: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  invoiceAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  changeAmount: number;

  @Column()
  buyerCode: string;

  @Column()
  supplierCode: string;

  @Column()
  statusFrom: string;

  @Column()
  statusTo: string;
}
