import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Community } from './community.entity';
import * as ethers from 'ethers';
import { BigNumberish } from '@ethersproject/bignumber';
import config from 'src/config/configuration';
import { getNumVotes } from 'prop-house-communities';
import { ExtendedCommunity } from './community.types';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community)
    private communitiesRepository: Repository<Community>,
  ) {}

  findAll(): Promise<Community[]> {
    return this.communitiesRepository.find({
      where: {
        visible: true,
      },
    });
  }

  findAllExtended(): Promise<ExtendedCommunity[]> {
    return this.extendedAuctionQuery(
      this.communitiesRepository.createQueryBuilder('c'),
    ).getRawMany();
  }

  findOne(id: number): Promise<Community> {
    return this.extendedAuctionQuery(
      this.communitiesRepository.createQueryBuilder('c'),
    )
      .where('c.id = :id', { id })
      .getRawOne();
  }

  findByAddress(address: string): Promise<Community> {
    return this.communitiesRepository.findOne({
      where: {
        contractAddress: address,
      },
    });
  }

  findByName(name: string): Promise<Community> {
    return this.extendedAuctionQuery(
      this.communitiesRepository.createQueryBuilder('c'),
    )
      .where('c.name ILIKE :name', { name })
      .getRawOne();
  }

  async remove(id: number): Promise<void> {
    await this.communitiesRepository.delete(id);
  }

  async store(community: Community): Promise<Community> {
    return await this.communitiesRepository.save(community, { reload: true });
  }

  async votesAtBlockTag(
    community: Community,
    blockTag: number,
    address: string,
  ): Promise<BigNumberish> {
    const provider = new ethers.providers.JsonRpcProvider(config().JSONRPC);
    return getNumVotes(address, community.contractAddress, provider, blockTag);
  }

  private extendedAuctionQuery(qb: SelectQueryBuilder<Community>) {
    return qb
      .select('c.*')
      .addSelect('SUM(a."numAuctions")', 'numAuctions')
      .addSelect('SUM(a."ethFunded")', 'ethFunded')
      .addSelect('SUM(a."totalFunded")', 'totalFunded')
      .addSelect('SUM(p."numProposals")', 'numProposals')
      .leftJoin(
        this.auctionCountAndFundingSubquery,
        'a',
        'a."communityId" = c.id',
      )
      .leftJoin(this.proposalCountSubquery, 'p', 'p."auctionId" = a.id')
      .groupBy('c.id');
  }

  private auctionCountAndFundingSubquery(qb: SelectQueryBuilder<Community>) {
    return qb
      .select('a.id', 'id')
      .addSelect('a.communityId')
      .addSelect('COUNT(a.id)', 'numAuctions')
      .addSelect(
        `CASE WHEN a.currencyType ILIKE '%eth%' then SUM(a.fundingAmount * a.numWinners) else 0 end`,
        'ethFunded',
      )
      .addSelect('SUM(a.fundingAmount * a.numWinners)', 'totalFunded')
      .from('auction', 'a')
      .groupBy('a.id');
  }

  private proposalCountSubquery(qb: SelectQueryBuilder<Community>) {
    return qb
      .select('p.auctionId', 'auctionId')
      .addSelect('COUNT(p.id)', 'numProposals')
      .from('proposal', 'p')
      .groupBy('p.auctionId');
  }
}
