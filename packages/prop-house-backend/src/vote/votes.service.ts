
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}

  async findAll(): Promise<Vote[]> {
    const proposals = await this.votesRepository.find();
    return proposals;
  }

  findOne(id: number): Promise<Vote> {
    return this.votesRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.votesRepository.delete(id);
  }

  async store(vote: Vote) {
    return this.votesRepository.save(vote);
  }

  async findByAddress(address: string) {
    return Vote.findByAddress(address)
  }
}