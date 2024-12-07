export type CreateEventData = {
  hostId: number;
  title: string;
  clubId?: number | null;
  description: string;
  categoryId: number;
  cityIds: number[];
  startTime: Date;
  endTime: Date;
  maxPeople: number;
};
