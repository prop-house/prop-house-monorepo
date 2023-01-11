import { Tweetable, TweetableContents } from 'src/twitter/types';
import { tweetDate } from 'src/utils';
import { SendTweetV2Params } from 'twitter-api-v2';
import { Auction } from '../auction.entity';
import { EventStatus } from '../types';

export class AuctionProposalEndingSoonEvent implements Tweetable {
  public static EventStatus: EventStatus = 'auctionProposalEndingSoon';

  constructor(private readonly auction: Auction) {}

  async tweetContents(): Promise<TweetableContents> {
    return [
      `${this.auction.community.name} ${this.auction.title} proposal window is ending soon: 

- Proposing closes at ${tweetDate(this.auction.proposalEndTime)} 
- ${this.auction.numWinners} winners will be awarded ${this.auction.fundingAmount} ${this.auction.currencyType ?? "ETH"}. 

Submit your prop! ${this.auction.url()}`,
      undefined,
    ];
  }
}
