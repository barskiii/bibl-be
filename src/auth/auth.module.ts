import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
