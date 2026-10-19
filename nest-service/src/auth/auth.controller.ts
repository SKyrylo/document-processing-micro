import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { SignupDto } from "./dtos/signup.dto.js";
import { LoginDto } from "./dtos/login.dto.js";
import { RefreshTokenDto } from "./dtos/refresh-token.dto.js";
import { Throttle } from "@nestjs/throttler";
import { LogoutDto } from "./dtos/logout.dto.js";


@Throttle({ default: { limit: 10, ttl: 60_000 }})
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    async signup(@Body() signupDto: SignupDto ) {
        return await this.authService.signup(signupDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return await this.authService.login(loginDto);
    }

    @Post('refresh')
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        return await this.authService.refreshTokens(refreshTokenDto.refreshToken);
    }

    @Post('logout')
    async logout(@Body() logoutDto: LogoutDto) {
        return await this.authService.logout(logoutDto);
    }
}