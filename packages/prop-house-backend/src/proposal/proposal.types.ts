import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SignedEntity } from 'src/entities/signed';
import { Order } from 'src/utils/dto-types';

export type ProposalParent = 'auction' | 'infinite-auction';

export class CreateProposalDto extends SignedEntity {
  @IsString()
  title: string;

  @IsString()
  what: string;

  @IsString()
  tldr: string;

  @IsNumber()
  parentAuctionId: number;

  @IsString()
  parentType: ProposalParent;
}

export class CreateInfiniteAuctionProposalDto extends CreateProposalDto {
  @IsNumber()
  reqAmount: number;

  parentType: 'infinite-auction';
}

export class UpdateProposalDto extends CreateProposalDto {
  @IsNumber()
  id: number;

  @IsOptional()
  reqAmount?: number;
}

export class DeleteProposalDto extends SignedEntity {
  @IsNumber()
  id: number;
}

export class GetProposalsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => Number(value))
  skip?: number;

  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(Order)
  order?: Order;
}
