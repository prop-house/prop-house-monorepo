import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { proposalCountSubquery } from 'src/utils/proposalCountSubquery';
import { Repository } from 'typeorm';
import { Auction } from './auction.entity';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private auctionsRepository: Repository<Auction>,
  ) {}

  findAll(): Promise<Auction[]> {
    return this.auctionsRepository.find({
      loadRelationIds: {
        relations: ['proposals.auction', 'community'],
      },
      where: {
        visible: true,
      },
    });
  }

  findAllForCommunity(id: number): Promise<Auction[]> {
    return this.auctionsRepository
      .createQueryBuilder('a')
      .select('a.*')
      .where('a.community.id = :id', { id })
      .addSelect('SUM(p."numProposals")', 'numProposals')
      .leftJoin(proposalCountSubquery, 'p', 'p."auctionId" = a.id')
      .groupBy('a.id')
      .getRawMany();
  }

  findOne(id: number): Promise<Auction> {
    return this.auctionsRepository.findOne(id, {
      relations: ['proposals'],
      loadRelationIds: {
        relations: ['community'],
      },
      where: { visible: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.auctionsRepository.delete(id);
  }

  async store(proposal: Auction): Promise<Auction> {
    return await this.auctionsRepository.save(proposal, { reload: true });
  }
}
