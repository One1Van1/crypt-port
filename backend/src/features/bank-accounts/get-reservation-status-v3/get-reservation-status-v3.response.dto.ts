import { ApiProperty } from '@nestjs/swagger';

export class GetReservationStatusV3ResponseDto {
  @ApiProperty({ example: 123 })
  bankAccountId: number;

  @ApiProperty({ example: true })
  reserved: boolean;

  @ApiProperty({ required: false, nullable: true, example: 12 })
  reservedByUserId?: number | null;

  @ApiProperty({ required: false, nullable: true, example: 'operator_1' })
  reservedByUsername?: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'operator@example.com' })
  reservedByEmail?: string | null;

  @ApiProperty({ required: false, nullable: true, example: '2026-01-16T12:34:56.000Z' })
  expiresAt?: string | null;

  constructor(params: {
    bankAccountId: number;
    reserved: boolean;
    reservedByUserId?: number | null;
    reservedByUsername?: string | null;
    reservedByEmail?: string | null;
    expiresAt?: Date | null;
  }) {
    this.bankAccountId = params.bankAccountId;
    this.reserved = params.reserved;
    this.reservedByUserId = params.reservedByUserId ?? null;
    this.reservedByUsername = params.reservedByUsername ?? null;
    this.reservedByEmail = params.reservedByEmail ?? null;
    this.expiresAt = params.expiresAt ? params.expiresAt.toISOString() : null;
  }
}
