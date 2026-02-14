import api from './axios';
import type { Budget, BudgetCreateRequest } from '../types';

export const budgetService = {
  create: (data: BudgetCreateRequest) =>
    api.post<Budget>('/budgets', data),

  getAll: (month: number, year: number) =>
    api.get<Budget[]>(`/budgets?month=${month}&year=${year}`),

  getHistory: (categoryId: string) =>
    api.get<Budget[]>(`/budgets/history?categoryId=${categoryId}`),

  update: (id: string, data: BudgetCreateRequest) =>
    api.put<Budget>(`/budgets/${id}`, data),

  delete: (id: string) =>
    api.delete(`/budgets/${id}`),
};
