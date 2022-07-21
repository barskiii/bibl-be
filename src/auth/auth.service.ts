import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtToken, Token, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupUserDto } from './dto/signupUser';
import * as argon2 from 'argon2';
import * as nodemailer from 'nodemailer';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwtPayload.interface';
import { LoginResponse } from './strategy/loginResponse.interface';
import { RefreshToken } from './types/refresh_token.interface';
@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
        private jwtTokenService: JwtService
    ) {}

    //Hash the password with argon2, create user from User model and return user
    async signup(profilePicture: Express.Multer.File, dto: SignupUserDto): Promise<User> {
        const hashedPassword = await argon2.hash(dto.password);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                username: dto.username,
                email: dto.email,
                password: hashedPassword,
                jmbg: dto.jmbg,
                photo: profilePicture.filename,
            }
        });
        return user;
    }

    // Send activation link to user's email
    async sendActivationLink(user: User): Promise<void> {
        // Create activation token for user and save it to database
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

        const activationToken = await this.prisma.token.create({
            data: {
                userId: user.id,
                token: token,
                type: 'activation',
                expiresAt: moment().add(1, 'M').toDate(),
            },
        });

        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: "smtp.mail.yahoo.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: this.config.get('EMAIL_USERNAME'), // generated ethereal user
                pass: this.config.get('EMAIL_PASSWORD'), // generated ethereal password
            },
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Bibl Library 📚" <andrija.joksimovic@yahoo.com>', // sender address
            to: `${user.email}`, // list of receivers
            subject: "Account activation token", // Subject line
            text: `Here's your token: ${token}`, // plain text body
        });
    }

    // Activate user account
    async activate(token: Token): Promise<void> {
        const user = await this.prisma.user.update({
            where: {
                id: token.userId,
            },
            data: {
                active: true,
            },
        });

        await this.prisma.token.update({
            where: {
                id: token.id,
            },
            data: {
                used: true,
            }
        });
    }

    // Request password reset link to user's email
    async requestPasswordReset(user: User): Promise<void> {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        
        const activationToken = await this.prisma.token.create({
            data: {
                userId: user.id,
                token: token,
                type: 'passwordReset',
                expiresAt: moment().add(1, 'M').toDate(),
            },
        });

        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: "smtp.mail.yahoo.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: this.config.get('EMAIL_USERNAME'), // generated ethereal user
                pass: this.config.get('EMAIL_PASSWORD'), // generated ethereal password
            },
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Bibl Library 📚" <andrija.joksimovic@yahoo.com>', // sender address
            to: `${user.email}`, // list of receivers
            subject: "Password reset", // Subject line
            text: `Here's your password reset token: ${token}`, // plain text body
        });
    }

    // Reset user's password
    async resetPassword(dto): Promise<void> {
        const hashedPassword = await argon2.hash(dto.password);

        const token = await this.prisma.token.findFirst({
            where: {
                token: dto.token,
                type: 'passwordReset',
                used: false,
            },
        });

        const user = await this.prisma.user.update({
            where: {
                id: token.userId,
            },
            data: {
                password: hashedPassword,
            },
        });

        await this.prisma.token.update({
            where: {
                id: token.id,
            },
            data: {
                used: true,
            }
        });
    }

    // push refresh token to database
    async pushRefreshToken(payload: JwtPayload, user: User): Promise<RefreshToken> {
        const refresh_token = this.jwtTokenService.sign(payload, {expiresIn: '7d', secret: this.config.get('JWT_REFRESH_SECRET')})
        // add jwt refresh token to database
        const hashedToken = await argon2.hash(refresh_token);
        
        const record = await this.prisma.jwtToken.create({
            data: {
                userId: user.id,
                token: hashedToken,
            }
        });

        return {token: refresh_token, id: record.id};
    }


    async validateUserCredentials(username: string, password: string): Promise<User> {
        const user = await this.prisma.user.findFirst({
            where: {
                username: username,
            },
        });

        if (user && await argon2.verify(user.password, password)) {
            return user
        }
        throw new BadRequestException('Invalid credentials');
    }

    async loginWithCredentials(user: any): Promise<LoginResponse> {
        const payload = { email: user.email, sub: user.id };

        const refresh_token = await this.pushRefreshToken(payload, user)

        return {
            access_token: this.jwtTokenService.sign(payload, {expiresIn: '1m', secret: this.config.get('JWT_SECRET')}),
            refresh_token: refresh_token.token,
            refresh_token_id: refresh_token.id,
        };
    }

    async refreshToken(refreshTokenFromHeader: string, refreshTokenId: string): Promise<LoginResponse> {
        const refreshTokenRecord = await this.prisma.jwtToken.findFirst({
            where: {
                id: refreshTokenId,
            },
            include: {
                user: true,
            },
        });

        if (!(refreshTokenRecord && await argon2.verify(refreshTokenRecord.token, refreshTokenFromHeader.split(' ')[1]))) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const payload = { email: refreshTokenRecord.user.email, sub: refreshTokenRecord.user.id };
        
        await this.prisma.jwtToken.delete({
            where: {
                id: refreshTokenRecord.id,
            },
        });

        const newRefreshToken = await this.pushRefreshToken(payload, refreshTokenRecord.user)

        return {
            access_token: this.jwtTokenService.sign(payload, {expiresIn: '1m', secret: this.config.get('JWT_SECRET')}),
            refresh_token: newRefreshToken.token,
            refresh_token_id: newRefreshToken.id,
        };
    }
}