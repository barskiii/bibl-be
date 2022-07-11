import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActivationTokenPipe implements PipeTransform {
    constructor(private prisma: PrismaService) {}
  
    async transform(token: string, metadata: ArgumentMetadata) {
        try {
            const tokenRecord = await this.prisma.token.findFirst({
                where: {
                    token: token,
                    type: 'activation',
                },
            });

            if (!tokenRecord) {
                throw new NotFoundException();
            } else if (tokenRecord.used) {
                throw new BadRequestException('Token already used');
            }

            return tokenRecord
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}