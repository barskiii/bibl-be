import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ProfilePicValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    const allowecMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowecMimeTypes.includes(value.mimetype)) {
        throw new BadRequestException('Invalid file type');
    }
    if (value.size > 20000000) {
      throw new BadRequestException('File too large');
    }
    return value
  }
}