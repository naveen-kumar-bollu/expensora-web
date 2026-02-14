import api from './axios';
import type { RecurringTransaction, RecurringTransactionCreateRequest } from '../types';

export const recurringTransactionService = {
  create: (data: RecurringTransactionCreateRequest) =>
    api.post<RecurringTransaction>('/recurring-transactions', data),

  getAll: () =>
    api.get<RecurringTransaction[]>('/recurring-transactions'),

  update: (id: string, data: RecurringTransactionCreateRequest) =>
    api.put<RecurringTransaction>(`/recurring-transactions/${id}`, data),

  delete: (id: string) =>
    api.delete(`/recurring-transactions/${id}`),
};
