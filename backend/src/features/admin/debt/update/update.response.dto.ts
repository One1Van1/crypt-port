import { ApiProperty } from '@nestjs/swagger';

export class UpdateDebtResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 500 })
  amountUsdt: number;

  @ApiProperty({ example: -500, description: 'Delta (new - old)' })
  deltaUsdt: number;

  constructor(id: number, amountUsdt: number, deltaUsdt: number) {
    this.id = id;
    this.amountUsdt = amountUsdt;
    this.deltaUsdt = deltaUsdt;
  }
}
