import api from './axios';

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'EXPENSE' | 'INCOME' | 'RECURRING' | 'BUDGET';
  amount: number;
  date: string;
  categoryName?: string;
  categoryColor?: string;
  description?: string;
}

export const calendarService = {
  getEvents: (startDate: string, endDate: string) =>
    api.get<CalendarEvent[]>(`/calendar/events?startDate=${startDate}&endDate=${endDate}`),
};
