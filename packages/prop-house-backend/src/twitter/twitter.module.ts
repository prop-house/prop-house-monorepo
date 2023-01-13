import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { TwitterClientService } from './twitter-client.service';
import { TwitterService } from './twitter.service';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Tweet])],
  providers: [TwitterClientService, TwitterService],
})
export class TwitterModule {}
