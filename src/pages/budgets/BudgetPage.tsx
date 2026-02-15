import { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Card, Select, Modal, ConfirmDialog, SkeletonCard } from '../../components';
import { budgetService } from '../../api/budgetService';
import { categoryService } from '../../api/categoryService';
import type { Budget, Category } from '../../types';
import { formatCurrency, getCurrentMonth, getCurrentYear, getMonthName } from '../../utils/helpers';
import BudgetForm from './BudgetForm';

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [month, year]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll('EXPENSE');
      setCategories(res.data);
    } catch { /* handled */ }
  };

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetService.getAll(month, year);
      setBudgets(res.data);
    } catch { /* handled */ }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await budgetService.delete(deleteTarget.id);
      toast.success('Budget deleted');
      setDeleteTarget(null);
      loadBudgets();
    } catch {
      toast.error('Failed to delete budget');
    }
    setDeleting(false);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: getMonthName(i + 1),
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(getCurrentYear() - 2 + i),
    label: String(getCurrentYear() - 2 + i),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-100">Budgets</h1>
        <Button onClick={() => { setEditingBudget(null); setShowForm(true); }}>
          <HiPlus className="w-4 h-4 mr-2" />
          Set Budget
        </Button>
      </div>

      {/* Month/Year Selector */}
      <Card className="!p-4">
        <div className="flex gap-4">
          <Select
            options={monthOptions}
            value={String(month)}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
          <Select
            options={yearOptions}
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </Card>

      {/* Overall Progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-dark-100">Overall Budget</h3>
          <span className="text-dark-400">
            {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
          </span>
        </div>
        <div className="h-4 bg-dark-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              overallPercentage >= 100
                ? 'bg-red-500'
                : overallPercentage >= 80
                ? 'bg-yellow-500'
                : 'bg-gradient-to-r from-primary-500 to-purple-500'
            }`}
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-dark-400 mt-2">{overallPercentage.toFixed(1)}% used</p>
      </Card>

      {/* Budget Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : budgets.length === 0 ? (
        <Card>
          <div className="text-center text-dark-500 py-8">
            <p className="text-lg">No budgets set for {getMonthName(month)} {year}</p>
            <p className="text-sm mt-1">Click "Set Budget" to create one</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => {
            const pct = Math.min(budget.percentage, 100);
            const isOver = budget.percentage >= 100;
            const isWarning = budget.percentage >= 80 && !isOver;

            return (
              <Card key={budget.id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-dark-200">{budget.categoryName}</h4>
                    <p className="text-xs text-dark-500 mt-0.5">
                      {getMonthName(budget.budgetMonth)} {budget.budgetYear}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingBudget(budget); setShowForm(true); }}
                      className="p-1 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-primary-400 transition-colors"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(budget)}
                      className="p-1 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-red-400 transition-colors"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span className="text-dark-400">Spent</span>
                  <span className={isOver ? 'text-red-400 font-semibold' : 'text-dark-300'}>
                    {formatCurrency(budget.spent)}
                  </span>
                </div>

                <div className="h-2 bg-dark-700 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs">
                  <span className={isOver ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-dark-500'}>
                    {budget.percentage.toFixed(1)}%
                  </span>
                  <span className="text-dark-500">
                    Budget: {formatCurrency(budget.amount)}
                  </span>
                </div>

                {isOver && (
                  <p className="text-xs text-red-400 mt-2 bg-red-500/10 px-2 py-1 rounded-lg text-center">
                    Budget exceeded!
                  </p>
                )}
                {isWarning && (
                  <p className="text-xs text-yellow-400 mt-2 bg-yellow-500/10 px-2 py-1 rounded-lg text-center">
                    Approaching budget limit
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingBudget(null); }}
        title={editingBudget ? 'Edit Budget' : 'Set Budget'}
      >
        <BudgetForm
          budget={editingBudget}
          categories={categories}
          currentMonth={month}
          currentYear={year}
          onSuccess={() => { setShowForm(false); setEditingBudget(null); loadBudgets(); }}
          onCancel={() => { setShowForm(false); setEditingBudget(null); }}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Are you sure you want to delete the budget for "${deleteTarget?.categoryName}"?`}
        loading={deleting}
      />
    </div>
  );
}
