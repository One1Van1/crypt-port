import { ApiProperty } from '@nestjs/swagger';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { ConversionStatus } from '../../../common/enums/conversion-status.enum';

class UserInfoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  constructor(id: number, username: string) {
    this.id = id;
    this.username = username;
  }
}

class ConversionItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  pesosAmount: number;

  @ApiProperty()
  exchangeRate: number;

  @ApiProperty()
  usdtAmount: number;

  @ApiProperty({ enum: ConversionStatus })
  status: ConversionStatus;

  @ApiProperty({ type: UserInfoDto })
  convertedByUser: UserInfoDto;

  @ApiProperty({ type: UserInfoDto, nullable: true })
  withdrawnByUser?: UserInfoDto;

  @ApiProperty()
  createdAt: Date;

  constructor(conversion: PesoToUsdtConversion) {
    this.id = conversion.id;
    this.pesosAmount = conversion.pesosAmount;
    this.exchangeRate = conversion.exchangeRate;
    this.usdtAmount = conversion.usdtAmount;
    this.status = conversion.status;
    this.convertedByUser = new UserInfoDto(
      conversion.convertedByUser.id,
      conversion.convertedByUser.username,
    );
    if (conversion.cashWithdrawal?.withdrawnByUser) {
      this.withdrawnByUser = new UserInfoDto(
        conversion.cashWithdrawal.withdrawnByUser.id,
        conversion.cashWithdrawal.withdrawnByUser.username,
      );
    }
    this.createdAt = conversion.createdAt;
  }
}

export class GetAllConversionsResponseDto {
  @ApiProperty({ type: [ConversionItemDto] })
  conversions: ConversionItemDto[];

  constructor(conversions: PesoToUsdtConversion[]) {
    this.conversions = conversions.map(c => new ConversionItemDto(c));
  }
}
