import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { proposalCountSubquery } from 'src/utils';
import { Repository } from 'typeorm';
import { InfiniteAuction } from './infinite-auction.entity';
import { GetInfiniteAuctionsDto } from './infinite-auction.types';

export type InfiniteAuctionWithProposalCount = InfiniteAuction & {
  numProposals: number;
};

@Injectable()
export class InfiniteAuctionService {
  constructor(
    @InjectRepository(InfiniteAuction)
    private infiniteAuctionsRepository: Repository<InfiniteAuction>,
  ) {}

  findAll(dto: GetInfiniteAuctionsDto): Promise<InfiniteAuction[]> {
    return this.infiniteAuctionsRepository.find({
      skip: dto.skip,
      take: dto.limit,
      order: {
        createdDate: dto.order,
      },
      loadRelationIds: {
        relations: ['proposals'],
      },
      where: { visible: true },
    });
  }

  findAllForCommunity(id: number): Promise<InfiniteAuctionWithProposalCount[]> {
    return (
      this.infiniteAuctionsRepository
        .createQueryBuilder('a')
        .select('a.*')
        .where('a.community.id = :id', { id })
        // This select adds a new property, reflected in AuctionWithProposalCount
        .addSelect('SUM(p."numProposals")', 'numProposals')
        .leftJoin(proposalCountSubquery, 'p', 'p."auctionId" = a.id')
        .groupBy('a.id')
        .getRawMany()
    );
  }

  findWithNameForCommunity(name: string, id: number): Promise<InfiniteAuction> {
    const parsedName = name.replaceAll('-', ' '); // parse slug to name
    return this.infiniteAuctionsRepository
      .createQueryBuilder('a')
      .select('a.*')
      .where('a.title ILIKE :parsedName', { parsedName }) // case insensitive
      .andWhere('a.community.id = :id', { id })
      .getRawOne();
  }

  findOne(id: number): Promise<InfiniteAuction> {
    return this.infiniteAuctionsRepository.findOne(id, {
      relations: ['proposals'],
      loadRelationIds: {
        relations: ['community'],
      },
      where: { visible: true },
    });
  }

  findOneWithCommunity(id: number): Promise<InfiniteAuction> {
    return this.infiniteAuctionsRepository.findOne(id, {
      relations: ['proposals', 'community'],
      where: { visible: true },
    });
  }

  findWhere(
    start: number,
    limit: number,
    where: Partial<InfiniteAuction>,
    relations: string[] = [],
    relationIds?: string[],
  ) {
    return this.infiniteAuctionsRepository.find({
      skip: start,
      take: limit,
      where,
      order: { id: 'ASC' },
      relations,
      loadRelationIds: relationIds ? { relations: relationIds } : undefined,
    });
  }
}
