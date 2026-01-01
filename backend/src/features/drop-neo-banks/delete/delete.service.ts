import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';

@Injectable()
export class DeleteDropNeoBankService {
  constructor(
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
  ) {}

  async execute(id: number): Promise<void> {
    const dropNeoBank = await this.dropNeoBankRepository.findOne({ where: { id } });

    if (!dropNeoBank) {
      throw new NotFoundException('Drop neo bank not found');
    }

    await this.dropNeoBankRepository.softDelete(id);
  }
}
