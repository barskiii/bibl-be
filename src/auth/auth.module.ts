import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MulterModule } from '@nestjs/platform-express';
import { UserUniquePipe } from './pipes/userUnique.pipe';
import { ActivationTokenPipe } from './pipes/userActivationToken.pipe';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserUniquePipe, ActivationTokenPipe]
})
export class AuthModule {}
