import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './community.entity';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community)
    private communitiesRepository: Repository<Community>,
  ) {}

  findAll(): Promise<Community[]> {
    return this.communitiesRepository.find({
      where: {
        visible: true,
      },
    });
  }

  findOne(id: number): Promise<Community> {
    return this.communitiesRepository.findOne(id, {
      relations: ['proposals'],
      where: { visible: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.communitiesRepository.delete(id);
  }

  async store(community: Community): Promise<Community> {
    return await this.communitiesRepository.save(community, { reload: true });
  }
}
