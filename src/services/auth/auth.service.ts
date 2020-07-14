import { User } from './../../entities/User.entity';
import { UserRepository } from './../user/userService';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private userRepo: UserRepository) {}


}
