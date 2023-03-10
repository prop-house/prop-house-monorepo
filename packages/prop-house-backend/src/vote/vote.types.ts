import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SignedEntity } from 'src/entities/signed';

export class CreateVoteDto extends SignedEntity {
  @IsNumber()
  direction: number;

  @IsNumber()
  proposalId: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  blockHeight: number;

  @IsString()
  communityAddress: string;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetVoteDto {
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

  @IsOptional()
  @IsArray()
  addresses?: string[];
}
