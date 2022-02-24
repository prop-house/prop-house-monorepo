import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';
import { client } from 'src/wrappers/subgraph';
import { delegatedVotesToAddressQuery } from 'src/wrappers/subgraph';
import { gql } from '@apollo/client';
import { CreateVoteDto } from './vote.types';
import { Proposal } from 'src/proposal/proposal.entity';

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

  async getNumDelegatedVotes(address: string) {
    const result = await client.query({
      query: gql(delegatedVotesToAddressQuery(address)),
    });

    return result.data.delegates[0]
      ? result.data.delegates[0].delegatedVotesRaw
      : undefined;
  }

  async createNewVote(createVoteDto: CreateVoteDto, proposal: Proposal) {
    // Create vote for proposal
    const vote = new Vote();
    vote.address = createVoteDto.address;
    vote.proposal = proposal;
    vote.direction = createVoteDto.direction;
    vote.signedData = createVoteDto.signedData;

    // Store the new vote
    await this.store(vote);

    return vote;
  }
}
