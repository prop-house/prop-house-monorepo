import { IsNumber, IsString } from 'class-validator';
import { SignedDataPayload, SignedEntity } from 'src/entities/signed';
import { SignedDataDto } from 'src/types/signedDataDto';

export class CreateVoteDto extends SignedEntity {
  @IsNumber()
  direction: number;

  @IsNumber()
  proposalId: number;

  @IsNumber()
  weight: number;
}
