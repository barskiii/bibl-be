import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MulterModule } from '@nestjs/platform-express';
import { UserUniquePipe } from './pipes/userUnique.pipe';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserUniquePipe]
})
export class AuthModule {}
