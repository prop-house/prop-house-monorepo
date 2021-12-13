import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './auction.entity';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private auctionsRepository: Repository<Auction>,
  ) {}

  findAll(): Promise<Auction[]> {
    return this.auctionsRepository.find({
      where: {
        visible: true,
      },
    });
  }

  findOne(id: number): Promise<Auction> {
    return this.auctionsRepository.findOne(id, {
      relations: ['proposals'],
      where: { visible: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.auctionsRepository.delete(id);
  }

  async store(proposal: Auction): Promise<Auction> {
    return await this.auctionsRepository.save(proposal, { reload: true });
  }
}
