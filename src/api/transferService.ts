import api from './axios';
import type { Transfer, TransferCreateRequest } from '../types';

export const transferService = {
  create: (data: TransferCreateRequest) =>
    api.post<Transfer>('/transfers', data),

  getAll: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get<Transfer[]>(`/transfers?${params.toString()}`);
  },

  getByAccount: (accountId: string) =>
    api.get<Transfer[]>(`/transfers/account/${accountId}`),

  delete: (id: string) =>
    api.delete(`/transfers/${id}`),
};
