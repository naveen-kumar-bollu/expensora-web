import api from './axios';

export interface TransactionSplit {
  id: string;
  expenseId?: string;
  incomeId?: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage?: number;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSplitCreateRequest {
  expenseId?: string;
  incomeId?: string;
  categoryId: string;
  amount: number;
  percentage?: number;
  description?: string;
}

export const transactionSplitService = {
  create: (data: TransactionSplitCreateRequest) =>
    api.post<TransactionSplit>('/transaction-splits', data),

  getByExpenseId: (expenseId: string) =>
    api.get<TransactionSplit[]>(`/transaction-splits/expense/${expenseId}`),

  getByIncomeId: (incomeId: string) =>
    api.get<TransactionSplit[]>(`/transaction-splits/income/${incomeId}`),

  getMySplits: () =>
    api.get<TransactionSplit[]>('/transaction-splits/my-splits'),

  delete: (id: string) =>
    api.delete(`/transaction-splits/${id}`),
};
