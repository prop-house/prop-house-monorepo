import {
  Args,
  ArgsType,
  Field,
  InputType,
  Int,
  OmitType,
  Parent,
  PartialType,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CommunitiesService } from 'src/community/community.service';
import { ProposalsService } from 'src/proposal/proposals.service';
import { PaginationArgs } from 'src/utils/graphql';
import { Between, LessThan, MoreThan } from 'typeorm';
import { Auction, AuctionInput } from './auction.entity';
import { AuctionsService } from './auctions.service';

@InputType()
class PartialAuctionInput extends PartialType(
  OmitType(AuctionInput, ['proposals', 'community'] as const),
) {}

@ArgsType()
class GetAuctionArgs extends PaginationArgs {
  @Field(() => PartialAuctionInput)
  where: Partial<Auction>;
}

export enum AuctionStatus {
  Upcoming = 'Upcoming',
  Open = 'Open',
  Voting = 'Voting',
  Closed = 'Closed',
}

registerEnumType(AuctionStatus, {
  name: 'AuctionStatus',
  description: "The Auction's current status",
  valuesMap: {
    Open: {
      description: 'The auction is accepting proposals.',
    },
    Voting: {
      description: 'The auction is accepting votes, proposals are closed.',
    },
    Closed: {
      description:
        'The auction has closed and is not accepting votes or proposals.',
    },
  },
});

@ArgsType()
class AuctionsByStatusArgs extends PaginationArgs {
  @Field((type) => AuctionStatus)
  status: AuctionStatus;
}

@Resolver((of) => Auction)
export class AuctionsResolver {
  constructor(
    private auctionsService: AuctionsService,
    private proposalsService: ProposalsService,
    private communitiesService: CommunitiesService,
  ) {}

  @Query((returns) => Auction, {
    description: 'Fetch an Auction based on its ID',
  })
  async auction(@Args('id', { type: () => Int }) id: number) {
    const auction = await this.auctionsService.findOne(id);
    await auction.community;
    return auction;
  }

  @Query((returns) => [Auction], {
    description: 'Fetch all auctions that match the provided properties',
  })
  async auctions(@Args() args: GetAuctionArgs) {
    return this.auctionsService.findWhere(
      args.offset,
      args.limit,
      args.where,
      [],
      [
        // Let the resolver function do the work of resolving on-demand
        'community',
      ],
    );
  }

  @Query((returns) => [Auction], {
    description: 'Fetch all auctions by Status',
  })
  async auctionsByStatus(@Args() args: AuctionsByStatusArgs) {
    switch (args.status) {
      case AuctionStatus.Upcoming:
        return this.auctionsService.findWhere(
          args.offset,
          args.limit,
          {
            /*@ts-ignore */
            startTime: MoreThan(new Date()),
          },
          [],
          [
            // Let the resolver function do the work of resolving on-demand
            'community',
          ],
        );
      case AuctionStatus.Open:
        return this.auctionsService.findWhere(
          args.offset,
          args.limit,
          {
            /*@ts-ignore */
            startTime: LessThan(new Date()),
            /*@ts-ignore */
            proposalEndTime: MoreThan(new Date()),
            /*@ts-ignore */
            votingEndTime: MoreThan(new Date()),
          },
          [],
          [
            // Let the resolver function do the work of resolving on-demand
            'community',
          ],
        );
      case AuctionStatus.Voting:
        return this.auctionsService.findWhere(
          args.offset,
          args.limit,
          {
            /*@ts-ignore */
            startTime: LessThan(new Date()),
            /*@ts-ignore */
            proposalEndTime: LessThan(new Date()),
            /*@ts-ignore */
            votingEndTime: MoreThan(new Date()),
          },
          [],
          [
            // Let the resolver function do the work of resolving on-demand
            'community',
          ],
        );
      case AuctionStatus.Closed:
        return this.auctionsService.findWhere(
          args.offset,
          args.limit,
          {
            /*@ts-ignore */
            startTime: LessThan(new Date()),
            /*@ts-ignore */
            proposalEndTime: LessThan(new Date()),
            /*@ts-ignore */
            votingEndTime: LessThan(new Date()),
          },
          [],
          [
            // Let the resolver function do the work of resolving on-demand
            'community',
          ],
        );
      default:
        throw new Error('Invalid status supplied');
    }
  }

  @ResolveField((type) => AuctionStatus, {
    description:
      'The current status of the Auction. See AuctionStatus for more detail.',
  })
  async status(@Parent() auction: Auction) {
    if (auction.startTime > new Date()) {
      return AuctionStatus.Upcoming;
    } else if (
      auction.startTime <= new Date() &&
      auction.votingEndTime > new Date() &&
      auction.proposalEndTime > new Date()
    ) {
      return AuctionStatus.Open;
    } else if (
      auction.startTime <= new Date() &&
      auction.proposalEndTime <= new Date() &&
      auction.votingEndTime > new Date()
    ) {
      return AuctionStatus.Voting;
    } else if (
      auction.startTime <= new Date() &&
      auction.proposalEndTime <= new Date() &&
      auction.votingEndTime <= new Date()
    ) {
      return AuctionStatus.Closed;
    }
  }

  @ResolveField()
  async proposals(@Parent() auction: Auction) {
    const { id } = auction;
    return this.proposalsService.findAllWithAuctionId(id);
  }

  @ResolveField()
  async community(@Parent() auction: Auction) {
    // This approach is slightly faster than letting typeorm eager load
    return this.communitiesService.findOne(auction.community.id);
  }
}
