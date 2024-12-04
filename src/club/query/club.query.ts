import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class ClubQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: '호스트 ID',
    type: Number,
  })
  hostId?: number;
}
