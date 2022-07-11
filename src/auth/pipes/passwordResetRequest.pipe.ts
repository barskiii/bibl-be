import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActivationTokenPipe implements PipeTransform {
    constructor(private prisma: PrismaService) {}
  
    async transform(email: string, metadata: ArgumentMetadata) {
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    email: email,
                },
            });

            if (!user) {
                throw new NotFoundException();
            } else if (!user.active) {
                throw new BadRequestException('Activate your account first.');
            }

            return user
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}