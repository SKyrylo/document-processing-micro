import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { db } from "./db.js";

@Injectable()
export class DbService implements OnModuleDestroy{
    readonly orm = db.orm.public
    readonly client = db;

    async onModuleDestroy() {
        await db.close();
    }
}