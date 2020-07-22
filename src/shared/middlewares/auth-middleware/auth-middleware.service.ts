import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApikeyValidatorService } from 'src/shared/validators/apikey-validator/apikey-validator.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  /**
   *
   *
   */
  constructor(private apikeyValidator: ApikeyValidatorService) {}

  async use(req: Request, res: Response, next: Function) {
    next();
  }
}
