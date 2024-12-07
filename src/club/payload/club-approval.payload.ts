import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsBoolean, IsPositive } from 'class-validator';

export class ClubApprovalPayload {
  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: '신청자 user ID',
    type: Number,
  })
  applicantUserId!: number;

  @IsBoolean()
  @ApiProperty({
    description: '승인 여부',
    type: Boolean,
  })
  isApproved!: boolean;
}
