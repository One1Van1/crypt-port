import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetReservationStatusV3QueryDto } from './get-reservation-status-v3.query.dto';
import { GetReservationStatusV3ResponseDto } from './get-reservation-status-v3.response.dto';

@Injectable()
export class GetReservationStatusV3Service {
  constructor(private readonly dataSource: DataSource) {}

  async execute(query: GetReservationStatusV3QueryDto): Promise<GetReservationStatusV3ResponseDto> {
    const bankAccountId = Number(query.bankAccountId);

    const rows = await this.dataSource.query(
      `
        SELECT
          r.bank_account_id as "bankAccountId",
          r.reserved_by_user_id as "reservedByUserId",
          u.username as "reservedByUsername",
          u.email as "reservedByEmail",
          r.expires_at as "expiresAt"
        FROM bank_account_reservations r
        LEFT JOIN users u ON u.id = r.reserved_by_user_id
        WHERE r.bank_account_id = $1
          AND r.released_at IS NULL
          AND r.expires_at > now()
        LIMIT 1
      `,
      [bankAccountId],
    );

    if (!rows || rows.length === 0) {
      return new GetReservationStatusV3ResponseDto({ bankAccountId, reserved: false });
    }

    return new GetReservationStatusV3ResponseDto({
      bankAccountId,
      reserved: true,
      reservedByUserId: rows[0].reservedByUserId ?? null,
      reservedByUsername: rows[0].reservedByUsername ?? null,
      reservedByEmail: rows[0].reservedByEmail ?? null,
      expiresAt: rows[0].expiresAt ? new Date(rows[0].expiresAt) : null,
    });
  }
}
