import { Auction } from 'src/auction/auction.entity';
import { Proposal } from 'src/proposal/proposal.entity';
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
export class Community {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  visible: boolean;

  @Column()
  contractAddress: string;

  @Column()
  name: string;

  @Column()
  profileImageUrl: string;

  @Column({ nullable: true })
  description: string;

  // TODO: refactor to not use deprecated decorator
  @RelationCount((community: Community) => community.auctions)
  numAuctions: number;

  @OneToMany(() => Auction, (auction) => auction.community, {
    eager: true,
  })
  @JoinColumn()
  auctions: Auction[];

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
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
