import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { ReserveRequisiteV3RequestDto } from './reserve-requisite-v3.request.dto';
import { ReserveRequisiteV3ResponseDto } from './reserve-requisite-v3.response.dto';

const RESERVATION_TTL_SECONDS = 120;

@Injectable()
export class ReserveRequisiteV3Service {
  constructor(private readonly dataSource: DataSource) {}

  async execute(dto: ReserveRequisiteV3RequestDto, user: User): Promise<ReserveRequisiteV3ResponseDto> {
    const bankAccountId = Number(dto.bankAccountId);
    if (!Number.isFinite(bankAccountId)) {
      throw new ConflictException('Invalid bankAccountId');
    }

    const reservationToken = randomUUID();

    // One row per bankAccountId.
    // - Insert if absent
    // - Overwrite if expired OR already released OR already reserved by same user
    // - Otherwise return 0 rows -> conflict
    const sql = `
      INSERT INTO bank_account_reservations (
        bank_account_id,
        reserved_by_user_id,
        reservation_token,
        reserved_at,
        expires_at,
        released_at
      )
      VALUES ($1, $2, $3, now(), now() + ($4::text || ' seconds')::interval, NULL)
      ON CONFLICT (bank_account_id)
      DO UPDATE SET
        reserved_by_user_id = EXCLUDED.reserved_by_user_id,
        reservation_token = EXCLUDED.reservation_token,
        reserved_at = EXCLUDED.reserved_at,
        expires_at = EXCLUDED.expires_at,
        released_at = NULL
      WHERE
        bank_account_reservations.released_at IS NOT NULL
        OR bank_account_reservations.expires_at <= now()
        OR bank_account_reservations.reserved_by_user_id = EXCLUDED.reserved_by_user_id
      RETURNING bank_account_id as "bankAccountId", reservation_token as "reservationToken", expires_at as "expiresAt";
    `;

    const rows = await this.dataSource.query(sql, [bankAccountId, user.id, reservationToken, RESERVATION_TTL_SECONDS]);

    if (!rows || rows.length === 0) {
      throw new ConflictException('Этот реквизит сейчас занят другим оператором. Возьмите следующий.');
    }

    return new ReserveRequisiteV3ResponseDto({
      bankAccountId: rows[0].bankAccountId,
      reservationToken: rows[0].reservationToken,
      expiresAt: new Date(rows[0].expiresAt),
    });
  }
}
