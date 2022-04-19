import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsModule } from 'src/auction/auctions.module';
import { Community } from 'src/community/community.entity';
import { CommunitiesModule } from 'src/community/community.module';
import configuration from 'src/config/configuration';
import { File } from 'src/file/file.entity';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsModule } from 'src/proposal/proposals.module';
import { Vote } from 'src/vote/vote.entity';
import { VotesModule } from 'src/vote/votes.module';

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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'example',
      database: process.env.DB_NAME || 'postgres',
      entities: [Vote, Proposal, Auction, File, Community],
      synchronize: true,
    }),
  ],
})
export class PostgresDatabaseProviderModule {}
