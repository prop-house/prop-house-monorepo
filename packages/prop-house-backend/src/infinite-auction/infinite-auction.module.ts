import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { InfiniteAuctionProposal } from 'src/proposal/infauction-proposal.entity';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
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
