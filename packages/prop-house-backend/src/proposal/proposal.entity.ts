import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Auction } from 'src/auction/auction.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { BaseProposal } from './base-proposal.entity';

@Entity('proposal')
@ObjectType()
export class Proposal extends BaseProposal {
  @ManyToOne(() => Auction, (auction) => auction.proposals)
  @JoinColumn()
  @Field(() => Auction)
  auction: Auction;

  parentType: 'auction';
}
