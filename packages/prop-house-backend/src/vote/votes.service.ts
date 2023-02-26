import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindConditions,
  FindManyOptions,
  Repository,
} from 'typeorm';
import { Vote } from './vote.entity';
import { CreateVoteDto } from './vote.types';
import { Proposal } from 'src/proposal/proposal.entity';
import { ethers } from 'ethers';
import config from 'src/config/configuration';
import { getNumVotes } from 'prop-house-communities';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}

  async findAll(opts?: FindManyOptions<Vote>): Promise<Vote[]> {
    return this.votesRepository.find(opts);
  }

  async findAllByAuctionId(auctionId: number): Promise<Vote[]> {
    return await this.votesRepository.find({ where: { auctionId } });
  }

  async findAllByCommunityAddresses(addresses: string[]): Promise<Vote[]> {
    return this.votesRepository
      .createQueryBuilder('v')
      .select('v.*')
      .leftJoin('v.proposal', 'p')
      .leftJoin('p.auction', 'a')
      .leftJoin('a.community', 'c')
      .where('c.contractAddress IN (:...addresses)', { addresses })
      .getRawMany();
  }

  findOne(id: number): Promise<Vote> {
    return this.votesRepository.findOne(id);
  }

  findBy(
    blockHeight: number,
    proposalId: number,
    address: string,
  ): Promise<Vote> {
    return this.votesRepository.findOne({
      where: { address, blockHeight, proposalId },
    });
  }

  async remove(id: string): Promise<void> {
    await this.votesRepository.delete(id);
  }

  async store(vote: DeepPartial<Vote>) {
    return this.votesRepository.save(vote);
  }

  async findByAddress(address: string, conditions?: FindConditions<Vote>) {
    return this.votesRepository.find({
      relations: ['proposal'],
      where: { ...conditions, address },
    });
  }

  async getNumVotes(
    dto: Pick<CreateVoteDto, 'address' | 'communityAddress'>,
    balanceblockTag: number,
  ): Promise<number> {
    const provider = new ethers.providers.JsonRpcProvider(config().JSONRPC);
    return await getNumVotes(
      dto.address,
      dto.communityAddress,
      provider,
      balanceblockTag,
    );
  }

  async createNewVote(createVoteDto: CreateVoteDto, proposal: Proposal) {
    // Create vote for proposal
    const vote = new Vote({
      address: createVoteDto.address,
      direction: createVoteDto.direction,
      signedData: createVoteDto.signedData,
      signatureState: createVoteDto.signatureState,
      proposalId: createVoteDto.proposalId,
      auctionId: proposal.auctionId,
      weight: createVoteDto.weight,
      blockHeight: createVoteDto.blockHeight,
      domainSeparator: createVoteDto.domainSeparator,
      messageTypes: createVoteDto.messageTypes,
      proposal,
    });

    // Store the new vote
    await this.store(vote);

    return vote;
  }
}
