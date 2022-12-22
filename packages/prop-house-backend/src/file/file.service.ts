import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import config from 'src/config/configuration';
import { IpfsService } from 'src/ipfs/ipfs.service';
import { Repository } from 'typeorm';
import { FileStoredEvent } from './events/file-stored.event';
import { File } from './file.entity';

@Injectable()
export class FileService {
  constructor(
    private readonly ipfsService: IpfsService,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Fetch the on-disk storage base path from configuration
   * @returns String containing a file system path where files
   * should be stored.
   */
  private _diskBasePath() {
    return config().file.basePath;
  }

  /**
   * Test if the destination directory for the given filename
   * exists. If not, attempt to create it.
   *
   * See diskFileDirectory for information on path structure
   * @param filename Filename intending to store
   * @returns undefined or the first path that is created
   */
  private _ensureDiskDirectoryExists(filename) {
    return mkdirSync(this.diskFileDirectory(filename), { recursive: true });
  }

  /**
   * Derive the destination directory for the given filename.
   * Directories "calculated" by joining the file system base
   * path with the first four characters of the filename. Given
   * that the primary application of this module will be hashed
   * filenames, an even distribution should occur and keep from
   * having too many files in one single directory.
   *
   * @param filename Filename intending to store
   * @returns A string representing the directory that the file
   * should be written into.
   */
  public diskFileDirectory(filename) {
    return [this._diskBasePath(), filename.slice(0, 4)].join('/');
  }

  /**
   * Derive the destination path for a file based on its
   * filename. This function attempts to protect against
   * basic path traversal but filenames should be reasonably
   * sanitized coming in.
   *
   * @param filename Filename intending to store
   * @returns Path that the file should be written to
   */
  public diskFilePath(filename) {
    // protect against directory traversal
    filename = filename.replace('..', '');
    return [this.diskFileDirectory(filename), filename].join('/');
  }

  /**
   * Attempt to pin a file buffer with the provided name
   * to the IPFS datastore.
   */
  async pinBuffer(buffer: Buffer, filename: string) {
    return this.ipfsService.pinBuffer(buffer, filename);
  }

  /**
   * Attempt to write a file buffer to disk with the provided
   * filename.
   * @param buffer Buffer to write to disk
   * @param filename File name for the buffer, should not
   * include any paths
   */
  async writeFileToDisk(buffer: Buffer, filename: string) {
    const base = config().file.basePath;
    this._ensureDiskDirectoryExists(filename);
    writeFileSync(this.diskFilePath(filename), buffer);
  }

  /**
   * Attempt to read a file from disk with the provided
   * filename. The path to the file is derived from its
   * name and serivce configuration.
   *
   * @param filename Filename of the file to read, should
   * not include any paths
   * @returns Returns a buffer with file contents if found
   */
  async readFileFromDisk(filename: string) {
    const fileExists = existsSync(this.diskFilePath(filename));
    if (!fileExists) {
      throw new HttpException('No file with that hash', 404);
    }
    return readFileSync(this.diskFilePath(filename));
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
    const storedFile = await this.fileRepository.save(file);
    this.eventEmitter.emit(
      FileStoredEvent.name,
      new FileStoredEvent(storedFile),
    );
    return storedFile;
  }
}
