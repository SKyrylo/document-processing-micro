import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { ACCESS_COOKIE } from "../auth/auth-cookies.js";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('Invalid token');
        }

        try {
            const payload = this.jwtService.verify(token);
            request.userId = payload.userId;
        } catch(e: any) {
            Logger.warn(e.message);
            throw new UnauthorizedException('Invalid token');
        }

        return true;
    }

    private extractToken(request: Request): string | undefined {
        // 1. browser clients: httpOnly cookies
        const cookieToken = request.cookies?.[ACCESS_COOKIE];
        if (cookieToken) {
            return cookieToken;
        }

        // 2. fallback for scripts or tools that send "Authorization: Bearer <token>"
        const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
        return scheme === 'Bearer' ? token : undefined;;
    }
}