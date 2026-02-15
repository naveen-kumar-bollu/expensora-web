import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { authService } from './api/authService';
import PrivateRoute from './routes/PrivateRoute';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Lazy loaded pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ExpensesPage = lazy(() => import('./pages/expenses/ExpensesPage'));
const IncomePage = lazy(() => import('./pages/income/IncomePage'));
const BudgetPage = lazy(() => import('./pages/budgets/BudgetPage'));
const AccountsPage = lazy(() => import('./pages/accounts/AccountsPage'));
const GoalsPage = lazy(() => import('./pages/goals/GoalsPage'));
const RecurringPage = lazy(() => import('./pages/recurring/RecurringPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const ImportExportPage = lazy(() => import('./pages/import-export/ImportExportPage'));
const DebtsPage = lazy(() => import('./pages/debts/DebtsPage'));
const HouseholdsPage = lazy(() => import('./pages/households/HouseholdsPage'));
const TaxPage = lazy(() => import('./pages/tax/TaxPage'));
const CalendarPage = lazy(() => import('./pages/calendar/CalendarPage'));
const GamificationPage = lazy(() => import('./pages/gamification/GamificationPage'));
const SplitsPage = lazy(() => import('./pages/splits/SplitsPage'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const { token, setAuth, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          setAuth(res.data, token, localStorage.getItem('refreshToken') || '');
        } catch {
          logout();
        }
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/budgets" element={<BudgetPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/recurring" element={<RecurringPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/import-export" element={<ImportExportPage />} />
          <Route path="/debts" element={<DebtsPage />} />
          <Route path="/households" element={<HouseholdsPage />} />
          <Route path="/tax" element={<TaxPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/achievements" element={<GamificationPage />} />
          <Route path="/splits" element={<SplitsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
