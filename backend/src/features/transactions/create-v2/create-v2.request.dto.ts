import { IsNumber, Min, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionV2RequestDto {
  @ApiProperty({
    description: 'Transaction amount in ARS',
    example: 150000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Source neo-bank ID (used for history; must match shift platform)',
    example: 1,
  })
  @IsNumber()
  sourceDropNeoBankId: number;

  @ApiProperty({
    description: 'Target bank account ID (requisite)',
    example: 5,
  })
  @IsNumber()
  bankAccountId: number;

  @ApiProperty({
    description: 'Receipt/proof of transaction',
    example: 'https://storage.example.com/receipts/abc123.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  receipt?: string;

  @ApiProperty({
    description: 'Optional comment',
    example: 'Client requested urgent withdrawal',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
