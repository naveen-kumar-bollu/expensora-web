import api from './axios';
import type { GoalContribution, GoalContributionCreateRequest } from '../types';

export const goalContributionService = {
  create: (data: GoalContributionCreateRequest) =>
    api.post<GoalContribution>('/goal-contributions', data),

  getByGoal: (goalId: string) =>
    api.get<GoalContribution[]>(`/goal-contributions/goal/${goalId}`),

  delete: (id: string) =>
    api.delete(`/goal-contributions/${id}`),
};
