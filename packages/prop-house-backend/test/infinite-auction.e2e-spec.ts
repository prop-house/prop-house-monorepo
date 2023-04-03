import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { VotesModule } from 'src/vote/votes.module';
import { AuctionsModule } from 'src/auction/auctions.module';
import { ProposalsModule } from 'src/proposal/proposals.module';
import { Repository } from 'typeorm';
import { Auction } from 'src/auction/auction.entity';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { Proposal } from 'src/proposal/proposal.entity';
import { InfiniteAuctionModule } from 'src/infinite-auction/infinite-auction.module';
import { parsedBodyTest, sleep, waitUntil } from './utils';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { Community } from 'src/community/community.entity';
import { Vote } from 'src/vote/vote.entity';
import { Wallet } from '@ethersproject/wallet';
import {
  Direction,
  InfiniteAuctionProposal as WrapperProposal,
  SignatureState,
  Vote as WrapperVote,
} from '@nouns/prop-house-wrapper/dist/builders';
import { BLOCK_NUMBER, NULL_ADDR } from './consts';
import { InfiniteAuctionProposal } from 'src/proposal/infauction-proposal.entity';

let infiniteAuctionRepository: Repository<InfiniteAuction>;
let proposalRepository: Repository<Proposal>;
let communityRepository: Repository<Community>;
let voteRepository: Repository<Vote>;
let community: Community;

describe('Infinite Auctions (e2e)', () => {
  let app: INestApplication;
  let wrapper: PropHouseWrapper;
  let wrapperTwo: PropHouseWrapper;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'example',
          database: 'postgres',
          entities: ['../**/*.entity.ts'],
          synchronize: false,
        }),
        InfiniteAuctionModule,
        VotesModule,
        AuctionsModule,
        ProposalsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    voteRepository = moduleFixture.get('VoteRepository');
    infiniteAuctionRepository = moduleFixture.get('InfiniteAuctionRepository');
    proposalRepository = moduleFixture.get('InfiniteAuctionProposalRepository');
    communityRepository = moduleFixture.get('CommunityRepository');
    await app.getHttpServer().listen(9998);
    wrapper = new PropHouseWrapper(
      'http://localhost:9998',
      Wallet.fromMnemonic(
        'test test test test test test test test test test test junk',
      ),
    );
    wrapperTwo = new PropHouseWrapper(
      'http://localhost:9998',
      Wallet.fromMnemonic(
        'test test test test test test test test test test test junk',
        "m/44'/60'/0'/0/1",
      ),
    );
    await communityRepository.save({
      contractAddress: NULL_ADDR,
      name: 'Test House',
      profileImageUrl: '',
      createdDate: new Date(),
    });
    community = await communityRepository.findOneOrFail();
  });

  it('/infinite-auction', async () => {
    await request(app.getHttpServer())
      .get('/infinite-auctions')
      .expect(200)
      .expect([]);

    // A start time that's 3 seconds from now
    const startTime = new Date(new Date().getTime() + 3_000);

    let storedAuction = await infiniteAuctionRepository.save({
      visible: true,
      startTime,
      title: 'My first infinite auction',
      description: 'This is an infinite auction that was automatically created',
      fundingAmount: 10,
      currencyType: 'ETH',
      quorum: 2,
      createdDate: new Date(),
      lastUpdatedDate: new Date(),
      balanceBlockTag: BLOCK_NUMBER,
    });
    await infiniteAuctionRepository.query(
      `UPDATE infinite_auction SET "communityId" = ${community.id} WHERE id = ${storedAuction.id}`,
    );

    await request(app.getHttpServer())
      .get('/infinite-auctions')
      .expect(200)
      .expect(
        parsedBodyTest<InfiniteAuction[]>(
          (r: InfiniteAuction[]) => r.length === 1,
        ),
      );

    let auction = await infiniteAuctionRepository.findOne({
      relations: ['proposals'],
    });

    expect(auction.isAcceptingProposals()).toBe(false);

    try {
      await wrapper.createProposal(
        new WrapperProposal(
          'A proposal that should fail',
          "This is the what bit that I'd use to describe my proposal",
          'This is the TLDR part',
          auction.id,
          4.2,
        ),
      );
      // Should fail, proposal window closed
      throw new Error('Should not have been able to propose yet');
    } catch {}

    await request(app.getHttpServer())
      .get(`/infinite-auctions/${auction.id}`)
      .expect(200)
      .expect(
        parsedBodyTest<InfiniteAuction>(
          (r: InfiniteAuction) => r.proposals.length === 0,
        ),
      );

    // Wait until the open time
    await waitUntil(startTime);
    await sleep(200);
    expect(auction.isAcceptingProposals()).toBe(true);

    await wrapper.createProposal(
      new WrapperProposal(
        'My Infinite Round title',
        "This is the what bit that I'd use to describe my proposal",
        'This is the TLDR part',
        auction.id,
        4.2,
      ),
    );
    let proposal = await proposalRepository.findOne();

    await request(app.getHttpServer())
      .get('/infinite-auctions')
      .expect(200)
      .expect(
        parsedBodyTest<InfiniteAuction[]>(
          (r: InfiniteAuction[]) => r.length === 1,
        ),
      );

    await request(app.getHttpServer())
      .get(`/infinite-auctions/${auction.id}`)
      .expect(200)
      .expect(
        parsedBodyTest<InfiniteAuction>(
          (r: InfiniteAuction) => r.proposals.length === 1,
        ),
      );

    await request(app.getHttpServer())
      .get(`/proposals/${proposal.id}`)
      .expect(200)
      .expect(
        parsedBodyTest<InfiniteAuctionProposal>(
          (r: InfiniteAuctionProposal) => r.auctionId === auction.id,
        ),
      )
      .expect(
        parsedBodyTest<InfiniteAuctionProposal>(
          (r: InfiniteAuctionProposal) => r.auction.id === auction.id,
        ),
      );

    auction = await infiniteAuctionRepository.findOne({
      relations: ['proposals'],
    });
    expect(Number(auction.fundingAmount)).toBe(10);
    expect(auction.proposalIds.length).toBe(1);
    expect(await auction.fundedProposals()).toStrictEqual([]);
    expect(await auction.fundingUsed()).toBe(0);

    await wrapper.logVotes([
      new WrapperVote(
        Direction.Up,
        proposal.id,
        20,
        NULL_ADDR,
        SignatureState.PENDING_VALIDATION,
        BLOCK_NUMBER,
      ),
    ]);

    auction = await infiniteAuctionRepository.findOne({
      relations: ['proposals'],
    });
    proposal = await proposalRepository.findOne(proposal.id);
    expect(Number(auction.fundingAmount)).toBe(10);
    expect(auction.proposalIds.length).toBe(1);
    expect(await auction.fundedProposals()).toStrictEqual([proposal]);
    expect(await auction.fundingUsed()).toBe(Number(proposal.reqAmount));
  });

  afterEach(async () => {
    await voteRepository.query('DELETE from vote;');
    await proposalRepository.query('DELETE from proposal;');
    await infiniteAuctionRepository.query('DELETE from infinite_auction');
  });

  afterAll(async () => {
    await app.close();
  });
});
