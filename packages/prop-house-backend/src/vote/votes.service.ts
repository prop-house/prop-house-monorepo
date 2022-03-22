import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';
import { CreateVoteDto } from './vote.types';
import { Proposal } from 'src/proposal/proposal.entity';
import { isDevEnv } from 'src/config/configuration';
import { ethers } from 'ethers';
import { DelegatedVotes, VoteType } from 'src/utils/vote';
import config from 'src/config/configuration';
import { getNounerVotes, getNounishVotes } from 'prop-house-nounish-contracts';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}

  async findAll(): Promise<Vote[]> {
    const proposals = await this.votesRepository.find();
    return proposals;
  }

  async findAllByAuctionId(auctionId: number): Promise<Vote[]> {
    return await this.votesRepository.find({ where: { auctionId } });
  }

  findOne(id: number): Promise<Vote> {
    return this.votesRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.votesRepository.delete(id);
  }

  async store(vote: Vote) {
    return this.votesRepository.save(vote);
  }

  async findByAddress(address: string) {
    return this.votesRepository.find({
      relations: ['proposal'],
      where: { address },
    });
  }

  async getNumDelegatedVotes(address: string): Promise<DelegatedVotes> {
    const nounerVotes = await getNounerVotes(address);
    if (nounerVotes > 0) return { votes: nounerVotes, type: VoteType.Nouner };

    const provider = new ethers.providers.JsonRpcProvider(config().JSONRPC);
    const nounishVotes = await getNounishVotes(address, provider);
    if (nounishVotes > 0)
      return { votes: nounishVotes, type: VoteType.Nounish };

    return { votes: 0, type: VoteType.Nounish };
  }

  async createNewVote(
    createVoteDto: CreateVoteDto,
    proposal: Proposal,
    voteType: VoteType,
  ) {
    // Create vote for proposal
    const vote = new Vote();
    vote.address = createVoteDto.address;
    vote.proposal = proposal;
    vote.direction = createVoteDto.direction;
    vote.signedData = createVoteDto.signedData;
    vote.type = voteType;
    vote.auctionId = proposal.auctionId;

    // Store the new vote
    await this.store(vote);

    return vote;
  }
}
