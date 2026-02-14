import api from './axios';
import type {
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
  Expense,
  ExpenseFilters,
  Page,
} from '../types';

export const expenseService = {
  create: (data: ExpenseCreateRequest) =>
    api.post<Expense>('/expenses', data),

  getAll: (filters: ExpenseFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.append('page', String(filters.page));
    if (filters.size !== undefined) params.append('size', String(filters.size));
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.search) params.append('search', filters.search);
    if (filters.minAmount !== undefined) params.append('minAmount', String(filters.minAmount));
    if (filters.maxAmount !== undefined) params.append('maxAmount', String(filters.maxAmount));
    return api.get<Page<Expense>>(`/expenses?${params.toString()}`);
  },

  getById: (id: string) =>
    api.get<Expense>(`/expenses/${id}`),

  update: (id: string, data: ExpenseUpdateRequest) =>
    api.put<Expense>(`/expenses/${id}`, data),

  delete: (id: string) =>
    api.delete(`/expenses/${id}`),

  bulkDelete: (ids: string[]) =>
    api.post('/expenses/bulk-delete', ids),
};
