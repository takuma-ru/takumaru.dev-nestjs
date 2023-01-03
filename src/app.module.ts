import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { VerifyIsAdminController } from './verify-is-admin/verify-is-admin.controller';
import { VerifyIsAdminService } from './verify-is-admin/verify-is-admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController, VerifyIsAdminController],
  providers: [AppService, VerifyIsAdminService],
})
export class AppModule {}
