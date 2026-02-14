import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { HiTrendingUp, HiTrendingDown, HiCash, HiShieldCheck } from 'react-icons/hi';
import { Card, SkeletonCard } from '../../components';
import { dashboardService } from '../../api/dashboardService';
import { budgetService } from '../../api/budgetService';
import { expenseService } from '../../api/expenseService';
import type { DashboardSummary, CategoryBreakdown, MonthlyTrend, Budget, Expense } from '../../types';
import { formatCurrency, getCurrentMonth, getCurrentYear, getShortMonthName, CHART_COLORS } from '../../utils/helpers';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [topCategory, setTopCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const month = getCurrentMonth();
  const year = getCurrentYear();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [summaryRes, breakdownRes, trendRes, budgetRes, expenseRes, topRes] =
        await Promise.all([
          dashboardService.getSummary(month, year),
          dashboardService.getCategoryBreakdown(month, year),
          dashboardService.getMonthlyTrend(year),
          budgetService.getAll(month, year),
          expenseService.getAll({ page: 0, size: 5, sort: 'expenseDate,desc' }),
          dashboardService.getTopSpendingCategory(month, year),
        ]);

      setSummary(summaryRes.data);
      setCategoryBreakdown(breakdownRes.data);
      setMonthlyTrend(trendRes.data);
      setBudgets(budgetRes.data);
      setRecentExpenses(expenseRes.data.content);
      setTopCategory(topRes.data);
    } catch {
      // Errors handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const savingsPercentage = summary && summary.monthlyIncome > 0
    ? ((summary.netSavings / summary.monthlyIncome) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-dark-100">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const trendData = monthlyTrend.map((t) => ({
    name: getShortMonthName(t.month),
    Income: t.income,
    Expense: t.expense,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-dark-100">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Monthly Income</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {formatCurrency(summary?.monthlyIncome || 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10">
              <HiTrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {formatCurrency(summary?.monthlyExpenses || 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10">
              <HiTrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Net Savings</p>
              <p className={`text-2xl font-bold mt-1 ${(summary?.netSavings || 0) >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
                {formatCurrency(summary?.netSavings || 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-primary-500/10">
              <HiCash className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Savings Rate</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{savingsPercentage}%</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10">
              <HiShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Expense Breakdown</h3>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="amount"
                  nameKey="categoryName"
                  paddingAngle={2}
                >
                  {categoryBreakdown.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dark-500">
              No expense data for this month
            </div>
          )}
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {categoryBreakdown.map((cat, i) => (
              <div key={cat.categoryName} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="text-dark-300">{cat.categoryName}</span>
                <span className="text-dark-500">({cat.percentage.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Monthly Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="Income" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dark-500">
              No trend data available
            </div>
          )}
        </Card>
      </div>

      {/* Budget Progress & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Progress */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Budget Progress</h3>
          {budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const pct = Math.min(budget.percentage, 100);
                const color =
                  budget.percentage >= 100
                    ? 'bg-red-500'
                    : budget.percentage >= 80
                    ? 'bg-yellow-500'
                    : 'bg-primary-500';

                return (
                  <div key={budget.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-dark-300">{budget.categoryName}</span>
                      <span className="text-dark-400">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {budget.percentage >= 100 && (
                      <p className="text-xs text-red-400 mt-1">Budget exceeded!</p>
                    )}
                    {budget.percentage >= 80 && budget.percentage < 100 && (
                      <p className="text-xs text-yellow-400 mt-1">Approaching limit</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-dark-500 py-8">No budgets set for this month</div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-100">Recent Expenses</h3>
            {topCategory && (
              <span className="text-xs bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full">
                Top: {topCategory}
              </span>
            )}
          </div>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between py-3 border-b border-dark-700/50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-dark-200">{expense.description}</p>
                    <p className="text-xs text-dark-500">
                      {expense.categoryName} · {expense.expenseDate}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-red-400">
                    -{formatCurrency(expense.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-dark-500 py-8">No recent expenses</div>
          )}
        </Card>
      </div>
    </div>
  );
}
