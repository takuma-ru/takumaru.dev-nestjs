import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { IdTokenDto } from './IdToken.dto';
import { VerifyIsAdminService } from './verify-is-admin.service';

@Controller('verify-is-admin')
export class VerifyIsAdminController {
  constructor(private readonly verifyIsAdminService: VerifyIsAdminService) {}

  /**
   * リクエストしてきたクライアントがアドミンかどうか検証するAPIの定義関数
   */
  @Post()
  VerifyIsAdmin(
    @Body() body: IdTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.verifyIsAdminService.VerifyIsAdmin(body, res);
  }
}
