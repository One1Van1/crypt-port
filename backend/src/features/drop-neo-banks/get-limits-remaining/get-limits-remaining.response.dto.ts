import { ApiProperty } from '@nestjs/swagger';

export class GetNeoBankLimitsRemainingItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ripio' })
  provider: string;

  @ApiProperty({ example: 'account-123' })
  accountId: string;

  @ApiProperty({ example: 1 })
  dropId: number;

  @ApiProperty({ example: 'Drop 1' })
  dropName: string;

  @ApiProperty({ example: 1, required: false, nullable: true })
  platformId: number | null;

  @ApiProperty({ example: 'Bybit', required: false, nullable: true })
  platformName: string | null;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: 'ALIAS.NEO.BANK', required: false, nullable: true })
  alias: string | null;

  @ApiProperty({ example: 500000, required: false, nullable: true, description: 'Configured daily limit' })
  dailyLimit: number | null;

  @ApiProperty({ example: 30000, required: false, nullable: true, description: 'Remaining daily limit' })
  dailyLimitRemaining: number | null;

  @ApiProperty({ example: 5000000, required: false, nullable: true, description: 'Configured monthly limit' })
  monthlyLimit: number | null;

  @ApiProperty({ example: 4800000, required: false, nullable: true, description: 'Remaining monthly limit' })
  monthlyLimitRemaining: number | null;

  constructor(params: {
    id: number;
    provider: string;
    accountId: string;
    dropId: number;
    dropName: string;
    platformId: number | null;
    platformName: string | null;
    status: string;
    alias: string | null;
    dailyLimit: number | null;
    dailyLimitRemaining: number | null;
    monthlyLimit: number | null;
    monthlyLimitRemaining: number | null;
  }) {
    this.id = params.id;
    this.provider = params.provider;
    this.accountId = params.accountId;
    this.dropId = params.dropId;
    this.dropName = params.dropName;
    this.platformId = params.platformId;
    this.platformName = params.platformName;
    this.status = params.status;
    this.alias = params.alias;
    this.dailyLimit = params.dailyLimit;
    this.dailyLimitRemaining = params.dailyLimitRemaining;
    this.monthlyLimit = params.monthlyLimit;
    this.monthlyLimitRemaining = params.monthlyLimitRemaining;
  }
}

export class GetNeoBankLimitsRemainingResponseDto {
  @ApiProperty({ type: GetNeoBankLimitsRemainingItemDto, isArray: true })
  items: GetNeoBankLimitsRemainingItemDto[];

  constructor(items: GetNeoBankLimitsRemainingItemDto[]) {
    this.items = items;
  }
}
