import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Community } from 'src/community/community.entity';
import { Proposal } from 'src/proposal/proposal.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { EventStatus } from './types';

@Entity()
@ObjectType()
export class Auction {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All auctions are issued a unique ID number',
  })
  id: number;

  @Column({ default: true })
  visible: boolean;

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => Date, {
    description: 'After the Start Time users may submit proposals',
  })
  startTime: Date;

  @Column()
  @Field(() => Date, {
    description: 'Users may submit proposals up until Proposal End Time',
  })
  proposalEndTime: Date;

  @Column()
  @Field(() => Date, {
    description:
      'Between Proposal End Time and Voting End Time, users may submit votes for proposals',
  })
  votingEndTime: Date;

  @Column({ type: 'decimal', scale: 2, default: 0.0 })
  @Field(() => Float, {
    description: 'The number of currency units paid to each winner',
  })
  fundingAmount: number;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'The currency for the auction that winners will be paid in',
  })
  currencyType: string;

  @Column({ nullable: true })
  @Field(() => String)
  description: string;

  @Column()
  @Field(() => Int, {
    description: 'The number of winners that will be paid from the auction',
  })
  numWinners: number;

  @OneToMany(() => Proposal, (proposal) => proposal.auction)
  @JoinColumn()
  @Field(() => [Proposal])
  proposals: Proposal[];

  @RelationId((auction: Auction) => auction.proposals)
  numProposals: number;

  @ManyToOne(() => Community, (community) => community.auctions)
  @JoinColumn()
  @Field(() => Community)
  community: Community;

  @Column()
  @Field(() => Date)
  createdDate: Date;

  @Column({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @Column({ default: 0 })
  @Field(() => String)
  balanceBlockTag: number;

  @Column({ default: null })
  @Field(() => String)
  eventStatus: EventStatus;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  setUpdatedDate() {
    this.lastUpdatedDate = new Date();
  }

  withinVotingWindow(): boolean {
    const now = new Date();
    return this.proposalEndTime < now && this.votingEndTime > now;
  }

  withinProposalWindow(): boolean {
    const now = new Date();
    return this.startTime < now && this.proposalEndTime > now;
  }

  beforeStart(): boolean {
    const now = new Date();
    return this.startTime > now;
  }

  complete(): boolean {
    const now = new Date();
    return this.votingEndTime < now;
  }

  finalized(): boolean {
    return (
      this.votingEndTime < new Date() &&
      // Already processed
      (this.eventStatus === 'auctionClosed' ||
        // Never processed but was also never discovered
        this.eventStatus === null)
    );
  }

  url(): string {
    const nameToSlug = (name: string) =>
      name.replaceAll(' ', '-').toLowerCase();
    return `https://prop.house/${nameToSlug(this.community.name)}/${nameToSlug(
      this.title,
    )}`;
  }

  minutesUntilProposalWindowEnds(): number {
    return (
      (this.proposalEndTime.getTime() / 1000 - new Date().getTime() / 1000) / 60
    );
  }

  proposalWindowEndingSoon(hoursDiff: number = 24): boolean {
    const minutesDiff = this.minutesUntilProposalWindowEnds();
    return minutesDiff < hoursDiff * 60;
  }

  minutesUntilVotingWindowEnds(): number {
    return (
      (this.votingEndTime.getTime() / 1000 - new Date().getTime() / 1000) / 60
    );
  }

  proposalVotingEndingSoon(hoursDiff: number = 24): boolean {
    const minutesDiff = this.minutesUntilVotingWindowEnds();
    return minutesDiff < hoursDiff * 60;
  }
}

@InputType()
export class AuctionInput extends Auction {}
