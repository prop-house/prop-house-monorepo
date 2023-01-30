import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InfiniteAuctionProposal } from './infauction-proposal.entity';
import { ProposalsService } from './proposals.service';

@Resolver((of) => InfiniteAuctionProposal)
export class InfiniteAuctionProposalsResolver {
  constructor(private proposalsService: ProposalsService) {}

  @Query((returns) => InfiniteAuctionProposal)
  async proposal(@Args('id', { type: () => Int }) id: number) {
    return this.proposalsService.findOne(id);
  }

  @ResolveField()
  async votes(@Parent() proposal: InfiniteAuctionProposal) {
    return proposal.votes;
  }
}
