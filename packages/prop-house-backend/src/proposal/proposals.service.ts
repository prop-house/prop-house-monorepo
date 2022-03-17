import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IndividualVoteWeights } from 'src/utils/vote';
import { Repository } from 'typeorm';
import { Proposal } from './proposal.entity';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
  ) {}

  findAll(): Promise<Proposal[]> {
    return this.proposalsRepository.find({
      loadRelationIds: {
        relations: ['auction', 'votes'],
      },
      where: { visible: true },
    });
  }

  findAllWithAuctionId(auctionId: number): Promise<Proposal[]> {
    return this.proposalsRepository.find({
      relations: ['auction', 'votes'],
      where: { visible: true, auctionId: auctionId },
    });
  }

  findOne(id: number): Promise<Proposal> {
    return this.proposalsRepository.findOne(id, {
      relations: ['votes'],
      where: { visible: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.proposalsRepository.delete(id);
  }

  async rollupScores(auctionId: number, votesWeights: IndividualVoteWeights) {
    const proposals = await this.findAllWithAuctionId(auctionId);

    proposals.forEach((proposal) => {
      proposal.updateScore(votesWeights);
      this.proposalsRepository.save(proposal);
    });
  }

  async store(proposal: Proposal): Promise<Proposal> {
    return await this.proposalsRepository.save(proposal);
  }

  async scoreById(id: number): Promise<number> {
    const foundProposal = await this.proposalsRepository.findOneOrFail(id);
    return foundProposal.score;
  }
}
