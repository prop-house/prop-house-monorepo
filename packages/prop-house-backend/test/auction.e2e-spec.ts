import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, SerializeOptions } from '@nestjs/common';
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
import { InfiniteAuctionModule } from 'src/infinite-auction/infinite-auction.module';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { Wallet } from '@ethersproject/wallet';
import {
  Direction,
  Proposal as WrapperProposal,
  Vote as WrapperVote,
} from '@nouns/prop-house-wrapper/dist/builders';
import { Proposal } from 'src/proposal/proposal.entity';
import { SignatureState } from 'src/types/signature';
import { CommunitiesModule } from 'src/community/community.module';
import { Community } from 'src/community/community.entity';
import { Vote } from 'src/vote/vote.entity';
import { parsedBodyTest, sleep, waitUntil } from './utils';
import { BLOCK_NUMBER, NULL_ADDR } from './consts';

let auctionRepository: Repository<Auction>;
let proposalRepository: Repository<Proposal>;
let communityRepository: Repository<Community>;
let voteRepository: Repository<Vote>;
let community: Community;

describe('Auctions (e2e)', () => {
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
        CommunitiesModule,
        VotesModule,
        AuctionsModule,
        ProposalsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    voteRepository = moduleFixture.get('VoteRepository');
    auctionRepository = moduleFixture.get('AuctionRepository');
    proposalRepository = moduleFixture.get('ProposalRepository');
    communityRepository = moduleFixture.get('CommunityRepository');
    await app.getHttpServer().listen(9999);
    wrapper = new PropHouseWrapper(
      'http://localhost:9999',
      Wallet.fromMnemonic(
        'test test test test test test test test test test test junk',
      ),
    );
    wrapperTwo = new PropHouseWrapper(
      'http://localhost:9999',
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

  it('Auction Lifecycle', async () => {
    await request(app.getHttpServer()).get('/auctions').expect(200).expect([]);
    expect((await wrapper.getAuctions()).length).toBe(0);

    await auctionRepository.save({
      startTime: new Date(new Date().getTime() + 1_000),
      proposalEndTime: new Date(new Date().getTime() + 2_000),
      votingEndTime: new Date(new Date().getTime() + 3_000),
      title: 'My first auction',
      currencyType: 'ETH',
      createdDate: new Date(),
      fundingAmount: 1,
      numWinners: 4,
      balanceBlockTag: BLOCK_NUMBER,
    });
    const auction = (await wrapper.getAuctions())[0];
    await auctionRepository.query(
      `UPDATE auction SET "communityId" = ${community.id} WHERE id = ${auction.id}`,
    );

    await request(app.getHttpServer())
      .get('/auctions')
      .expect(200)
      .expect(parsedBodyTest<Auction[]>((r) => r.length === 1));

    await request(app.getHttpServer())
      .get('/auctions')
      .expect(200)
      .expect(parsedBodyTest<Auction[]>((r) => r[0].proposalIds.length === 0));

    expect((await wrapper.getAuctions()).length).toBe(1);

    try {
      await wrapper.createProposal(
        new WrapperProposal(
          'A proposal that should fail',
          "This is the what bit that I'd use to describe my proposal",
          'This is the TLDR part',
          auction.id,
        ),
      );
      // Should fail, proposal window closed
      throw new Error('Should not have been able to propose yet');
    } catch {}

    // Wait for proposal window to open
    await waitUntil(auction.startTime);
    await sleep(200);

    await wrapper.createProposal(
      new WrapperProposal(
        'My title',
        "This is the what bit that I'd use to describe my proposal",
        'This is the TLDR part',
        auction.id,
      ),
    );

    const proposal = (await wrapper.getProposals())[0];

    await request(app.getHttpServer())
      .get('/auctions')
      .expect(200)
      .expect(parsedBodyTest<Auction[]>((r) => r[0].proposalIds.length === 1))
      .expect(
        parsedBodyTest<Auction[]>((r) =>
          r[0].proposalIds.includes(proposal.id),
        ),
      );

    await request(app.getHttpServer())
      .get(`/proposals/${proposal.id}`)
      .expect(200)
      .expect(parsedBodyTest<Proposal>((r) => Number(r.voteCount) === 0));

    // This isn't enforced on the backend any longer, should it be?
    // try {
    //   await wrapper.logVotes([
    //     new WrapperVote(
    //       Direction.Up,
    //       proposal.id,
    //       10,
    //       NULL_ADDR,
    //       SignatureState.PENDING_VALIDATION,
    //       BLOCK_NUMBER,
    //     ),
    //   ]);
    //   // Should not be able to vote yet
    //   throw new Error('Should hot have been able to vote');
    // } catch {}

    // Wait until voting window opens
    await waitUntil(auction.proposalEndTime);
    await sleep(200);

    await wrapper.logVotes([
      new WrapperVote(
        Direction.Up,
        proposal.id,
        10,
        NULL_ADDR,
        SignatureState.PENDING_VALIDATION,
        BLOCK_NUMBER,
      ),
    ]);

    await request(app.getHttpServer())
      .get(`/proposals/${proposal.id}`)
      .expect(200)
      .expect(parsedBodyTest<Proposal>((r) => Number(r.voteCount) === 10));

    try {
      await wrapper.logVotes([
        new WrapperVote(
          Direction.Down,
          proposal.id,
          20,
          NULL_ADDR,
          SignatureState.PENDING_VALIDATION,
          BLOCK_NUMBER,
        ),
      ]);
      throw new Error('Should not have been able to vote twice');
    } catch {}

    // Wait until voting window ends
    await waitUntil(auction.votingEndTime);
    await sleep(200);

    // This isn't enforced on the backend any longer, should it be?
    // try {
    //   await wrapperTwo.logVotes([
    //     new WrapperVote(
    //       Direction.Down,
    //       proposal.id,
    //       20,
    //       NULL_ADDR,
    //       SignatureState.PENDING_VALIDATION,
    //       BLOCK_NUMBER,
    //     ),
    //   ]);
    //   throw new Error(
    //     'Should not have been able to vote after the voting window',
    //   );
    // } catch {}

    await request(app.getHttpServer())
      .get(`/proposals/${proposal.id}`)
      .expect(200)
      .expect(parsedBodyTest<Proposal>((r) => Number(r.voteCount) === 10));
  });

  afterEach(async () => {
    await voteRepository.query('DELETE from vote;');
    await auctionRepository.query('DELETE from auction;');
    await proposalRepository.query('DELETE from proposal;');
  });

  afterAll(async () => {
    await communityRepository.query('DELETE from community');
    await app.close();
  });
});
