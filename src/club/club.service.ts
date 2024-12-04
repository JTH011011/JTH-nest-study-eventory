import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateClubPayload } from './payload/create-club.payload';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { ClubDto, ClubListDto } from './dto/club.dto';
import { CreateClubData } from './type/create-club-data.type';
import { ClubRepository } from './club.repository';
import { ClubQuery } from './query/club.query';
import { UpdateClubData } from './type/update-club-data.type';
import { PatchUpdateClubPayload } from './payload/patch-update-club.payload';

@Injectable()
export class ClubService {
  constructor(private readonly clubRepository: ClubRepository) {}

  async createClub(
    payload: CreateClubPayload,
    user: UserBaseInfo,
  ): Promise<ClubDto> {
    const data: CreateClubData = {
      hostId: user.id,
      name: payload.name,
      description: payload.description,
    };

    const club = await this.clubRepository.createClub(data);

    return ClubDto.from(club);
  }

  async patchUpdateClub(
    clubId: number,
    payload: PatchUpdateClubPayload,
    user: UserBaseInfo,
  ): Promise<ClubDto> {
    const data = this.validateNullOf(payload);

    const club = await this.clubRepository.findClubById(clubId);

    if (!club) {
      throw new NotFoundException('클럽을 찾을 수 없습니다.');
    }

    if (club.hostId !== user.id) {
      throw new ForbiddenException('클럽 호스트만 수정 가능합니다.');
    }

    const updatedClub = await this.clubRepository.updateClub(clubId, data);

    return ClubDto.from(updatedClub);
  }

  private validateNullOf(payload: PatchUpdateClubPayload): UpdateClubData {
    if (payload.name === null) {
      throw new BadRequestException('클럽 이름은 null이 될 수 없습니다.');
    }

    if (payload.description === null) {
      throw new BadRequestException('클럽 설명은 null이 될 수 없습니다.');
    }

    return {
      name: payload.name,
      description: payload.description,
    };
  }
}
