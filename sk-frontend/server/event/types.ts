import { ApiProduct } from "../product/types";

export type EventStatus =
  | "DRAFT"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED";

export interface Event {
  id: string;
  slug: string;
  name: string;
  tagLine: string;
  description: string;
  thumbnail: string;
  banner: string;

  status: EventStatus;

  startDate: string;
  endDate: string;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  _count: {
    products: number;
  };
  products:ApiProduct[]
}

export interface GetEventsResponseDashboard {
  message: string;
  data:Event[]
}
export interface GetEventsResponse {
  message: string;
  data: {
    events: Event[];

    totalDraft: number;
    totalActive: number;
    totalProducts:number;
  };
}

export interface GetEventResponse {
  message: string;
  data: Event;
}
export interface EventFormData {
  name: string;
  slug: string;
  tagLine: string;
  description: string;
  status: EventStatus;

  startDate: string;
  endDate: string;
}