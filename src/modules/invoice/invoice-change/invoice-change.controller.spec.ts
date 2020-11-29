import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceChangeController } from './invoice-change.controller';

describe('InvoiceChange Controller', () => {
  let controller: InvoiceChangeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceChangeController],
    }).compile();

    controller = module.get<InvoiceChangeController>(InvoiceChangeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
