import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalCreatedEvent } from './events/proposal-created.event';
import { ProposalUpdatedEvent } from './events/proposal-updated.event';
import { Proposal } from './proposal.entity';
import { GetProposalsDto } from './proposal.types';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
    private readonly events: EventEmitter2,
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

  private async _store(proposal: Proposal): Promise<Proposal> {
    return await this.proposalsRepository.save(proposal);
  }

  async updateProposal(proposal: Proposal): Promise<Proposal> {
    const updatedProposal = await this._store(proposal)
    this.events.emit(
      ProposalUpdatedEvent.name,
      new ProposalUpdatedEvent(updatedProposal)
    )
    return updatedProposal
  }

  async createProposal(proposal: Proposal): Promise<Proposal> {
    const storedProposal = await this._store(proposal);
    this.events.emit(
      ProposalCreatedEvent.name,
      new ProposalCreatedEvent(storedProposal),
    );
    return storedProposal;
  }

  async voteCountById(id: number): Promise<number> {
    const foundProposal = await this.proposalsRepository.findOneOrFail(id);
    return foundProposal.voteCount;
  }
}
