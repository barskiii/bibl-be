import { Global, Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { ProfilePicValidationPipe } from './pipes/profilePictureValidator.pipe';

@Global()
@Module({
  providers: [SharedService, ProfilePicValidationPipe],
  exports: [ProfilePicValidationPipe],
})
export class SharedModule {}
