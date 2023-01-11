import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { TwitterService } from './twitter.service';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Tweet])],
  providers: [TwitterService],
})
export class TwitterModule {}
