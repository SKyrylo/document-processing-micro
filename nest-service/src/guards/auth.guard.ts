import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

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

    private extractTokenFromHeader(request: Request): string | undefined {
        const [bearer, token] = request.headers.authorization?.split(' ') ?? [];
        if (bearer !== 'Bearer') {
            throw new UnauthorizedException('Invalid token');
        }

        return token;
    }
}