import { Inject, Injectable } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { type Profile, Strategy } from "passport-google-oauth20";
import googleConfig from "../../config/google.config.js";


// What the rest of the app receives as 'req.user' after Google login succeeds
export interface GoogleUser {
    googleId: string;
    email: string | null;
    emailVerified: boolean;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(@Inject(googleConfig.KEY) google: ConfigType<typeof googleConfig>) {
        super({
            clientID: google.clientId,
            clientSecret: google.clientSecret,
            callbackURL: google.callbackUrl,
            scope: ['openid', 'email', 'profile'],
        });
    }

    // Runs after Google confirmed the user. Whatever is returned becomes 'req.user'
    validate(_accessToken: string, _refreshToken: string, profile: Profile): GoogleUser {
        const email = profile.emails?.[0];
        return {
            googleId: profile.id,
            email: email?.value ?? null,
            emailVerified: Boolean(profile._json?.email_verified ?? email?.verified),
        };
    }
}