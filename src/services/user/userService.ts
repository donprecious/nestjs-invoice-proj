import { User } from 'src/entities/User.entity';
import { Repository, EntityRepository } from 'typeorm';
import { Not } from 'typeorm/find-options/operator/Not';
import { In } from 'typeorm/find-options/operator/In';
import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../role/roleService';

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
