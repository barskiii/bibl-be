import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResetPasswordDto } from '../dto/resetPassword';

@Injectable()
export class PasswordResetPipe implements PipeTransform {
    constructor(private prisma: PrismaService) {}
  
    async transform(value: ResetPasswordDto, metadata: ArgumentMetadata) {
        try {
            const token_instance = await this.prisma.token.findFirst({
                where: {
                    token: value.token,
                },
            });

            if (!token_instance) {
                throw new NotFoundException();
            } else if (token_instance.used) {
                throw new BadRequestException('Token not valid.');
            }

            return value
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}