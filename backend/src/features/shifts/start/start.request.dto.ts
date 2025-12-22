import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartShiftRequestDto {
  @ApiProperty({
    description: 'Platform ID where the operator will work',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  platformId: string;
}
