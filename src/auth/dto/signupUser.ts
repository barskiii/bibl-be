import { IsAlpha, IsAlphanumeric, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

class SignupUserDto {
    @IsNotEmpty()
    @IsAlpha()
    @MaxLength(30)
    name: string

    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    username: string

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string

    @IsNotEmpty()
    @MaxLength(13)
    @MinLength(13)
    jmbg: string
}