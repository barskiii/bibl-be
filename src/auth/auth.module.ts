import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserUniquePipe } from './pipes/userUnique.pipe';
import { ActivationTokenPipe } from './pipes/userActivationToken.pipe';
import { PasswordResetPipe } from './pipes/passwordReset.pipe';
import { PasswordResetRequestPipe } from './pipes/passwordResetRequest.pipe';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService, 
    UserUniquePipe, 
    ActivationTokenPipe, 
    PasswordResetRequestPipe, 
    PasswordResetPipe]
})
export class AuthModule {}
