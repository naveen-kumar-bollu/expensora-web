import api from './axios';
import type {
  IncomeCreateRequest,
  IncomeUpdateRequest,
  Income,
  IncomeFilters,
  Page,
} from '../types';

export const incomeService = {
  create: (data: IncomeCreateRequest) =>
    api.post<Income>('/incomes', data),

  getAll: (filters: IncomeFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.append('page', String(filters.page));
    if (filters.size !== undefined) params.append('size', String(filters.size));
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    return api.get<Page<Income>>(`/incomes?${params.toString()}`);
  },

  getSummary: (month: number, year: number) =>
    api.get<number>(`/incomes/summary?month=${month}&year=${year}`),

  getById: (id: string) =>
    api.get<Income>(`/incomes/${id}`),

  update: (id: string, data: IncomeUpdateRequest) =>
    api.put<Income>(`/incomes/${id}`, data),

  delete: (id: string) =>
    api.delete(`/incomes/${id}`),

  bulkDelete: (ids: string[]) =>
    api.post('/incomes/bulk-delete', ids),
};
