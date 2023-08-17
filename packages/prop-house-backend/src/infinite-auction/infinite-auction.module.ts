import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from '../community/community.entity';
import { CommunitiesService } from '../community/community.service';
import { InfiniteAuctionProposal } from '../proposal/infauction-proposal.entity';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { InfiniteAuctionController } from './infinite-auction.controller';
import { InfiniteAuction } from './infinite-auction.entity';
import { InfiniteAuctionService } from './infinite-auction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Proposal,
      InfiniteAuction,
      InfiniteAuctionProposal,
      Community,
    ]),
  ],
  controllers: [InfiniteAuctionController],
  providers: [ProposalsService, CommunitiesService, InfiniteAuctionService],
  exports: [TypeOrmModule],
})
export class InfiniteAuctionModule {}
