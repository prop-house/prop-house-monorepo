import { Field, Int, ObjectType } from '@nestjs/graphql';
import { SignedEntity } from 'src/entities/signed';
import { Proposal } from 'src/proposal/proposal.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  BeforeInsert,
} from 'typeorm';

@Entity()
@ObjectType()
export class Vote extends SignedEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ default: 1 })
  @Field(() => Int)
  direction: number;

  @ManyToOne(() => Proposal, (proposal) => proposal.votes)
  @JoinColumn()
  proposal: Proposal;

  @Column()
  @Field(() => Date)
  createdDate?: Date;

  @Column()
  @Field(() => Int)
  proposalId: number;

  @Column()
  @Field(() => Int)
  auctionId: number;

  @Column()
  @Field(() => Int)
  weight: number;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  constructor(opts?: Partial<Vote>) {
    super(opts);
    if (opts) {
      this.direction = opts.direction;
      this.proposal = opts.proposal;
      this.proposalId = opts.proposalId;
      this.auctionId = opts.auctionId;
      this.weight = opts.weight;
    }
  }
}
