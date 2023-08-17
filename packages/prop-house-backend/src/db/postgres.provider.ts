import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionsModule } from '../auction/auctions.module';
import { CommunitiesModule } from '../community/community.module';
import configuration from '../config/configuration';
import { InfiniteAuctionModule } from '../infinite-auction/infinite-auction.module';
import { ProposalsModule } from '../proposal/proposals.module';
import { TasksModule } from '../task/tasks.module';
import { VotesModule } from '../vote/votes.module';
import config from '../../ormconfig';

/**
 * Import and provide base typeorm (mysql) related classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    VotesModule,
    AuctionsModule,
    ProposalsModule,
    CommunitiesModule,
    InfiniteAuctionModule,
    TasksModule,
    TypeOrmModule.forRoot(config),
  ],
})
export class PostgresDatabaseProviderModule {}
