import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';
import { client } from 'src/wrappers/subgraph';
import { delegatedVotesToAddressQuery } from 'src/wrappers/subgraph';
import { gql } from '@apollo/client';
import { CreateVoteDto } from './vote.types';
import { Proposal } from 'src/proposal/proposal.entity';
import { isDevEnv } from 'src/config/configuration';
import { contracts } from 'prop-house-community-contracts';
import { ethers } from 'ethers';
import { DelegatedVotes, VoteType } from 'src/utils/vote';
import config from 'src/config/configuration';

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

  async getNumDelegatedVotes(address: string): Promise<DelegatedVotes> {
    // Return 10 votes if in development mode
    if (isDevEnv()) return { votes: 10, type: VoteType.Nouner };

    const nounerVotes = await this.getNounerVotes(address);
    if (nounerVotes > 0) return { votes: nounerVotes, type: VoteType.Nouner };

    const nounishVotes = await this.getNounishVotes(address);
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

    // Store the new vote
    await this.store(vote);

    return vote;
  }

  /**
   * Fetches number of delegated votes to address
   * @param address address votes were delegated to
   * @returns number of delegated votes
   */
  async getNounerVotes(address: string): Promise<number> {
    const result = await client.query({
      query: gql(delegatedVotesToAddressQuery(address)),
    });

    return result.data.delegates[0]
      ? result.data.delegates[0].delegatedVotesRaw
      : 0;
  }

  /**
   * Fetches accumulative balance of owned NFTs of approved contracts from `prop-house-community-contracts` package
   * @param address
   * @returns
   */
  async getNounishVotes(address: string): Promise<number> {
    const provider = new ethers.providers.JsonRpcProvider(config().JSONRPC);

    let delegatedVotes = 0;

    for (let i = 0; i < contracts.length; i++) {
      const contract = new ethers.Contract(
        contracts[i].address,
        contracts[i].abi,
        provider,
      );

      const balance = await contract.balanceOf(address);
      delegatedVotes += Number(balance);
    }

    return delegatedVotes;
  }
}
