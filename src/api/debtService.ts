import api from './axios';

export interface Debt {
  id: string;
  name: string;
  debtType: 'CREDIT_CARD' | 'PERSONAL_LOAN' | 'AUTO_LOAN' | 'MORTGAGE' | 'STUDENT_LOAN' | 'OTHER';
  principalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  startDate: string;
  targetPayoffDate: string;
  notes?: string;
  isActive: boolean;
  userId: string;
  accountId?: string;
  accountName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtCreateRequest {
  name: string;
  debtType: string;
  principalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  startDate: string;
  targetPayoffDate: string;
  notes?: string;
  accountId?: string;
}

export const debtService = {
  create: (data: DebtCreateRequest) =>
    api.post<Debt>('/debts', data),

  getAll: () =>
    api.get<Debt[]>('/debts'),

  getActive: () =>
    api.get<Debt[]>('/debts/active'),

  getById: (id: string) =>
    api.get<Debt>(`/debts/${id}`),

  update: (id: string, data: DebtCreateRequest) =>
    api.put<Debt>(`/debts/${id}`, data),

  delete: (id: string) =>
    api.delete(`/debts/${id}`),
};
