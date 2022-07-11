import { Body, Controller, Get, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProfilePicValidationPipe } from 'src/shared/pipes/profilePicture.validator';
import { diskStorageParams } from 'src/shared/utils/diskStorage';
import { AuthService } from './auth.service';
import { SignupUserDto } from './dto/signupUser';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('hello')
  hello() {
    return {msg: 'Hello World!'};
  }

  @Post('signup')
  @UseInterceptors(FileInterceptor('profilePicture', {storage: diskStorage(diskStorageParams)}))
  async signup(
    @UploadedFile(new ProfilePicValidationPipe()) profilePicture: Express.Multer.File,
    @Body() dto: SignupUserDto
  ) {
    const user = await this.authService.signup(profilePicture, dto);
    await this.authService.sendActivationLink(user);

    return {message: 'You have successfully signed up! Check your email for activation link.'};
  }
}
