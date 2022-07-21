import { IsNotEmpty } from "class-validator";

export class RefreshTokenDto {
    @IsNotEmpty()
    id: string;
}