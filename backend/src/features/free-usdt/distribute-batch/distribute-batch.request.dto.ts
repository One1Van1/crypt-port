import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested, ArrayMinSize } from 'class-validator';

export class DistributeFreeUsdtBatchItemDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  platformId: number;

  @ApiProperty({ example: 50, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amountUsdt: number;

  @ApiProperty({ required: false, example: 'Top-up for operations' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class DistributeFreeUsdtBatchRequestDto {
  @ApiProperty({ type: [DistributeFreeUsdtBatchItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DistributeFreeUsdtBatchItemDto)
  items: DistributeFreeUsdtBatchItemDto[];

  @ApiProperty({ required: false, example: 'Manual redistribution' })
  @IsOptional()
  @IsString()
  comment?: string;
}
