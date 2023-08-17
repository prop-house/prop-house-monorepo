import { Field, Int, ObjectType } from '@nestjs/graphql';
import { InfiniteAuction } from '../infinite-auction/infinite-auction.entity';
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { BaseProposal } from './base-proposal.entity';

@Entity('proposal')
@ObjectType()
export class InfiniteAuctionProposal extends BaseProposal {
  @ManyToOne(() => InfiniteAuction, (auction) => auction.proposals)
  @JoinColumn()
  @Field(() => InfiniteAuction)
  auction: InfiniteAuction;

  parentType: 'infinite-auction';
}
