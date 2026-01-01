import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { PlatformStatus } from '../common/enums/platform.enum';

@Entity('platforms')
export class Platform extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: PlatformStatus,
    default: PlatformStatus.ACTIVE,
  })
  status: PlatformStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'exchange_rate' })
  exchangeRate: number;
}
