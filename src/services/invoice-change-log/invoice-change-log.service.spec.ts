import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceChangeLogService } from './invoice-change-log.service';

describe('InvoiceChangeLogService', () => {
  let service: InvoiceChangeLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceChangeLogService],
    }).compile();

    service = module.get<InvoiceChangeLogService>(InvoiceChangeLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
