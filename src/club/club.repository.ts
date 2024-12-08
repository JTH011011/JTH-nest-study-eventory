import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateClubData } from './type/create-club-data.type';
import { ClubData } from './type/club-data.type';
import { UpdateClubData } from './type/update-club-data.type';
import { ClubQuery } from './query/club.query';
import { ClubApplicationData } from './type/club-application-data.type';
import { EventData } from '../event/type/event-data.type';

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
        deletedAt: true,
      },
    });
  }

  async deleteClub(clubId: number): Promise<void> {
    const clubEvents = await this.prisma.event.findMany({
      where: {
        clubId: clubId,
      },
    });
    const notStartedEventsId = clubEvents
      .filter((event) => event.startTime > new Date())
      .map((event) => event.id);

    await this.prisma.$transaction(async (prisma) => {
      await prisma.eventCity.deleteMany({
        where: {
          eventId: {
            in: notStartedEventsId,
          },
        },
      });

      await prisma.eventJoin.deleteMany({
        where: {
          eventId: {
            in: notStartedEventsId,
          },
        },
      });

      await prisma.event.deleteMany({
        where: {
          id: {
            in: notStartedEventsId,
          },
        },
      });

      await prisma.clubJoin.deleteMany({
        where: {
          clubId,
        },
      });

      await prisma.clubApplication.deleteMany({
        where: {
          clubId,
        },
      });

      await prisma.club.update({
        where: {
          id: clubId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    });
  }

  async leaveClub(clubId: number, userId: number): Promise<void> {
    const userEvents = await this.getClubEventsByUserId(clubId, userId);
    const deletionNeededEventsId = userEvents
      .filter(
        (event) => event.hostId === userId && event.startTime > new Date(),
      )
      .map((event) => event.id);
    const leaveNeededEventsId = userEvents
      .filter(
        (event) => event.hostId !== userId && event.startTime > new Date(),
      )
      .map((event) => event.id);

    await this.prisma.$transaction(async (prisma) => {
      await prisma.eventCity.deleteMany({
        where: {
          eventId: {
            in: deletionNeededEventsId,
          },
        },
      });

      await prisma.eventJoin.deleteMany({
        where: {
          eventId: {
            in: deletionNeededEventsId,
          },
        },
      });

      await prisma.eventJoin.deleteMany({
        where: {
          eventId: {
            in: leaveNeededEventsId,
          },
        },
      });

      await prisma.event.deleteMany({
        where: {
          id: {
            in: deletionNeededEventsId,
          },
        },
      });

      await prisma.clubJoin.delete({
        where: {
          clubId_userId: {
            clubId,
            userId,
          },
        },
      });
    });
  }

  async getClubEventsByUserId(
    clubId: number,
    userId: number,
  ): Promise<EventData[]> {
    const eventCandidates = await this.prisma.event.findMany({
      where: {
        eventJoin: {
          some: {
            userId: userId,
          },
        },
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        clubId: true,
        eventCity: {
          select: {
            id: true,
            cityId: true,
          },
        },
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });

    return eventCandidates.filter((event) => event.clubId === clubId);
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
