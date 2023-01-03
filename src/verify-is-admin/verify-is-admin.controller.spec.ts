import { Test, TestingModule } from '@nestjs/testing';
import { VerifyIsAdminController } from './verify-is-admin.controller';

describe('VerifyIsAdminController', () => {
  let controller: VerifyIsAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerifyIsAdminController],
    }).compile();

    controller = module.get<VerifyIsAdminController>(VerifyIsAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
