import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PinataClient, PinataPinOptions } from '@pinata/sdk';
import { AuctionClosedEvent } from 'src/auction/events/auction-closed.event';
import { AuctionCreatedEvent } from 'src/auction/events/auction-created.event';
import { AuctionOpenEvent } from 'src/auction/events/auction-open.event';
import { AuctionProposalEndingSoonEvent } from 'src/auction/events/auction-proposal-end-soon.event';
import { AuctionVotingEndingSoonEvent } from 'src/auction/events/auction-vote-end-soon.event';
import { AuctionVotingEvent } from 'src/auction/events/auction-voting.event';
import { ProposalCreatedEvent } from 'src/proposal/events/proposal-created.event';
import { SendTweetV2Params, TwitterApi } from 'twitter-api-v2';
import { Tweetable, TweetableContents } from './types';

@Injectable()
export class TwitterService {
  private twitter: TwitterApi;
  private readonly logger = new Logger(TwitterService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly events: EventEmitter2,
  ) {
    const apiKey = this.config.get<string>('PINATA_API_KEY');
    const apiSecret = this.config.get<string>('PINATA_API_SECRET');
    if (this.config.get<boolean>('social.twitter.enabled')) {
      this.logger.verbose('Creating TwitterAPI Client');
      this.twitter = new TwitterApi({
        appKey: this.config.get<string>('social.twitter.appKey'),
        appSecret: this.config.get<string>('social.twitter.appSecret'),
        accessToken: this.config.get<string>('social.twitter.accessToken'),
        accessSecret: this.config.get<string>('social.twitter.accessSecret'),
      });
    }

    // Not enabling Proposal tweeting at this time
    // this.events.on(
    //   ProposalCreatedEvent.name,
    //   this._tweetEventHandler<ProposalCreatedEvent>
    // );

    this.events.on(
      AuctionCreatedEvent.name,
      this._tweetEvent
    );

    this.events.on(
      AuctionOpenEvent.name, 
      this._tweetEvent
    );

    this.events.on(
      AuctionVotingEvent.name,
      this._tweetEvent
    );

    this.events.on(
      AuctionClosedEvent.name,
      this._tweetEvent
    );

    this.events.on(
      AuctionProposalEndingSoonEvent.name,
      this._tweetEvent
    );

    this.events.on(
      AuctionVotingEndingSoonEvent.name,
      this._tweetEvent
    );
  }

  private _tweetEvent = async <T extends Tweetable>(event: T) => {
      await this._tweetFromTweetable(await event.tweetContents());
    };

  private _tweetFromTweetable(contents: TweetableContents) {
    return this._tweet(contents[0], contents[1]);
  }

  private _tweet(status: string, payload?: SendTweetV2Params) {
    this.logger.verbose('Would tweet', status, payload);
    this.twitter.v2.tweet(status, payload);
  }
}
