import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserUniquePipe implements PipeTransform {
    constructor(private prisma: PrismaService) {}
  
    async transform(value: any, metadata: ArgumentMetadata) {
        try {
            const { email, username } = value;
            const uEmail = await this.prisma.user.findFirst({ where: { email } });
            if (uEmail) {
                throw new BadRequestException('Email already exists');
            }
            const uUsername = await this.prisma.user.findFirst({ where: { username } });
            if (uUsername) {
                throw new BadRequestException('Username already taken');
            }
            return value;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}