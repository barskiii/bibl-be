import { Global, Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { ProfilePicValidationPipe } from './pipes/profilePicture.validator';

@Global()
@Module({
  providers: [SharedService, ProfilePicValidationPipe],
  exports: [ProfilePicValidationPipe],
})
export class SharedModule {}
