import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LogoutDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(32, { message: 'Refresh token must be at least 32 characters long' })
    refreshToken!: string;
}