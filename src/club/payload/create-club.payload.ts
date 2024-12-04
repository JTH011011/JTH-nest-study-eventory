import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateClubPayload {
  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: '호스트 ID',
    type: Number,
  })
  hostId!: number;

  @IsString()
  @ApiProperty({
    description: '이름',
    type: String,
  })
  name!: string;

  @IsString()
  @ApiProperty({
    description: '설명',
    type: String,
  })
  description!: string;
}