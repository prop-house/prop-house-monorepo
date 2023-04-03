import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Order } from 'src/utils/dto-types';

export class GetInfiniteAuctionsDto {
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
