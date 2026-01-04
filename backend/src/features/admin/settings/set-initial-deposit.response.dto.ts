import { ApiProperty } from '@nestjs/swagger';

export class SetInitialDepositResponseDto {
  @ApiProperty({ description: 'Initial deposit in USDT' })
  initialDeposit: number;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  constructor(initialDeposit: number, updatedAt: Date) {
    this.initialDeposit = initialDeposit;
    this.updatedAt = updatedAt;
  }
}
