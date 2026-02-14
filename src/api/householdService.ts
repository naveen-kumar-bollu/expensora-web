import api from './axios';

export interface Household {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdCreateRequest {
  name: string;
  description?: string;
}

export interface AddMemberRequest {
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

export const householdService = {
  create: (data: HouseholdCreateRequest) =>
    api.post<Household>('/households', data),

  getAll: () =>
    api.get<Household[]>('/households'),

  getById: (id: string) =>
    api.get<Household>(`/households/${id}`),

  update: (id: string, data: HouseholdCreateRequest) =>
    api.put<Household>(`/households/${id}`, data),

  delete: (id: string) =>
    api.delete(`/households/${id}`),

  addMember: (householdId: string, data: AddMemberRequest) =>
    api.post(`/households/${householdId}/members`, data),

  removeMember: (householdId: string, memberId: string) =>
    api.delete(`/households/${householdId}/members/${memberId}`),
};
