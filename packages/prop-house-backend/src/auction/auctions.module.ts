import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Auction } from './auction.entity';
import { AuctionsResolver } from './auction.resolver';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Proposal, Community, InfiniteAuction]),
  ],
  controllers: [AuctionsController],
  providers: [
    AuctionsService,
    ProposalsService,
    AuctionsResolver,
    CommunitiesService,
    InfiniteAuctionService,
  ],
  exports: [TypeOrmModule],
})
export class AuctionsModule {}
