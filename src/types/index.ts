// ─── Auth Types ───
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

// ─── Category Types ───
export type CategoryType = 'INCOME' | 'EXPENSE';

export interface CategoryCreateRequest {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  isDefault: boolean;
  userId: string;
}

// ─── Expense Types ───
export interface ExpenseCreateRequest {
  amount: number;
  description: string;
  categoryId: string;
  expenseDate: string;
  notes?: string;
  tags?: string;
}

export interface ExpenseUpdateRequest {
  amount?: number;
  description?: string;
  categoryId?: string;
  expenseDate?: string;
  notes?: string;
  tags?: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  userId: string;
  expenseDate: string;
  notes: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Income Types ───
export interface IncomeCreateRequest {
  amount: number;
  description: string;
  categoryId: string;
  incomeDate: string;
  notes?: string;
  tags?: string;
}

export interface IncomeUpdateRequest {
  amount?: number;
  description?: string;
  categoryId?: string;
  incomeDate?: string;
  notes?: string;
  tags?: string;
}

export interface Income {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  userId: string;
  incomeDate: string;
  notes: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Budget Types ───
export interface BudgetCreateRequest {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  percentage: number;
}

// ─── Dashboard Types ───
export interface DashboardSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
}

export interface CategoryBreakdown {
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: number;
  year: number;
  income: number;
  expense: number;
}

// ─── Insights Types ───
export interface Insights {
  insights: string[];
  financialHealthScore: number;
}

// ─── Recurring Transaction Types ───
export type TransactionType = 'INCOME' | 'EXPENSE';
export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface RecurringTransactionCreateRequest {
  categoryId: string;
  amount: number;
  description: string;
  transactionType: TransactionType;
  frequency: Frequency;
  startDate: string;
  endDate?: string;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  description: string;
  transactionType: TransactionType;
  frequency: Frequency;
  startDate: string;
  endDate: string | null;
  lastExecutionDate: string | null;
  active: boolean;
  createdAt: string;
}

// ─── Pagination Types ───
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

// ─── Filter Types ───
export interface ExpenseFilters extends PageRequest {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface IncomeFilters extends PageRequest {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}
