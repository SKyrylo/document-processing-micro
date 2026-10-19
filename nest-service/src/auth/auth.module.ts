import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { TokenCleanupService } from "./token-cleanup.service.js";


@Module({
    controllers: [AuthController],
    providers: [AuthService, TokenCleanupService],
    imports: [],
})
export class AuthModule {}