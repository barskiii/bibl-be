import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserUniquePipe } from './pipes/userUnique.pipe';
import { ActivationTokenPipe } from './pipes/userActivationToken.pipe';
import { PasswordResetPipe } from './pipes/passwordReset.pipe';
import { PasswordResetRequestPipe } from './pipes/passwordResetRequest.pipe';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard } from 'src/guards/jwtAuth.guard';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    UserUniquePipe, 
    ActivationTokenPipe, 
    PasswordResetRequestPipe, 
    PasswordResetPipe,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
