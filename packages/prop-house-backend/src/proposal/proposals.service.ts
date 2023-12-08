import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';
import { Repository } from 'typeorm';
import { InfiniteAuctionProposal } from './infauction-proposal.entity';
import { Proposal } from './proposal.entity';
import { GetProposalsDto } from './proposal.types';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal | InfiniteAuctionProposal>,
    private infiniteAuctionService: InfiniteAuctionService,
  ) {}

  findAll(dto: GetProposalsDto) {
    return this.proposalsRepository.find({
      skip: dto.skip,
      take: dto.limit,
      order: {
        createdDate: dto.order,
      },
      loadRelationIds: {
        relations: ['votes'],
      },
      where: { visible: true, deletedAt: null },
    });
  }

  findAllWithAuctionId(auctionId: number) {
    return this.proposalsRepository.find({
      relations: ['votes'],
      where: { visible: true, auctionId: auctionId, deletedAt: null },
    });
  }

  async findOne(id: number) {
    const proposal = await this.proposalsRepository.findOne(id, {
      relations: ['votes', 'auction'],
      where: { visible: true, deletedAt: null },
    });

    if (proposal.parentType === 'infinite-auction') {
      proposal.auction = await this.infiniteAuctionService.findOne(
        proposal.auctionId,
      );
    }
    proposal.auctionId = proposal.auction.id;
    return proposal;
  }

  findBetween(start: Date = new Date('1900-01-01'), end: Date) {
    return this.proposalsRepository
      .createQueryBuilder('proposal')
      .where('proposal.createdDate > :start', { start: start.toISOString() })
      .andWhere('proposal.createdDate <= :end', {
        end: (end ?? new Date()).toISOString(),
      })
      .getMany();
  }

  async remove(id: number): Promise<void> {
    await this.proposalsRepository.softDelete(id);
  }

  async rollupVoteCount(id: number) {
    const foundProposal = await this.findOne(id);
    if (!foundProposal) return;
    foundProposal.updateVoteCount();
    this.proposalsRepository.save(foundProposal);
  }

  async store(proposal: Proposal | InfiniteAuctionProposal) {
    return await this.proposalsRepository.save(proposal);
  }

  async voteCountForById(id: number): Promise<number> {
    const foundProposal = await this.proposalsRepository.findOneOrFail(id);
    return foundProposal.voteCountFor;
  }
}
