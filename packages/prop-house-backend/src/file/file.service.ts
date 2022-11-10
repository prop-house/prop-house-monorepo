import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, mkdirSync, readFileSync, stat, statSync, writeFileSync } from 'fs';
import config from 'src/config/configuration';
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

  private _diskBasePath() {
    return config().file.basePath
  }

  private _ensureDiskDirectoryExists(filename) {
    return mkdirSync(this.diskFileDirectory(filename), {recursive: true})
  }

  public diskFileDirectory(filename) {
    return [this._diskBasePath(), filename.slice(0, 4)].join('/')
  }

  public diskFilePath(filename) {
    return [this.diskFileDirectory(filename), filename].join('/')

  }

  async pinBuffer(buffer: Buffer, filename: string) {
    return this.ipfsService.pinBuffer(buffer, filename);
  }

  async writeFileToDisk(buffer: Buffer, filename: string) {
    // protect against directory traversal
    filename = filename.replace("..", "") 
    const base = config().file.basePath
    this._ensureDiskDirectoryExists(filename)
    writeFileSync(this.diskFilePath(filename), buffer)
  }

  async readFileFromDisk(filename: string) {
    const fileExists = existsSync(this.diskFilePath(filename))
    if(!fileExists) {
      throw new HttpException("No file with that hash", 404)
    }
    return readFileSync(this.diskFilePath(filename))
  }

  async findAll(): Promise<File[]> {
    const proposals = await this.fileRepository.find({
      where: { hidden: false },
    });
    return proposals;
  }

  async findAllByAddress(address: string): Promise<File[]> {
    const proposals = await this.fileRepository.find({
      where: { address, hidden: false },
    });
    return proposals;
  }

  findOne(id: number): Promise<File> {
    return this.fileRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.fileRepository.delete(id);
  }

  async store(file: File) {
    return this.fileRepository.save(file);
  }
}
