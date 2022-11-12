import { IsNumber, IsString } from 'class-validator';
import { SignedEntity } from 'src/entities/signed';

export class CreateVoteDto extends SignedEntity {
  @IsNumber()
  direction: number;

  @IsNumber()
  proposalId: number;

  @IsNumber()
  weight: number;

  @IsString()
  communityAddress: string;
}
