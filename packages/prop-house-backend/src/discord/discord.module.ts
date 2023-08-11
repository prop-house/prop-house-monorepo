import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { ProposalsService } from 'src/proposal/proposals.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from 'src/proposal/proposal.entity';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';

@Module({
  controllers: [DiscordController],
  imports: [TypeOrmModule.forFeature([Proposal, InfiniteAuction])],
  providers: [
    DiscordService,
    ProposalsService,
    ConfigService,
    InfiniteAuctionService,
  ],
})
export class DiscordModule {}
