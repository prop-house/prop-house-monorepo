import { IsNumber, IsString } from 'class-validator';
import { SignedEntity } from 'src/entities/signed.entity';
import { SignedDataDto } from 'src/types/signedDataDto';

export class CreateProposalDto extends SignedEntity {
  @IsString()
  title: string;

  @IsString()
  who: string;

  @IsString()
  what: string;

  @IsString()
  timeline: string;

  @IsString()
  links: string;

  @IsNumber()
  parentAuctionId: number;

}
