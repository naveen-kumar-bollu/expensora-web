import api from './axios';
import type { Category, CategoryCreateRequest } from '../types';

export const categoryService = {
  create: (data: CategoryCreateRequest) =>
    api.post<Category>('/categories', data),

  getAll: (type?: string) => {
    const params = type ? `?type=${type}` : '';
    return api.get<Category[]>(`/categories${params}`);
  },

  update: (id: string, data: CategoryCreateRequest) =>
    api.put<Category>(`/categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`),
};
