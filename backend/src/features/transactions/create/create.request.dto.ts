import { IsNumber, Min, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionRequestDto {
  @ApiProperty({
    description: 'Transaction amount in ARS',
    example: 150000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Platform ID',
    example: 1,
  })
  @IsNumber()
  platformId: number;

  @ApiProperty({
    description: 'Optional comment',
    example: 'Client requested urgent withdrawal',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
