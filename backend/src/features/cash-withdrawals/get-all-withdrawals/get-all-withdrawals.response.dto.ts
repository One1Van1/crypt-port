import { ApiProperty } from '@nestjs/swagger';

export class UserInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;
}

export class WithdrawalItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amountPesos: number;

  @ApiProperty()
  withdrawalRate: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  bankAccountId: number;

  @ApiProperty({ required: false })
  comment?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: UserInfo, nullable: true })
  withdrawnByUser: UserInfo | null;
}

export class GetAllWithdrawalsResponseDto {
  @ApiProperty({ type: [WithdrawalItem] })
  items: WithdrawalItem[];
}
