import { IsAlpha, IsAlphanumeric, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class SignupUserDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    name: string

    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    username: string

    @IsNotEmpty()
    password: string

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string

    @IsNotEmpty()
    @MaxLength(13)
    @MinLength(13)
    jmbg: string
}