import { Test, TestingModule } from '@nestjs/testing';
import { VerifyIsAdminService } from './verify-is-admin.service';

describe('VerifyIsAdminService', () => {
  let service: VerifyIsAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerifyIsAdminService],
    }).compile();

    service = module.get<VerifyIsAdminService>(VerifyIsAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
