import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwitterService } from './twitter.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [TwitterService],
})
export class TwitterModule {}
