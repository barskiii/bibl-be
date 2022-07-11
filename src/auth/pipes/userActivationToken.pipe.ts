import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, NotFoundException } from '@nestjs/common';
import moment from 'moment';
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
            } else if (moment().isAfter(tokenRecord.expiresAt)) {
                throw new BadRequestException('Token expired');
            }

            return tokenRecord
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}