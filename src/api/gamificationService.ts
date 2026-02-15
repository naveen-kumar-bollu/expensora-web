import api from './axios';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badgeColor: string;
  points: number;
  achievementType: string;
  criteriaType: string;
  criteriaValue?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievementName: string;
  achievementDescription: string;
  icon: string;
  badgeColor: string;
  points: number;
  earnedDate: string;
  progress: number;
  isNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const gamificationService = {
  getAllAchievements: () =>
    api.get<Achievement[]>('/gamification/achievements'),

  getMyAchievements: () =>
    api.get<UserAchievement[]>('/gamification/my-achievements'),

  getMyPoints: () =>
    api.get<{ totalPoints: number }>('/gamification/my-points'),

  awardAchievement: (achievementId: string) =>
    api.post<UserAchievement>(`/gamification/award/${achievementId}`),
};
