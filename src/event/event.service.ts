import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventRepository } from './event.repository';
import { CreateEventPayload } from './payload/create-event.payload';
import { EventDto, EventListDto } from './dto/event.dto';
import { CreateEventData } from './type/create-event-data.type';
import { EventQuery } from './query/event.query';
import { UpdateEventData } from './type/update-event-data.type';
import { EventData } from './type/event-data.type';
import { PutUpdateEventPayload } from './payload/put-update-event.payload';
import { PatchUpdateEventPayload } from './payload/patch-update-event.payload';
import { throwIfEmpty } from 'rxjs';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}
  async createEvent(payload: CreateEventPayload): Promise<EventDto> {
    if (payload.startTime >= payload.endTime) {
      throw new BadRequestException('시작 시간은 종료 시간보다 빨라야 합니다.');
    }
    if (payload.startTime <= new Date()) {
      throw new BadRequestException('시작 시간은 현재 시간보다 늦어야 합니다.');
    }
    if (payload.maxPeople <= 0) {
      throw new BadRequestException('최대 인원은 0보다 커야 합니다.');
    }
    const host = await this.eventRepository.getUserById(payload.hostId);
    if (!host) {
      throw new NotFoundException('호스트가 존재하지 않습니다.');
    }
    const category = await this.eventRepository.getCategoryById(
      payload.categoryId,
    );
    if (!category) {
      throw new NotFoundException('카테고리가 존재하지 않습니다.');
    }
    const city = await this.eventRepository.getCityById(payload.cityId);
    if (!city) {
      throw new NotFoundException('도시가 존재하지 않습니다.');
    }

    const createData: CreateEventData = {
      hostId: payload.hostId,
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityId: payload.cityId,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };
    const event = await this.eventRepository.createEvent(createData);
    return EventDto.from(event);
  }
  async getEventById(eventId: number): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('이벤트가 존재하지 않습니다.');
    }
    return EventDto.from(event);
  }
  async getEvents(query: EventQuery): Promise<EventListDto> {
    const events = await this.eventRepository.getEvents(query);
    return EventListDto.from(events);
  }
  async putUpdateEvent(
    eventId: number,
    payload: PutUpdateEventPayload,
  ): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventId);

    if (!event) {
      throw new NotFoundException('이벤트가 존재하지 않습니다.');
    }
    const updateData: UpdateEventData = {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityId: payload.cityId,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };

    const updateEvent = await this.eventRepository.updateEvent(
      eventId,
      updateData,
    );
    return EventDto.from(updateEvent);
  }
  async patchUpdateEvent(
    eventId: number,
    payload: PatchUpdateEventPayload,
  ): Promise<EventDto> {
    if (payload.title === null) {
      throw new BadRequestException('제목은 null 될수 없습니다.');
    }
    if (payload.description === null) {
      throw new BadRequestException('설명은 null 될수 없습니다.');
    }
    if (payload.categoryId === null) {
      throw new BadRequestException('카테고리 ID는 null 될수 없습니다.');
    }
    if (payload.cityId === null) {
      throw new BadRequestException('도시 ID는 null 될수 없습니다.');
    }
    if (payload.startTime === null) {
      throw new BadRequestException('시작 시간은 null 될수 없습니다.');
    }
    if (payload.endTime === null) {
      throw new BadRequestException('종료 시간은 null 될수 없습니다.');
    }
    if (payload.maxPeople === null) {
      throw new BadRequestException('최대 인원은 null 될수 없습니다.');
    }
    if (
      payload.startTime &&
      payload.endTime &&
      payload.startTime >= payload.endTime
    ) {
      throw new BadRequestException('시작 시간은 종료 시간보다 빨라야 합니다.');
    }

    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('이벤트가 존재하지 않습니다.');
    }
    if (event.endTime <= new Date()) {
      throw new BadRequestException('이벤트가 이미 종료되었습니다.');
    }
    if (payload.startTime) {
      if (payload.startTime <= new Date()) {
        throw new BadRequestException(
          '시작 시간은 현재 시간보다 늦어야 합니다.',
        );
      }
      if (payload.startTime >= event.endTime) {
        throw new BadRequestException(
          '시작 시간은 원래 있던 종료 시간보다 빨라야 합니다.',
        );
      }
    }
    if (payload.endTime) {
      if (payload.endTime <= new Date()) {
        throw new BadRequestException(
          '종료 시간은 현재 시간보다 늦어야 합니다.',
        );
      }
    }
    if (payload.maxPeople && payload.maxPeople <= 0) {
      throw new BadRequestException('최대 인원은 0보다 커야 합니다.');
    }
    return EventDto.from(event);
  }
  async deleteEvent(eventId: number): Promise<void> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('이벤트가 존재하지 않습니다.');
    }
    await this.eventRepository.deleteEvent(eventId);
  }
}
