import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { InfiniteAuction } from '../infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from '../infinite-auction/infinite-auction.service';
import { Vote } from '../vote/vote.entity';
import { InfiniteAuctionProposalsResolver } from './infauction-proposal.resolver';
import { Proposal } from './proposal.entity';
import { ProposalsResolver } from './proposal.resolver';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal, Vote, Auction, InfiniteAuction]),
  ],
  controllers: [ProposalsController],
  providers: [
    ProposalsService,
    AuctionsService,
    InfiniteAuctionService,
    ProposalsResolver,
    InfiniteAuctionProposalsResolver,
  ],
  exports: [TypeOrmModule],
})
export class ProposalsModule {}
