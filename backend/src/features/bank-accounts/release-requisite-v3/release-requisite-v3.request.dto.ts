import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ReleaseRequisiteV3RequestDto {
  @ApiProperty({ description: 'Target bank account id', example: 123 })
  @Type(() => Number)
  @IsNumber()
  bankAccountId: number;

  @ApiProperty({ description: 'Reservation token previously issued', example: '2f7b9a3f-7c3a-4d52-9d0b-0f7c3b7a4b1a' })
  @IsString()
  reservationToken: string;
}
