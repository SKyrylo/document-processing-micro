import { plainToInstance } from "class-transformer";
import { IsIn, IsInt, IsNotEmpty, IsString, Min, MinLength, validateSync } from "class-validator";

class EnvironmentVariables {
    @IsString()
    @IsNotEmpty()
    DATABASE_URL!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(32, {message: 'JWT_SECRET must be at least 32 characters long'})
    JWT_SECRET!: string;

    @IsInt()
    @Min(1)
    ACCESS_TOKEN_TTL_SECONDS!: number;

    @IsInt()
    @Min(1)
    REFRESH_TOKEN_TTL_SECONDS!: number;

    @IsString()
    @IsNotEmpty()
    GOOGLE_CLIENT_ID!: string;

    @IsString()
    @IsNotEmpty()
    GOOGLE_CLIENT_SECRET!: string;

    @IsString()
    @IsNotEmpty()
    GOOGLE_CALLBACK_URL!: string;

    @IsString()
    @IsNotEmpty()
    FRONTEND_URL!: string;

    @IsIn(['test', 'production'])
    NODE_ENV!: 'test' | 'production';
}

export function validateEnv(config: Record<string, unknown>) {
    const validated = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validated);
    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validated;
}