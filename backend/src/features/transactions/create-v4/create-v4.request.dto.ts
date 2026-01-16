import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionV4RequestDto {
  @ApiProperty({ description: 'Amount in ARS', example: 100000, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Source neo-bank id', example: 123 })
  @Type(() => Number)
  @IsNumber()
  sourceDropNeoBankId: number;

  @ApiProperty({ description: 'Target bank account id', example: 456 })
  @Type(() => Number)
  @IsNumber()
  bankAccountId: number;

  @ApiProperty({
    description: 'Reservation token issued by /bank-accounts/requisite-v3/reserve',
    example: '2f7b9a3f-7c3a-4d52-9d0b-0f7c3b7a4b1a',
  })
  @IsString()
  reservationToken: string;

  @ApiProperty({ description: 'Optional comment', required: false, example: 'Operator note' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'Optional receipt URL or text', required: false })
  @IsOptional()
  @IsString()
  receipt?: string;
}
