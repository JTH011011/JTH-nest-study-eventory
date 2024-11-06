import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { EventDto, EventListDto } from './dto/event.dto';
import { CreateEventPayload } from './payload/create-event.payload';
import { EventQuery } from './query/event.query';
import { PutUpdateEventPayload } from './payload/put-update-event.payload';
import { PatchUpdateEventPayload } from './payload/patch-update-event.payload';

@Controller('events')
@ApiTags('Event API')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: '이벤트 생성' })
  @ApiCreatedResponse({ type: EventDto })
  async createEvent(@Body() payload: CreateEventPayload): Promise<EventDto> {
    return this.eventService.createEvent(payload);
  }

  @Get(':eventId')
  @ApiOperation({ summary: '이벤트 상세 정보 가져오기' })
  @ApiOkResponse({ type: EventDto })
  async getEventById(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<EventDto> {
    return this.eventService.getEventById(eventId);
  }

  @Get()
  @ApiOperation({ summary: '여러 이벤트 정보 가져오기' })
  @ApiOkResponse({ type: EventListDto })
  async getEvents(@Query() query: EventQuery): Promise<EventListDto> {
    return this.eventService.getEvents(query);
  }

  @Put(':eventId')
  @ApiOperation({ summary: '이벤트 수정(put)' })
  @ApiOkResponse({ type: EventDto })
  async putUpdateEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() payload: PutUpdateEventPayload,
  ): Promise<EventDto> {
    return this.eventService.putUpdateEvent(eventId, payload);
  }

  @Patch(':eventId')
  @ApiOperation({ summary: '이벤트 수정(patch)' })
  @ApiOkResponse({ type: EventDto })
  async patchUpdateEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() payload: PatchUpdateEventPayload,
  ): Promise<EventDto> {
    return this.eventService.patchUpdateEvent(eventId, payload);
  }

  @Delete(':eventId')
  @HttpCode(204)
  @ApiOperation({ summary: '이벤트 삭제' })
  @ApiNoContentResponse()
  async deleteEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<void> {
    return this.eventService.deleteEvent(eventId);
  }
}
