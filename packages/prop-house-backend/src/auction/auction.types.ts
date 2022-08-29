import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  @IsOptional()
  startTime: Date;

  @IsString()
  proposalEndTime: Date;

  @IsString()
  votingEndTime: Date;

  @IsString()
  title: string;

  @IsNumber()
  @IsPositive()
  fundingAmount: number;
}
