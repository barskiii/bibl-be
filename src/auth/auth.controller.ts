import { Body, Controller, Get, Headers, Param, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Token, User } from '@prisma/client';
import { diskStorage } from 'multer';
import { RolesGuard } from 'src/guards/role.guard';
import { ProfilePicValidationPipe } from 'src/shared/pipes/profilePictureValidator.pipe';
import { diskStorageParams } from 'src/shared/utils/diskStorage';
import { AuthService } from './auth.service';
import { Roles } from './decorators/role.decorator';
import { LoginDto } from './dto/loginUser';
import { RefreshTokenDto } from './dto/refreshToken';
import { ResetPasswordDto } from './dto/resetPassword';
import { SignupUserDto } from './dto/signupUser';
import { PasswordResetPipe } from './pipes/passwordReset.pipe';
import { PasswordResetRequestPipe, } from './pipes/passwordResetRequest.pipe';
import { PasswordTokenCheckPipe } from './pipes/passwordTokenCheck.pipe';
import { ActivationTokenPipe } from './pipes/userActivationToken.pipe';
import { UserUniquePipe } from './pipes/userUnique.pipe';
import { Role } from './types/roles.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,  
  ) {}

  @Post('signup')
  @UseInterceptors(FileInterceptor('profilePicture', {storage: diskStorage(diskStorageParams)}))
  async signup(
    @UploadedFile(ProfilePicValidationPipe) profilePicture: Express.Multer.File,
    @Body(UserUniquePipe) dto: SignupUserDto
  ) {
    const user = await this.authService.signup(profilePicture, dto);
    await this.authService.sendActivationLink(user);

    return {message: 'You have successfully signed up! Check your email for activation link.'};
  }

  // Note: Activation token pipe retruns token object after validation
  @Get('activate/:token')
  async activate(@Param('token', ActivationTokenPipe) token: Token) {
    const user = await this.authService.activate(token);
    return {message: 'You have successfully activated your account!'};
  }

  //Request password reset link to user's email
  @Post('request-password-reset')
  async requestPasswordReset(@Body('email', PasswordResetRequestPipe) user: User) {
    await this.authService.requestPasswordReset(user);
    return {message: 'You have successfully requested password reset link! Check your email.'};
  }

  // Check password reset token
  @Get('check-password-reset-token/:token')
  async checkPasswordResetToken(@Param('token', PasswordTokenCheckPipe) token: string) {
    return {message: 'Token is valid!'};
  }

  //Reset user's password
  @Patch('reset-password')
  async resetPassword(@Body(PasswordResetPipe) dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return {message: 'You have successfully reseted your password!'};
  }

  // @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUserCredentials(dto.username, dto.password);
    return this.authService.loginWithCredentials(user);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh-token')
  async refreshToken(@Headers() headers, @Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(headers.authorization, dto.id);
  }

  // Auth test route
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles([Role.User, Role.Admin])
  @Get('me')
  async me(@Request() req) {
    return req.user;
  }
}
