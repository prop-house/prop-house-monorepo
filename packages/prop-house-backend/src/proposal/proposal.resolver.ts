import {
  Args,
  ArgsType,
  Field,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Proposal } from './proposal.entity';
import { ProposalsService } from './proposals.service';

@ArgsType()
class ProposalsBetweenArgs {
  @Field({ nullable: true })
  since?: Date;

  @Field({ nullable: true })
  before?: Date;
}

@Resolver((of) => Proposal)
export class ProposalsResolver {
  constructor(private proposalsService: ProposalsService) {}

  @Query((returns) => Proposal)
  async proposal(@Args('id', { type: () => Int }) id: number) {
    return this.proposalsService.findOne(id);
  }

  @Query(() => [Proposal], {
    description:
      'Fetch the queries that were created between the specified dates',
  })
  async proposalsBetween(@Args() args: ProposalsBetweenArgs) {
    const results = await this.proposalsService.findBetween(
      args.since,
      args.before,
    );
    return results;
  }

  @ResolveField()
  async votes(@Parent() proposal: Proposal) {
    return proposal.votes;
  }
}
