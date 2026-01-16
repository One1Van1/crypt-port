import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchNeoBanksV3QueryDto {
  @ApiProperty({
    description: 'Search by drop name, provider, alias, or accountId (CVU/CBU). If 4 digits are provided, matches by last 4 digits.',
    example: '9900',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Page number', example: 1, minimum: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page', example: 50, minimum: 1, maximum: 200, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number;
}
