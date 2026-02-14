import api from './axios';

export interface TaxReport {
  taxCategory: string;
  totalAmount: number;
  transactionCount: number;
}

export const taxService = {
  getAnnualReport: (year: number) =>
    api.get<TaxReport[]>(`/tax/report/${year}`),

  getQuarterlyReport: (year: number, quarter: number) =>
    api.get<TaxReport[]>(`/tax/report/${year}/quarter/${quarter}`),
};
