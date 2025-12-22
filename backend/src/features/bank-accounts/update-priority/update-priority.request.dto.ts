import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBankAccountPriorityRequestDto {
  @ApiProperty({
    description: 'Priority (lower number = higher priority)',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  priority: number;
}
