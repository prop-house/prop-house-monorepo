import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './proposal.entity';
import { Vote } from 'src/vote/vote.entity';
import { calcIndividualVoteWeight, VoteType } from 'src/utils/vote';

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

  async rollupScores(votes: Vote[], auctionId: number) {
    const nounerVoteWeight = calcIndividualVoteWeight(VoteType.Nouner, votes);
    const nounishVoteWeight = calcIndividualVoteWeight(VoteType.Nounish, votes);

    const indVoteWeights = {
      [VoteType.Nouner]: nounerVoteWeight,
      [VoteType.Nounish]: nounishVoteWeight,
    };

    const proposals = await this.findAllWithAuctionId(auctionId);

    proposals.forEach((proposal) => {
      proposal.updateScore(indVoteWeights);
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
