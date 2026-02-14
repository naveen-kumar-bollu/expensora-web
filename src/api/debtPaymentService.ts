import api from './axios';

export interface DebtPayment {
  id: string;
  debtId: string;
  debtName: string;
  amount: number;
  principalPaid: number;
  interestPaid: number;
  paymentDate: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtPaymentCreateRequest {
  debtId: string;
  amount: number;
  principalPaid: number;
  interestPaid: number;
  paymentDate: string;
  notes?: string;
}

export const debtPaymentService = {
  create: (data: DebtPaymentCreateRequest) =>
    api.post<DebtPayment>('/debt-payments', data),

  getByDebt: (debtId: string) =>
    api.get<DebtPayment[]>(`/debt-payments/debt/${debtId}`),

  delete: (id: string) =>
    api.delete(`/debt-payments/${id}`),
};
