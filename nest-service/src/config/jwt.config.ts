import { registerAs } from "@nestjs/config";

export default registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET!,
    accessTokenTtl: Number(process.env.ACCESS_TOKEN_TTL_SECONDS),
    refreshTokenTtl: Number(process.env.REFRESH_TOKEN_TTL_SECONDS),
}));