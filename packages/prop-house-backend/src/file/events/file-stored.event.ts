import { File } from '../file.entity';

export class FileStoredEvent {
  constructor(public readonly file: File) {}
}
