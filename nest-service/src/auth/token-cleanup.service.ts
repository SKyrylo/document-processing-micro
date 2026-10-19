import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DbService } from "../prisma/db.service.js";

@Injectable()
export class TokenCleanupService {
    constructor(private readonly dbService: DbService) {}

    @Cron(CronExpression.EVERY_DAY_AT_NOON)
    async deleteExpired() {
        const now = new Date().toISOString();
        const deletedRows = await this.dbService.orm.RefreshToken
        .where((t) => t.expiresAt.lt(now))
        .deleteAll();

        Logger.log(`Deleted ${deletedRows.length} expired refresh tokens`, 'TokenCleanupService');
    }
}