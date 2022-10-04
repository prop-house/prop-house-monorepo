import { Field, InputType, Int, ObjectType, PartialType } from '@nestjs/graphql';
import { Auction } from 'src/auction/auction.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  RelationCount,
} from 'typeorm';

@Entity()
@ObjectType()
export class Community {
  @PrimaryGeneratedColumn()
  @Field(type => Int)
  id: number;

  @Column({ default: true })
  visible: boolean;

  @Column()
  @Field(type => String, {
    description: "The contract address that is queried for balances"
  })
  contractAddress: string;

  @Column()
  @Field(type => String)
  name: string;

  @Column()
  @Field(type => String)
  profileImageUrl: string;

  @Column({ nullable: true })
  @Field(type => String)
  description: string;

  // TODO: refactor to not use deprecated decorator
  @RelationCount((community: Community) => community.auctions)
  @Field(type => Int)
  numAuctions: number;

  @OneToMany(() => Auction, (auction) => auction.community, {
    eager: true,
  })
  @JoinColumn()
  @Field(type => [Auction])
  auctions: Auction[];

  @Column()
  @Field(type => Date)
  createdDate: Date;

  @Column({ nullable: true })
  @Field(type => Date)
  lastUpdatedDate: Date;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  setUpdatedDate() {
    this.lastUpdatedDate = new Date();
  }
}

@InputType()
export class CommunityInput extends PartialType(Community) {}
