import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { InfiniteAuction } from '../infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from '../infinite-auction/infinite-auction.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { Vote } from './vote.entity';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote, Proposal, Auction, InfiniteAuction]),
  ],
  controllers: [VotesController],
  providers: [
    VotesService,
    ProposalsService,
    AuctionsService,
    InfiniteAuctionService,
  ],
  exports: [TypeOrmModule],
})
export class VotesModule {}
