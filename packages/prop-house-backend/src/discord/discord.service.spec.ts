import { Test, TestingModule } from '@nestjs/testing';
import { DiscordService } from './discord.service';

describe('DiscordService', () => {
  let service: DiscordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordService],
    }).compile();

    service = module.get<DiscordService>(DiscordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should deserialize config', () => {
    expect(
      service.decodeConfig(
        '123:proposal.save,proposal.delete;444:proposal.delete',
      ),
    ).toEqual({
      'proposal.save': ['123'],
      'proposal.delete': ['123', '444'],
    });
  });
});
