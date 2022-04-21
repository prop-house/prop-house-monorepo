import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Auction } from "src/auction/auction.entity";
import { AuctionsModule } from "src/auction/auctions.module";
import configuration from "src/config/configuration";
import { File } from "src/file/file.entity";
import { Proposal } from "src/proposal/proposal.entity";
import { ProposalsModule } from "src/proposal/proposals.module";
import { Vote } from "src/vote/vote.entity";
import { VotesModule } from "src/vote/votes.module";
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
    TypeOrmModule.forRoot(config)
  ],
})
export class PostgresDatabaseProviderModule {}