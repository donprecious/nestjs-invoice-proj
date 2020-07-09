import { PrimaryGeneratedColumn } from 'typeorm/decorator/columns/PrimaryGeneratedColumn';
import { Column } from 'typeorm/decorator/columns/Column';
import { Timestamp } from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Timestamp;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true, type: 'timestamp' })
  updatedOn?: Timestamp;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true, type: 'timestamp' })
  deletedOn?: Timestamp;

  @Column({ nullable: true })
  deletedBy?: string;
  /**
   *
   */
}
