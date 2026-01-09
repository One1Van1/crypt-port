import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';

@Injectable()
export class DeleteBankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(id: number): Promise<void> {
    const bankAccount = await this.bankAccountRepository.findOne({ where: { id } });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    const withdrawnAmount = Number((bankAccount as any).withdrawnAmount ?? 0);
    if (Number.isFinite(withdrawnAmount) && withdrawnAmount > 0) {
      throw new BadRequestException('Cannot delete bank account with withdrawn amount > 0');
    }

    await this.bankAccountRepository.softDelete(id);

    // Compact priorities (1..N) after deletion to avoid gaps.
    await this.bankAccountRepository.query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY priority ASC, id ASC) AS rn
        FROM bank_accounts
        WHERE deleted_at IS NULL
      )
      UPDATE bank_accounts ba
      SET priority = ranked.rn
      FROM ranked
      WHERE ba.id = ranked.id;
    `);
  }
}
