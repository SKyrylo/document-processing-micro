import { Injectable } from '@nestjs/common';
import { DbService } from './prisma/db.service.js';


@Injectable()
export class AppService {
  constructor(
    private readonly dbService: DbService,
  ) {}
}
