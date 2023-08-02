import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcomeMessage(): string {
    return this.appService.getWelcomeMessage();
  }

  /**
   * An endpoint for testing API rate limiting with a more
   * aggressive limit.
   */
  @Throttle(5, 5)
  @Get('limit-test')
  getLimitTest(@Req() req: Request): string {
    return JSON.stringify([req.ips, req.ip]);
  }
}
