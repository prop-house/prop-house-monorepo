import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { PinataClient, PinataPinOptions } from '@pinata/sdk';
import { AuctionClosedEvent } from 'src/auction/events/auction-closed.event';
import { AuctionCreatedEvent } from 'src/auction/events/auction-created.event';
import { AuctionOpenEvent } from 'src/auction/events/auction-open.event';
import { AuctionProposalEndingSoonEvent } from 'src/auction/events/auction-proposal-end-soon.event';
import { AuctionVotingEndingSoonEvent } from 'src/auction/events/auction-vote-end-soon.event';
import { AuctionVotingEvent } from 'src/auction/events/auction-voting.event';
import { EventStatus } from 'src/auction/types';
import { ProposalCreatedEvent } from 'src/proposal/events/proposal-created.event';
import {
  SendTweetV2Params,
  TweetV2PostTweetResult,
  TwitterApi,
} from 'twitter-api-v2';
import { Repository } from 'typeorm';
import { Tweet } from './tweet.entity';
import { TwitterClientService } from './twitter-client.service';
import { AuctionTweetable, Tweetable, TweetableContents } from './types';

@Injectable()
export class TwitterService {
  private readonly logger = new Logger(TwitterService.name);

  constructor(
    private readonly events: EventEmitter2,
    private readonly twitterClient: TwitterClientService,
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
  ) {

    // Not enabling Proposal tweeting at this time
    // this.events.on(
    //   ProposalCreatedEvent.name,
    //   this._tweetEventHandler<ProposalCreatedEvent>
    // );

    this.events.on(
      AuctionCreatedEvent.name,
      this._tweetAuctionEventFactory(AuctionCreatedEvent.EventStatus),
    );

    this.events.on(
      AuctionOpenEvent.name,
      this._tweetAuctionEventFactory(AuctionOpenEvent.EventStatus),
    );

    this.events.on(
      AuctionVotingEvent.name,
      this._tweetAuctionEventFactory(AuctionVotingEvent.EventStatus),
    );

    this.events.on(
      AuctionClosedEvent.name,
      this._tweetAuctionEventFactory(AuctionClosedEvent.EventStatus),
    );

    this.events.on(
      AuctionProposalEndingSoonEvent.name,
      this._tweetAuctionEventFactory(
        AuctionProposalEndingSoonEvent.EventStatus,
      ),
    );

    this.events.on(
      AuctionVotingEndingSoonEvent.name,
      this._tweetAuctionEventFactory(AuctionVotingEndingSoonEvent.EventStatus),
    );
  }

  private _logAuctionTweet = async (
    eventName: EventStatus,
    event: AuctionTweetable,
    tweet: TweetV2PostTweetResult,
  ) => {
    return this.tweetRepository.save({
      eventName,
      parentEntity: 'Auction',
      parentEntityId: event.auction.id,
      tweetId: tweet.data.id,
      createdDate: new Date(),
    });
  };

  private _tweetAuctionEventFactory =
    (eventName: EventStatus) =>
    async <T extends AuctionTweetable>(event: T) => {
      const twitterResponse = await this._tweetFromTweetable(
        await event.tweetContents(),
      );
      await this._logAuctionTweet(eventName, event, twitterResponse);
      return twitterResponse;
    };

  private _tweetFromTweetable(contents: TweetableContents) {
    return this._tweet(contents[0], contents[1]);
  }

  private async _tweet(status: string, payload?: SendTweetV2Params) {
    const twitterResponse = await this.twitterClient.tweet(status, payload);
    return twitterResponse;
  }
}
