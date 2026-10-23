import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AuthGuard } from './guards/auth.guard.js';

@UseGuards(AuthGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('me')
  me(@Req() req: { userId: number }) {
    return { userId: req.userId };
  }
}
