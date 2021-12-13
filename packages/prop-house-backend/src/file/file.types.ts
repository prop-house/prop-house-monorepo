import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class FileUploadDto {
  @IsString()
	name: string;

  @IsString()
	signature: string;
}
