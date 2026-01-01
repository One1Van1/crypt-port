import { ApiProperty } from '@nestjs/swagger';

export class UpdateBalanceResponseDto {
  @ApiProperty({ description: 'Neo-bank ID' })
  id: number;

  @ApiProperty({ description: 'Updated balance in ARS', example: 500000 })
  currentBalance: number;

  @ApiProperty({ description: 'Update timestamp' })
  updatedAt: Date;

  constructor(id: number, currentBalance: number, updatedAt: Date) {
    this.id = id;
    this.currentBalance = currentBalance;
    this.updatedAt = updatedAt;
  }
}
