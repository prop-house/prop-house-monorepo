import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindConditions,
  FindManyOptions,
  Repository,
} from 'typeorm';
import { Vote } from './vote.entity';
import { CreateVoteDto, GetVoteDto } from './vote.types';
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

  findAllWithOpts(dto: GetVoteDto): Promise<Vote[]> {
    const q = this.votesRepository
      .createQueryBuilder('v')
      .skip(dto.skip)
      .take(dto.limit)
      .orderBy('v.createdDate', dto.order)
      .leftJoin('v.proposal', 'p')
      .addSelect('p');

    if (dto.addresses && dto.addresses.length > 0)
      q.leftJoin('p.auction', 'a')
        .leftJoin('a.community', 'c')
        .where('LOWER(c.contractAddress) IN (:...addresses)', {
          addresses: dto.addresses.map((addr) => addr.toLowerCase()),
        });

    return q.getMany();
  }

  async findAllByAuctionId(auctionId: number): Promise<Vote[]> {
    return await this.votesRepository.find({ where: { auctionId } });
  }

  async findAllByCommunityAddresses(addresses: string[]): Promise<Vote[]> {
    return this.votesRepository
      .createQueryBuilder('v')
      .leftJoin('v.proposal', 'p')
      .leftJoin('p.auction', 'a')
      .leftJoin('a.community', 'c')
      .where('LOWER(c.contractAddress) IN (:...addresses)', {
        addresses: addresses.map((addr) => addr.toLowerCase()),
      })
      .addSelect('p')
      .getMany();
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

  async getNumVotesByAccountAndRoundId(account: string, roundId: number) {
    const votes = await this.votesRepository
      .createQueryBuilder('v')
      .where('address = :account', { account })
      .andWhere('v.auctionId = :roundId', { roundId })
      .getMany();
    return votes.reduce((sum, vote) => sum + Number(vote.weight), 0);
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
