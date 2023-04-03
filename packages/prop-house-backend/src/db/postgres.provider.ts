import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionsModule } from 'src/auction/auctions.module';
import { CommunitiesModule } from 'src/community/community.module';
import configuration from 'src/config/configuration';
import { InfiniteAuctionModule } from 'src/infinite-auction/infinite-auction.module';
import { ProposalsModule } from 'src/proposal/proposals.module';
import { TasksModule } from 'src/task/tasks.module';
import { VotesModule } from 'src/vote/votes.module';
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
