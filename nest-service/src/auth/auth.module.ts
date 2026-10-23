import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { TokenCleanupService } from "./token-cleanup.service.js";
import { GoogleStrategy } from "./strategies/google.strategy.js";


@Module({
    controllers: [AuthController],
    providers: [AuthService, TokenCleanupService, GoogleStrategy],
    imports: [],
})
export class AuthModule {}