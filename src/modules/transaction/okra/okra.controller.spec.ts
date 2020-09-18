import { Test, TestingModule } from '@nestjs/testing';
import { OkraController } from './okra.controller';

describe('Okra Controller', () => {
  let controller: OkraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OkraController],
    }).compile();

    controller = module.get<OkraController>(OkraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
