import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResetPasswordDto } from '../dto/resetPassword';

@Injectable()
export class PasswordTokenCheckPipe implements PipeTransform {
    constructor(private prisma: PrismaService) {}
  
    async transform(token: string, metadata: ArgumentMetadata) {
        try {
            const token_instance = await this.prisma.token.findFirst({
                where: {
                    token: token,
                },
            });

            if (!token_instance) {
                throw new NotFoundException();
            } else if (token_instance.used) {
                throw new BadRequestException('Token not valid.');
            }

            return token
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}