import { Test, TestingModule } from '@nestjs/testing';
import { ApikeyValidatorService } from './apikey-validator.service';

describe('ApikeyValidatorService', () => {
  let service: ApikeyValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApikeyValidatorService],
    }).compile();

    service = module.get<ApikeyValidatorService>(ApikeyValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
