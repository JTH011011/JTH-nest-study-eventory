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
import {
  ClubApplicationDto,
  ClubApplicationListDto,
} from './dto/club.application.dto';
import { CreateClubData } from './type/create-club-data.type';
import { ClubRepository } from './club.repository';
import { ClubQuery } from './query/club.query';
import { UpdateClubData } from './type/update-club-data.type';
import { PatchUpdateClubPayload } from './payload/patch-update-club.payload';
import { ClubApplication } from '@prisma/client';
import { ClubApprovalPayload } from './payload/club-approval.payload';

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

  async joinClub(clubId: number, user: UserBaseInfo): Promise<void> {
    const club = await this.clubRepository.findClubById(clubId);

    if (!club) {
      throw new NotFoundException('해당 클럽을 찾을 수 없습니다.');
    }

    const memberIds = await this.clubRepository.getMemberIdsByClubId(clubId);

    if (memberIds.includes(user.id)) {
      throw new ConflictException('이미 가입한 클럽입니다.');
    }

    const clubApplicationBefore = await this.clubRepository.findClubApplication(
      clubId,
      user.id,
    );

    if (clubApplicationBefore) {
      throw new ConflictException('이미 가입 신청이 접수되었습니다.');
    }

    await this.clubRepository.createClubApplication(clubId, user.id);
  }

  async delegateHost(
    clubId: number,
    userId: number,
    user: UserBaseInfo,
  ): Promise<void> {
    const club = await this.clubRepository.findClubById(clubId);

    if (!club) {
      throw new NotFoundException('클럽을 찾을 수 없습니다.');
    }

    if (club.hostId !== user.id) {
      throw new ForbiddenException(
        '호스트인 사람만 이 작업을 수행할 수 있습니다.',
      );
    }

    const isMember = await this.clubRepository.isMember(clubId, userId);
    if (!isMember) {
      throw new BadRequestException('해당 사용자는 이 클럽의 멤버가 아닙니다.');
    }

    await this.clubRepository.updateClubHost(clubId, userId);
  }

  async deleteClub(clubId: number, user: UserBaseInfo): Promise<void> {
    const club = await this.clubRepository.findClubById(clubId);

    if (!club) {
      throw new NotFoundException('클럽을 찾을 수 없습니다.');
    }

    if (club.hostId !== user.id) {
      throw new ForbiddenException('호스트만 클럽을 삭제할 수 있습니다.');
    }

    await this.clubRepository.deleteClub(clubId);
  }

  async leaveClub(clubId: number, user: UserBaseInfo): Promise<void> {
    const isUserMember = await this.clubRepository.isMember(clubId, user.id);

    if (!isUserMember) {
      throw new BadRequestException('이 클럽의 멤버가 아닙니다.');
    }

    const club = await this.clubRepository.findClubById(clubId);
    if (!club) {
      throw new NotFoundException('클럽을 찾을 수 없습니다.');
    }

    if (club.hostId === user.id) {
      throw new ForbiddenException('호스트는 클럽을 탈퇴할 수 없습니다.');
    }

    await this.clubRepository.leaveClub(clubId, user.id);
  }

  async getClubApplicationList(
    clubId: number,
    user: UserBaseInfo,
  ): Promise<ClubApplicationListDto> {
    const club = await this.clubRepository.findClubById(clubId);

    if (!club) {
      throw new NotFoundException('클럽을 찾을 수 없습니다.');
    }

    if (club.hostId !== user.id) {
      throw new ForbiddenException('당신은 이 클럽의 호스트가 아닙니다!');
    }

    const clubApplications =
      await this.clubRepository.findClubApplications(clubId);

    return ClubApplicationListDto.from(clubApplications);
  }

  async getClubbyClubId(clubId: number): Promise<ClubDto> {
    const club = await this.clubRepository.findClubById(clubId);

    if (!club) {
      throw new NotFoundException('클럽을 찾을 수 없습니다.');
    }

    return ClubDto.from(club);
  }

  async getClubsbyHostId(hostId: number): Promise<ClubListDto> {
    const clubs = await this.clubRepository.findClubsByHostId(hostId);

    if (clubs.length === 0) {
      return ClubListDto.from([]);
    }

    return ClubListDto.from(clubs);
  }

  async approveOrRejectClubApplication(
    clubId: number,
    payload: ClubApprovalPayload,
    user: UserBaseInfo,
  ): Promise<void> {
    const { applicantUserId, isApproved } = payload;

    const club = await this.clubRepository.findClubById(clubId);
    if (!club) {
      throw new NotFoundException('클럽을 찾을 수 없습니다.');
    }

    if (club.hostId !== user.id) {
      throw new ForbiddenException('당신은 이 클럽의 호스트가 아닙니다!');
    }

    const clubApplication = await this.clubRepository.findClubApplication(
      clubId,
      applicantUserId,
    );
    if (!clubApplication) {
      throw new NotFoundException('가입 신청서를 찾을 수 없습니다.');
    }

    if (isApproved) {
      await this.clubRepository.approveClubApplication(clubId, applicantUserId);
    } else {
      await this.clubRepository.rejectClubApplication(clubId, applicantUserId);
    }
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
