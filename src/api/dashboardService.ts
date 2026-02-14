import api from './axios';
import type {
  DashboardSummary,
  CategoryBreakdown,
  MonthlyTrend,
  Insights,
} from '../types';

export const dashboardService = {
  getSummary: (month: number, year: number) =>
    api.get<DashboardSummary>(`/dashboard/summary?month=${month}&year=${year}`),

  getCategoryBreakdown: (month: number, year: number) =>
    api.get<CategoryBreakdown[]>(`/dashboard/category-breakdown?month=${month}&year=${year}`),

  getMonthlyTrend: (year: number) =>
    api.get<MonthlyTrend[]>(`/dashboard/monthly-trend?year=${year}`),

  getTopSpendingCategory: (month: number, year: number) =>
    api.get<string>(`/dashboard/top-spending-category?month=${month}&year=${year}`),
};

export const insightsService = {
  getInsights: (month: number, year: number) =>
    api.get<Insights>(`/insights?month=${month}&year=${year}`),
};

export const reportService = {
  exportExpensesCsv: (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', String(month));
    if (year !== undefined) params.append('year', String(year));
    return api.get(`/reports/expenses/csv?${params.toString()}`, {
      responseType: 'blob',
    });
  },

  exportIncomeCsv: (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', String(month));
    if (year !== undefined) params.append('year', String(year));
    return api.get(`/reports/income/csv?${params.toString()}`, {
      responseType: 'blob',
    });
  },

  getMonthlySummary: (month: number, year: number) =>
    api.get(`/reports/monthly-summary?month=${month}&year=${year}`, {
      responseType: 'blob',
    }),
};
