import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateClubData } from './type/create-club-data.type';
import { ClubData } from './type/club-data.type';
import { UpdateClubData } from './type/update-club-data.type';
import { ClubQuery } from './query/club.query';
import { ClubApplicationData } from './type/club-application-data.type';

@Injectable()
export class ClubRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createClub(data: CreateClubData): Promise<ClubData> {
    return this.prisma.club.create({
      data: {
        hostId: data.hostId,
        name: data.name,
        description: data.description,
        clubJoin: {
          create: {
            userId: data.hostId,
          },
        },
      },
      select: {
        id: true,
        hostId: true,
        name: true,
        description: true,
      },
    });
  }

  async getMemberIdsByClubId(clubId: number): Promise<number[]> {
    const data = await this.prisma.clubJoin.findMany({
      where: {
        clubId,
        user: {
          deletedAt: null,
        },
      },
      select: {
        userId: true,
      },
    });

    return data.map((d) => d.userId);
  }

  async createClubApplication(clubId: number, userId: number): Promise<void> {
    await this.prisma.clubApplication.create({
      data: {
        clubId,
        userId,
      },
    });
  }

  async findClubApplication(
    clubId: number,
    userId: number,
  ): Promise<ClubApplicationData | null> {
    return this.prisma.clubApplication.findFirst({
      where: {
        clubId,
        userId,
        user: {
          deletedAt: null,
        },
      },
      select: {
        id: true,
        clubId: true,
        userId: true,
      },
    });
  }

  async findClubApplications(clubId: number): Promise<ClubApplicationData[]> {
    return this.prisma.clubApplication.findMany({
      where: {
        clubId,
      },
      select: {
        id: true,
        clubId: true,
        userId: true,
      },
    });
  }

  async approveClubApplication(clubId: number, userId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.clubJoin.create({
        data: {
          clubId,
          userId,
        },
      }),
      this.prisma.clubApplication.delete({
        where: {
          clubId_userId: {
            clubId,
            userId,
          },
        },
      }),
    ]);
  }

  async rejectClubApplication(clubId: number, userId: number): Promise<void> {
    await this.prisma.clubApplication.delete({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
      },
    });
  }

  async updateClub(id: number, data: UpdateClubData): Promise<ClubData> {
    return this.prisma.club.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        description: data.description,
      },
      select: {
        id: true,
        hostId: true,
        name: true,
        description: true,
      },
    });
  }

  async updateClubHost(id: number, hostId: number): Promise<void> {
    await this.prisma.club.update({
      where: {
        id,
      },
      data: {
        hostId,
      },
    });
  }

  async isMember(clubId: number, userId: number): Promise<boolean> {
    const member = await this.prisma.clubJoin.findFirst({
      where: {
        clubId,
        userId,
        user: {
          deletedAt: null,
        },
      },
    });
    return !!member;
  }

  async findClubById(id: number): Promise<ClubData | null> {
    return this.prisma.club.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        hostId: true,
        name: true,
        description: true,
      },
    });
  }
}
