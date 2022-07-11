import { Injectable, NotFoundException } from '@nestjs/common';
import { Token, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupUserDto } from './dto/signupUser';
import * as argon2 from 'argon2';
import * as nodemailer from 'nodemailer';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
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
    async requestPasswordReset(email: string): Promise<void> {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        
        const activationToken = this.prisma.token.create({
            data: {
                userId: email,
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
            to: `${email}`, // list of receivers
            subject: "Account activation token", // Subject line
            text: `Here's your password reset token: ${token}`, // plain text body
        });
    }
}
