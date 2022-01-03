import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<Vote[]> {
    const proposals = await this.votesRepository.find();
    return proposals;
  }

  findOne(id: number): Promise<Vote> {
    return this.votesRepository.findOne(id, { relations: ['proposal'] });
  }

  async remove(id: string): Promise<void> {
    await this.votesRepository.delete(id);
  }

  async store(vote: Vote) {
    const storedVote = await this.votesRepository.save(vote);
    return storedVote;
  }

  async findByAddress(address: string) {
    return Vote.findByAddress(address);
  }
}
