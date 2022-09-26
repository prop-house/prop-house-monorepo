import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './proposal.entity';
import { GetProposalsDto } from './proposal.types';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
  ) {}

  findAll(dto: GetProposalsDto): Promise<Proposal[]> {
    return this.proposalsRepository.find({
      skip: dto.skip,
      take: dto.limit,
      order: {
        createdDate: dto.order,
      },
      loadRelationIds: {
        relations: ['votes'],
      },
      where: { visible: true },
    });
  }

  findAllWithAuctionId(auctionId: number): Promise<Proposal[]> {
    return this.proposalsRepository.find({
      relations: ['votes'],
      where: { visible: true, auctionId: auctionId },
    });
  }

  findOne(id: number): Promise<Proposal> {
    return this.proposalsRepository.findOne(id, {
      relations: ['votes', 'auction'],
      where: { visible: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.proposalsRepository.delete(id);
  }

  async rollupVoteCount(id: number) {
    const foundProposal = await this.findOne(id);
    if (!foundProposal) return;
    foundProposal.updateVoteCount();
    this.proposalsRepository.save(foundProposal);
  }

  async store(proposal: Proposal): Promise<Proposal> {
    return await this.proposalsRepository.save(proposal);
  }

  async voteCountById(id: number): Promise<number> {
    const foundProposal = await this.proposalsRepository.findOneOrFail(id);
    return foundProposal.voteCount;
  }
}
