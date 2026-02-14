import api from './axios';
import type { Goal, GoalCreateRequest } from '../types';

export const goalService = {
  create: (data: GoalCreateRequest) =>
    api.post<Goal>('/goals', data),

  getAll: () =>
    api.get<Goal[]>('/goals'),

  getActive: () =>
    api.get<Goal[]>('/goals/active'),

  getCompleted: () =>
    api.get<Goal[]>('/goals/completed'),

  getById: (id: string) =>
    api.get<Goal>(`/goals/${id}`),

  update: (id: string, data: GoalCreateRequest) =>
    api.put<Goal>(`/goals/${id}`, data),

  delete: (id: string) =>
    api.delete(`/goals/${id}`),
};
