import { Body, Controller, Get, Inject, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { SignupDto } from "./dtos/signup.dto.js";
import { LoginDto } from "./dtos/login.dto.js";
import { Throttle } from "@nestjs/throttler";
import { type ConfigType } from "@nestjs/config";
import jwtConfig from "../config/jwt.config.js";
import type { Request, Response } from "express";
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from "./auth-cookies.js";
import googleConfig from "../config/google.config.js";
import { GoogleAuthGuard } from "./guards/google-auth.guard.js";
import { type GoogleUser } from "./strategies/google.strategy.js";


@Throttle({ default: { limit: 10, ttl: 60_000 }})
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        @Inject(jwtConfig.KEY) private readonly jwt: ConfigType<typeof jwtConfig>,
        @Inject(googleConfig.KEY) private readonly google: ConfigType<typeof googleConfig>,
    ) {}

    private setCookies(res: Response, tokens: { accessToken: string, refreshToken: string }) {
        setAuthCookies(res, tokens, {
            accessSeconds: this.jwt.accessTokenTtl,
            refreshSeconds: this.jwt.refreshTokenTtl,
        });
    }

    @Post('signup')
    async signup(@Body() signupDto: SignupDto ) {
        return await this.authService.signup(signupDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken, userId } = await this.authService.login(loginDto);
        this.setCookies(res, { accessToken, refreshToken });
        return { userId }
    }

    @Post('refresh')
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        if (!refreshToken) {
            throw new UnauthorizedException();
        }

        const tokens = await this.authService.refreshTokens(refreshToken);
        this.setCookies(res, tokens);
        return { message: 'Token refreshed' };
    }

    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE]
        if (refreshToken) {
            await this.authService.logout(refreshToken)
        }
        clearAuthCookies(res);
        return { message: 'Logged out successfully' };
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    googleLogin() {
        //never runs: the guard redirects the browser to Google first
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleCallback(@Req() req: Request, @Res() res: Response) {
        const frontend = this.google.frontendUrl;
        const googleUser = req.user as GoogleUser;

        if (!googleUser) {
            return res.redirect(`${frontend}/login?error=google_cancelled`); //user pressed 'Cancel'
        }

        try {
            const tokens = await this.authService.loginWithGoogle(googleUser);
            this.setCookies(res, tokens);
            return res.redirect(frontend);
        } catch (error) {
            const code = (error as { status?: number }).status == 409 ? 'email_in_use' : 'google_failed';
            return res.redirect(`${frontend}/login?error=${code}`);
        }
    }
}