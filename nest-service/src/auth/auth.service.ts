import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { SignupDto } from "./dtos/signup.dto.js";
import * as bcrypt from "bcrypt";
import { LoginDto } from "./dtos/login.dto.js";
import { JwtService } from "@nestjs/jwt";
import { DbService } from "../prisma/db.service.js";
import { v4 as uuidv4 } from "uuid";
import type { ConfigType } from "@nestjs/config";
import jwtConfig from "../config/jwt.config.js";
import { createHash } from "node:crypto";
import { type GoogleUser } from "./strategies/google.strategy.js";


@Injectable()
export class AuthService {
    constructor(
        @Inject(jwtConfig.KEY) private readonly jwt: ConfigType<typeof jwtConfig>,
        private jwtService: JwtService,
        private readonly dbService: DbService,
    ) {}

    async signup(signupDto: SignupDto) {
        const { email, password } = signupDto;
        const emailInUse = await this.dbService.orm.User.where({ email }).first();

        if (emailInUse) {
            throw new ConflictException("Email already in use");
        }

        const hashedPassword = await bcrypt.hash(password, 11);

        try {
            const user = await this.dbService.orm.User.create({ email, password: hashedPassword })
            return {
                createdAt: user.createdAt,
                id: user.id,
                email: user.email,
                updatedAt: user.updatedAt,
            }
        } catch (error) {
            if (this.isEmailTaken(error)) {
                throw new ConflictException("Email already in use");
            }
            throw error;
        }
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const user = await this.dbService.orm.User.where({ email }).first();
        
        const hash = user?.password ?? this.dummyHash;
        const isPasswordValid = await bcrypt.compare(password, hash);

        if (!user || !isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials.")
        }

        const tokens = await this.generateUserTokens(user.id);

        return {
            ...tokens,
            userId: user.id,
        }
    }

    async logout(refreshToken: string) {
        const hashedToken = createHash('sha256').update(refreshToken).digest('hex');
        await this.dbService.orm.RefreshToken.where({ hashedToken }).delete();
    }

    async loginWithGoogle(google: GoogleUser) {
        // 1. This Google account has logged in before -> same user again
        const account = await this.dbService.orm.Account
            .where({ provider: 'google', providerAccountId: google.googleId })
            .first();

        if (account) {
            return this.generateUserTokens(account.userId);
        }

        // 2. First Google login: we need an email that Google has verified
        if (!google.email || !google.emailVerified) {
            throw new UnauthorizedException('Google email is not verified');
        }

        // 3. That email already has a password account -> do NOT merge automatically
        const existing = await this.dbService.orm.User.where({ email: google.email }).first();
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        // 4. Create user + account together (both succeed or both are rolled back)
        try {
            const user = await this.dbService.client.transaction(async (tx) => {
                const created = await tx.orm.public.User.create({ email: google.email! });
                await tx.orm.public.Account.create({
                    provider: 'google',
                    providerAccountId: google.googleId,
                    userId: created.id,
                });
                return created;
            });
            return this.generateUserTokens(user.id);
        } catch (error) {
            if (this.isEmailTaken(error)) {
                throw new ConflictException('Email already registered');
            }
            throw error;
        }
    }

    async refreshTokens(refreshToken: string) {
        const hashedToken = createHash('sha256').update(refreshToken).digest('hex');
        const now = new Date().toISOString();
        
        const token = await this.dbService.orm.RefreshToken
        .where({ hashedToken })
        .where((t) => t.expiresAt.gt(now))
        .delete();

        if (!token) {
            throw new UnauthorizedException();
        }

        return this.generateUserTokens(token.userId);
    }

    async generateUserTokens(userId: number) {
        const accessToken = this.jwtService.sign({ userId })
        const refreshToken = uuidv4();
        const expiresAt = new Date(Date.now() + this.jwt.refreshTokenTtl * 1000).toISOString();
        
        await this.storeRefreshToken(userId, refreshToken, expiresAt);

        return {
            accessToken,
            refreshToken,
        }
    }

    async storeRefreshToken(userId: number, token: string, expiresAt: string) {
        const hashedToken = createHash('sha256').update(token).digest('hex');
        await this.dbService.orm.RefreshToken.create({
            hashedToken,
            userId,
            expiresAt
        })
    }

    private isEmailTaken(error: unknown): boolean {
        const e = error as { sqlState?: string; constraint?: string } | null;
        return e?.sqlState === '23505' && e?.constraint === 'User_email_key';
    }

    private readonly dummyHash = bcrypt.hashSync('dummy-hash', 11);
}