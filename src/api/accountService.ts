import api from './axios';
import type { Account, AccountCreateRequest } from '../types';

export const accountService = {
  create: (data: AccountCreateRequest) =>
    api.post<Account>('/accounts', data),

  getAll: () =>
    api.get<Account[]>('/accounts'),

  getActive: () =>
    api.get<Account[]>('/accounts/active'),

  getById: (id: string) =>
    api.get<Account>(`/accounts/${id}`),

  update: (id: string, data: AccountCreateRequest) =>
    api.put<Account>(`/accounts/${id}`, data),

  delete: (id: string) =>
    api.delete(`/accounts/${id}`),
};
