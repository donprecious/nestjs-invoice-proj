import { UserRepository } from '../../repositories/user/userRepository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private userRepo: UserRepository) {}
}
