import { Transform } from "class-transformer";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

 export class SignupDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/^(?=.*[0-9])/, {message: 'Password must contain at least one number.'})
    password!: string;
}