import { ApiProperty } from '@nestjs/swagger';

export class ReserveRequisiteV3ResponseDto {
  @ApiProperty({ example: 123 })
  bankAccountId: number;

  @ApiProperty({ example: '2f7b9a3f-7c3a-4d52-9d0b-0f7c3b7a4b1a' })
  reservationToken: string;

  @ApiProperty({ example: '2026-01-16T12:34:56.000Z' })
  expiresAt: string;

  constructor(params: { bankAccountId: number; reservationToken: string; expiresAt: Date }) {
    this.bankAccountId = params.bankAccountId;
    this.reservationToken = params.reservationToken;
    this.expiresAt = params.expiresAt.toISOString();
  }
}
