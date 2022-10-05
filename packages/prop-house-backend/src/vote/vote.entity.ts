import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
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
  @Field(type => Int)
  id: number;

  @Column({ default: 1 })
  @Field(type => Int)
  direction: number;

  @ManyToOne(() => Proposal, (proposal) => proposal.votes)
  @JoinColumn()
  proposal: Proposal;

  @Column()
  @Field(type => Date)
  createdDate: Date;

  @Column()
  @Field(type => Int)
  proposalId: number;

  @Column()
  @Field(type => Int)
  auctionId: number;

  @Column()
  @Field(type => Int)
  weight: number;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }
}
