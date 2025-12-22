import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

export class UpdateTransactionStatusRequestDto {
  @ApiProperty({
    enum: TransactionStatus,
    enumName: 'TransactionStatus',
    example: TransactionStatus.COMPLETED,
    description: 'New transaction status',
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;
}
