import { UserOrganization } from './userOrganization.entity';
import { BaseEntity } from './../shared/entity/baseEntity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  otp?: number;

  @Column({ nullable: true })
  otpExpiresIn?: Date;

  @OneToMany(
    type => UserOrganization,
    userOrganization => userOrganization.user,
  )
  userOrganization: UserOrganization[];
}
