import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IpfsService } from 'src/ipfs/ipfs.service';
import { Repository } from 'typeorm';
import { File } from './file.entity';

@Injectable()
export class FileService {
	constructor(
		private readonly ipfsService: IpfsService,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
	) {}

	async pinBuffer(buffer: Buffer, filename: string) {
		return this.ipfsService.pinBuffer(buffer, filename)
	}

  async findAll(): Promise<File[]> {
    const proposals = await this.fileRepository.find();
    return proposals;
  }

  findOne(id: number): Promise<File> {
    return this.fileRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.fileRepository.delete(id);
  }

  async store(vote: File) {
    return this.fileRepository.save(vote);
  }
}
