import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SendTweetV2Params,
  TwitterApi,
} from 'twitter-api-v2';

@Injectable()
export class TwitterClientService {
  private twitter: TwitterApi;
  private readonly logger = new Logger(TwitterClientService.name);

  constructor(
    private readonly config: ConfigService,
  ) {
    if (this.config.get<boolean>('social.twitter.enabled')) {
      this.logger.verbose('Creating TwitterAPI Client');
      this.twitter = new TwitterApi({
        appKey: this.config.get<string>('social.twitter.appKey'),
        appSecret: this.config.get<string>('social.twitter.appSecret'),
        accessToken: this.config.get<string>('social.twitter.accessToken'),
        accessSecret: this.config.get<string>('social.twitter.accessSecret'),
      });
    }
  }

  public async tweet(status: string, payload?: SendTweetV2Params) {
    this.logger.verbose('Tweeting', status, payload);
    const twitterResponse = await this.twitter.v2.tweet(status, payload);
    return twitterResponse;
  }
}
