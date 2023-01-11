import { Auction } from 'src/auction/auction.entity';
import { SendTweetV2Params } from 'twitter-api-v2';
import { TRequestBody } from 'twitter-api-v2/dist/types/request-maker.mixin.types';

export type TweetableContents = [string, SendTweetV2Params | undefined];

export abstract class Tweetable {
  abstract tweetContents(): Promise<TweetableContents>;
}

export abstract class AuctionTweetable extends Tweetable {
  public readonly auction: Auction;
}
