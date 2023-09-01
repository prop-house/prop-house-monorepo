import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcomeMessage(): string {
    return this.appService.getWelcomeMessage();
  }

  @Get('limit-test')
  getLimitTest(@Req() req: Request): string {
    return JSON.stringify([req.ips, req.ip]);
  }
}
