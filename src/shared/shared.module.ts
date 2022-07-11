import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { ProfilePicValidationPipe } from './pipes/profilePicture.validator';

@Module({
  providers: [SharedService],
})
export class SharedModule {}
