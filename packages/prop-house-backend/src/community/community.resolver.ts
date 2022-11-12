import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Community } from './community.entity';
import { CommunitiesService } from './community.service';

@Resolver((of) => Community)
export class CommunityResolver {
  constructor(private communityService: CommunitiesService) {}

  @Query((returns) => Community)
  async community(@Args('id', { type: () => Int }) id: number) {
    return this.communityService.findOne(id);
  }

  @Query((returns) => [Community])
  async communities() {
    return this.communityService.findAll();
  }

  @Query((returns) => Community)
  async findByAddress(@Args('address') address: string) {
    return this.communityService.findByAddress(address);
  }

  @ResolveField()
  async auctions(@Parent() community: Community) {
    return community.auctions;
  }
}
