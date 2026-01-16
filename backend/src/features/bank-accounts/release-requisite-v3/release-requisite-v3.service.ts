import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { ReleaseRequisiteV3RequestDto } from './release-requisite-v3.request.dto';

@Injectable()
export class ReleaseRequisiteV3Service {
  constructor(private readonly dataSource: DataSource) {}

  async execute(dto: ReleaseRequisiteV3RequestDto, user: User): Promise<{ released: boolean }> {
    const bankAccountId = Number(dto.bankAccountId);
    const token = String(dto.reservationToken || '');
    if (!Number.isFinite(bankAccountId) || !token) return { released: false };

    const sql = `
      UPDATE bank_account_reservations
      SET released_at = now(), expires_at = now()
      WHERE bank_account_id = $1
        AND reserved_by_user_id = $2
        AND reservation_token = $3
        AND released_at IS NULL
      RETURNING bank_account_id;
    `;

    const rows = await this.dataSource.query(sql, [bankAccountId, user.id, token]);
    return { released: Array.isArray(rows) && rows.length > 0 };
  }
}
