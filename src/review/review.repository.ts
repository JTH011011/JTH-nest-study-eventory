import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateReviewData } from './type/create-review-data.type';
import { ReviewData } from './type/review-data.type';
import { User, Event } from '@prisma/client';
import { ReviewQuery } from './query/review.query';
import { UpdateReviewData } from './type/update-review-data.type';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(data: CreateReviewData): Promise<ReviewData> {
    return this.prisma.review.create({
      data: {
        userId: data.userId,
        eventId: data.eventId,
        score: data.score,
        title: data.title,
        description: data.description,
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
  }

  async getEventById(eventId: number): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
  }

  async isReviewExist(userId: number, eventId: number): Promise<boolean> {
    const review = await this.prisma.review.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
        user: {
          deletedAt: null,
        },
      },
    });

    return !!review;
  }

  async isUserJoinedEvent(userId: number, eventId: number): Promise<boolean> {
    const event = await this.prisma.eventJoin.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
        user: {
          deletedAt: null,
        },
      },
    });

    return !!event;
  }

  async isClubAlive(clubId: number): Promise<boolean> {
    const club = await this.prisma.club.findUnique({
      where: {
        id: clubId,
        deletedAt: null,
      },
    });

    return !!club;
  }

  async isUserJoinedClub(userId: number, clubId: number): Promise<boolean> {
    const clubUser = await this.prisma.clubJoin.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
        user: {
          deletedAt: null,
        },
      },
    });

    return !!clubUser;
  }

  /*
  async getEventClubIdPairsByEventIds(
    eventIds: number[],
  ): Promise<{ id: number; clubId: number | null }[]> {
    return this.prisma.event.findMany({
      where: {
        id: {
          in: eventIds,
        },
      },
      select: {
        id: true,
        clubId: true,
      },
    });
  }

  async getAllAliveclubsByClubIds(
    clubIds: number[],
  ): Promise<{ id: number }[]> {
    return this.prisma.club.findMany({
      where: {
        id: {
          in: clubIds,
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
  }

  async getUserClubIdsByUserId(userId: number): Promise<number[] | null> {
    const clubJoin = await this.prisma.clubJoin.findMany({
      where: {
        userId,
        user: {
          deletedAt: null,
        },
      },
      select: {
        clubId: true,
      },
    });
    if (clubJoin.length === 0) {
      return null;
    }
    return clubJoin.map((cj) => cj.clubId);
  }
  */
  async getEventDetailsByEventIds(
    eventIds: number[]
  ): Promise<{ id: number; clubId: number | null; clubDeletedAt: Date | null }[]> {
    const events = await this.prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: {
        id: true,
        clubId: true,
        club: {
          select: { deletedAt: true },
        },
      },
    });
  
    return events.map((event) => ({
      id: event.id,
      clubId: event.clubId,
      clubDeletedAt: event.club?.deletedAt || null,
    }));
  }
  
  async getUserClubIdsByUserId(userId: number): Promise<number[] | null> {
    const clubJoins = await this.prisma.clubJoin.findMany({
      where: {
        userId,
        user: {
          deletedAt: null,
        },
      },
      select: {
        clubId: true,
      },
    });
    if (clubJoins.length === 0) {
      return null;
    }
    return clubJoins.map((clubJoin) => clubJoin.clubId);
  }

  async getUserEventIdsByUserId(userId: number): Promise<number[] | null> {
    const eventJoins = await this.prisma.eventJoin.findMany({
      where: {
        userId,
        user: {
          deletedAt: null,
        },
      },
      select: {
        eventId: true,
      },
    });
    if (eventJoins.length === 0) {
      return null;
    }
    return eventJoins.map((eventJoin) => eventJoin.eventId);
  }


  async getReviewById(reviewId: number): Promise<ReviewData | null> {
    return this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async getReviews(query: ReviewQuery): Promise<ReviewData[]> {
    return this.prisma.review.findMany({
      where: {
        eventId: query.eventId,
        user: {
          deletedAt: null,
          id: query.userId,
        },
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async updateReview(
    reviewId: number,
    data: UpdateReviewData,
  ): Promise<ReviewData> {
    return this.prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        score: data.score,
        title: data.title,
        description: data.description,
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async deleteReview(reviewId: number): Promise<void> {
    await this.prisma.review.delete({
      where: {
        id: reviewId,
      },
    });
  }
}
