import { Tweetable, TweetableContents } from 'src/twitter/types';
import { SendTweetV2Params } from 'twitter-api-v2';
import { Auction } from '../auction.entity';
import { EventStatus } from '../types';

export class AuctionVotingEvent implements Tweetable {
  public static EventStatus: EventStatus = 'auctionVoting';

  constructor(private readonly auction: Auction) {}

  async tweetContents(): Promise<TweetableContents> {
    return [
      `The Prop House Round ${this.auction.title} is now open for voting!
      
${this.auction.url()}`,
      undefined,
    ];
  }
}
