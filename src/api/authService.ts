import api from './axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  User,
} from '../types';

export const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get<User>('/auth/me'),

  changePassword: (data: ChangePasswordRequest) =>
    api.post('/auth/change-password', data),

  updateProfile: (data: UpdateProfileRequest) =>
    api.put<User>('/auth/profile', data),
};
