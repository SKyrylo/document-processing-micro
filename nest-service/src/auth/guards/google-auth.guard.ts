import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";

const STATE_COOKIE = 'oauth_state';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    // Step 1 (/auth/google): create a random "state", remember it in a cookie and send to Google
    getAuthenticateOptions(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest<Request>();
        if (req.query.code || req.query.error) {
            return {};
        }

        const state = randomBytes(16).toString('hex');
        context.switchToHttp().getResponse<Response>().cookie(STATE_COOKIE, state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/auth/google',
            maxAge: 10 * 60 * 1000,
        });
        return { state };
    }

    // Step 2 (/auth/google/callback): Google sends the same state back. It must match our cookie.
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();

        if (req.query.code || req.query.error) {
            const expected = req.cookies?.[STATE_COOKIE];
            if (!expected || expected !== req.query.state) {
                throw new UnauthorizedException('Invalid OAuth state');
            } 
            if (req.query.error) {
                return true;
            }
        }

        return (await super.canActivate(context) as boolean);
    }
}