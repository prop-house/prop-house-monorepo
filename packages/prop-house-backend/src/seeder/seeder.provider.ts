import { Injectable, Logger } from '@nestjs/common';
import { Auction } from 'src/auction/auction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class Seeder {
  constructor(
	  private auctionRepository: Repository<Auction>
  ) {}
  async seed() {
  }
}
