import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Proposal } from './proposal.entity';
import { ProposalsService } from './proposals.service';

@Resolver((of) => Proposal)
export class ProposalsResolver {
  constructor(private proposalsService: ProposalsService) {}

  @Query((returns) => Proposal)
  async proposal(@Args('id', { type: () => Int }) id: number) {
    return this.proposalsService.findOne(id);
  }

  @ResolveField()
  async votes(@Parent() proposal: Proposal) {
    return proposal.votes;
  }
}
