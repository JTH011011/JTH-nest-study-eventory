export type EventData = {
  id: number;
  hostId: number;
  title: string;
  description: string;
  categoryId: number;
  clubId: number | null;
  eventCity: {
    cityId: number;
  }[];
  startTime: Date;
  endTime: Date;
  maxPeople: number;
};
