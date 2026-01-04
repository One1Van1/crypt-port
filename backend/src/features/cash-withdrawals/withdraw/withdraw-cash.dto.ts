import { IsNotEmpty, IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawCashDto {
  @ApiProperty({
    description: 'Bank account ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  bankAccountId: number;

  @ApiProperty({
    description: 'Amount in pesos',
    example: 100000.00,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amountPesos: number;

  @ApiProperty({
    description: 'Comment',
    example: 'Cash withdrawal for conversion',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
