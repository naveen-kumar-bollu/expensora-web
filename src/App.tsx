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
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

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
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
