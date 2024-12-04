import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class PatchUpdateClubPayload {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '클럽 이름',
    type: String,
  })
  name?: string | null;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '클럽 설명',
    type: String,
  })
  description?: string | null;
}
