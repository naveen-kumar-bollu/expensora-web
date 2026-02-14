import api from './axios';

export interface ImportHistory {
  id: string;
  fileName: string;
  format: 'BANK_CSV' | 'MINT_CSV' | 'YNAB4' | 'CUSTOM_CSV';
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  duplicateRecords: number;
  errorLog?: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportPreview {
  previewData: Record<string, string>[];
  headers: string[];
  totalRows: number;
  detectedColumns: string[];
  columnMapping: Record<string, string>;
}

export const importExportService = {
  previewImport: (file: File, format: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    return api.post<ImportPreview>('/import-export/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  importTransactions: (file: File, format: string, columnMapping: Record<string, string>) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    return api.post<ImportHistory>('/import-export/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: columnMapping,
    });
  },

  getHistory: () =>
    api.get<ImportHistory[]>('/import-export/history'),

  exportExpenses: (startDate: string, endDate: string) =>
    api.get(`/import-export/export/expenses?startDate=${startDate}&endDate=${endDate}`, {
      responseType: 'blob',
    }),

  exportIncome: (startDate: string, endDate: string) =>
    api.get(`/import-export/export/income?startDate=${startDate}&endDate=${endDate}`, {
      responseType: 'blob',
    }),

  exportFullBackup: () =>
    api.get('/import-export/export/backup', {
      responseType: 'blob',
    }),
};
