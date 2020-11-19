import { PrimaryGeneratedColumn } from 'typeorm/decorator/columns/PrimaryGeneratedColumn';
import { Column } from 'typeorm/decorator/columns/Column';
import { BeforeUpdate, Timestamp } from 'typeorm';
import { AutoMap } from 'nestjsx-automapper';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @AutoMap()
  id: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @AutoMap()
  createdOn: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true, type: 'timestamp' })
  updatedOn?: Date;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true, type: 'timestamp' })
  deletedOn?: Date;

  @Column({ nullable: true })
  deletedBy?: string;
  /**
   *
   */

  @BeforeUpdate()
  updateDates() {
    this.updatedOn = new Date();
  }
}
