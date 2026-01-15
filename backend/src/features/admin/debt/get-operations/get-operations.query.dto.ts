import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DebtOperationType } from '../../../../entities/debt-operation.entity';

export class GetDebtOperationsQueryDto {
  @ApiProperty({ required: false, example: 1, minimum: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, example: 30, minimum: 1, maximum: 200, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiProperty({ required: false, enum: DebtOperationType, enumName: 'DebtOperationType' })
  @IsOptional()
  @IsEnum(DebtOperationType)
  type?: DebtOperationType;
}
