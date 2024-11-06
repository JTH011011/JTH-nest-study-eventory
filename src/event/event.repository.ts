import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateEventData } from './type/create-event-data.type';
import { EventData } from './type/event-data.type';
import { User, Event, Category, City } from '@prisma/client';
import { EventQuery } from './query/event.query';
import { UpdateEventData } from './type/update-event-data.type';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}
  async createEvent(data: CreateEventData): Promise<EventData> {
    return this.prisma.event.create({
      data: {
        hostId: data.hostId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        cityId: data.cityId,
        startTime: data.startTime,
        endTime: data.endTime,
        maxPeople: data.maxPeople,
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        cityId: true,
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
  }
  //user가 존재하는지 확인
  async getUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
  }
  //category가 존재하는지 확인
  async getCategoryById(categoryId: number): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: {
        id: categoryId,
      },
    });
  }
  //city가 존재하는지 확인
  async getCityById(cityId: number): Promise<City | null> {
    return this.prisma.city.findFirst({
      where: {
        id: cityId,
      },
    });
  }
  //eventid로 event 조회
  async getEventById(eventId: number): Promise<EventData | null> {
    return this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        cityId: true,
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
  }
  // 나머지 조건들로 event 조회
  async getEvents(query: EventQuery): Promise<EventData[]> {
    return this.prisma.event.findMany({
      where: {
        host: {
          id: query.hostId,
          deletedAt: null,
        },
        categoryId: query.categoryId,
        cityId: query.cityId,
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        cityId: true,
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
  }
  //event 업데이트
  async updateEvent(
    eventId: number,
    data: UpdateEventData,
  ): Promise<EventData> {
    return this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        cityId: data.cityId,
        startTime: data.startTime,
        endTime: data.endTime,
        maxPeople: data.maxPeople,
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        cityId: true,
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
  }
  //event 삭제
  async deleteEvent(eventId: number): Promise<void> {
    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });
  }
}
