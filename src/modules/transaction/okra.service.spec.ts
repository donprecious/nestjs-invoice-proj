import { Test, TestingModule } from '@nestjs/testing';
import { OkraService } from './okra.service';

describe('OkraService', () => {
  let service: OkraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OkraService],
    }).compile();

    service = module.get<OkraService>(OkraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
