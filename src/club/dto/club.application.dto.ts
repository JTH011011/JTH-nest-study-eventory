import { ApiProperty } from '@nestjs/swagger';
import { ClubApplicationData } from '../type/club-application-data.type';

export class ClubApplicationDto {
  @ApiProperty({
    description: '가입 신청서 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '클럽 ID',
    type: Number,
  })
  clubId!: number;

  @ApiProperty({
    description: '사용자 ID',
    type: Number,
  })
  userId!: number;

  static from(data: ClubApplicationData): ClubApplicationDto {
    return {
      id: data.id,
      clubId: data.clubId,
      userId: data.userId,
    };
  }

  static fromArray(data: ClubApplicationData[]): ClubApplicationDto[] {
    return data.map((d) => this.from(d));
  }
}

export class ClubApplicationListDto {
  @ApiProperty({
    description: '가입 신청서 목록',
    type: [ClubApplicationDto],
  })
  clubApplications!: ClubApplicationDto[];

  static from(data: ClubApplicationData[]): ClubApplicationListDto {
    return {
      clubApplications: ClubApplicationDto.fromArray(data),
    };
  }
}