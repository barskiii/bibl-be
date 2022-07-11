import { Body, Controller, Get, Param, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Token } from '@prisma/client';
import { diskStorage } from 'multer';
import { ProfilePicValidationPipe } from 'src/shared/pipes/profilePicture.validator';
import { diskStorageParams } from 'src/shared/utils/diskStorage';
import { AuthService } from './auth.service';
import { SignupUserDto } from './dto/signupUser';
import { ActivationTokenPipe } from './pipes/userActivationToken.pipe';
import { UserUniquePipe } from './pipes/userUnique.pipe';

@Controller('/auth')
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
  async requestPasswordReset(@Body('email') email: string) {
    const user = await this.authService.requestPasswordReset(email);
    return {message: 'You have successfully requested password reset link! Check your email.'};
  }
}
