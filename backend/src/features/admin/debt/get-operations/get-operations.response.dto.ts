import { ApiProperty } from '@nestjs/swagger';
import { DebtOperationType } from '../../../../entities/debt-operation.entity';

export class GetDebtOperationsItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2026-01-15T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ enum: DebtOperationType, enumName: 'DebtOperationType' })
  type: DebtOperationType;

  @ApiProperty({ example: -250.5, description: 'Positive increases debt; negative decreases debt' })
  deltaUsdt: number;

  @ApiProperty({ required: false, nullable: true, example: 'Manual set by admin' })
  comment?: string | null;

  @ApiProperty({ required: false, nullable: true, example: 123 })
  sourceConversionId?: number | null;

  @ApiProperty({ required: false, nullable: true, example: 5 })
  createdByUserId?: number | null;

  @ApiProperty({ required: false, nullable: true, example: 'admin@example.com' })
  createdByUserEmail?: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'admin' })
  createdByUserUsername?: string | null;

  constructor(params: {
    id: number;
    createdAt: Date;
    type: DebtOperationType;
    deltaUsdt: number;
    comment?: string | null;
    sourceConversionId?: number | null;
    createdByUserId?: number | null;
    createdByUserEmail?: string | null;
    createdByUserUsername?: string | null;
  }) {
    this.id = params.id;
    this.createdAt = params.createdAt;
    this.type = params.type;
    this.deltaUsdt = params.deltaUsdt;
    this.comment = params.comment ?? null;
    this.sourceConversionId = params.sourceConversionId ?? null;
    this.createdByUserId = params.createdByUserId ?? null;
    this.createdByUserEmail = params.createdByUserEmail ?? null;
    this.createdByUserUsername = params.createdByUserUsername ?? null;
  }
}

export class GetDebtOperationsResponseDto {
  @ApiProperty({ type: [GetDebtOperationsItemDto] })
  items: GetDebtOperationsItemDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 30 })
  limit: number;

  constructor(items: GetDebtOperationsItemDto[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}
