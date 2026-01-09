import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionV3RequestDto {
  @ApiProperty({ description: 'Amount in ARS', example: 10000, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Source neo-bank id', example: 1 })
  @Type(() => Number)
  @IsInt()
  sourceDropNeoBankId: number;

  @ApiProperty({ description: 'Bank account id', example: 1 })
  @Type(() => Number)
  @IsInt()
  bankAccountId: number;

  @ApiProperty({ description: 'Receipt url or base64 (optional)', required: false, nullable: true })
  @IsOptional()
  @IsString()
  receipt?: string;

  @ApiProperty({ description: 'Comment (optional)', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string;
}
