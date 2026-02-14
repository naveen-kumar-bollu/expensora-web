import { useEffect, useState, useCallback } from 'react';
import { HiPlus, HiPencil, HiTrash, HiCash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Card, Input, Select, Modal, Pagination, ConfirmDialog, SkeletonTable } from '../../components';
import { incomeService } from '../../api/incomeService';
import { categoryService } from '../../api/categoryService';
import type { Income, Category, IncomeFilters } from '../../types';
import { formatCurrency, formatDate, getCurrentMonth, getCurrentYear } from '../../utils/helpers';
import IncomeForm from './IncomeForm';

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [monthlySummary, setMonthlySummary] = useState<number>(0);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Income | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [filters, setFilters] = useState<IncomeFilters>({
    page: 0,
    size: 10,
    sort: 'incomeDate,desc',
  });

  useEffect(() => {
    loadCategories();
    loadMonthlySummary();
  }, []);

  useEffect(() => {
    loadIncomes();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll('INCOME');
      setCategories(res.data);
    } catch { /* handled */ }
  };

  const loadIncomes = async () => {
    setLoading(true);
    try {
      const res = await incomeService.getAll(filters);
      setIncomes(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch { /* handled */ }
    setLoading(false);
  };

  const loadMonthlySummary = async () => {
    try {
      const res = await incomeService.getSummary(getCurrentMonth(), getCurrentYear());
      setMonthlySummary(res.data);
    } catch { /* handled */ }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await incomeService.delete(deleteTarget.id);
      toast.success('Income deleted');
      setDeleteTarget(null);
      loadIncomes();
      loadMonthlySummary();
    } catch {
      toast.error('Failed to delete income');
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Income</h1>
          <p className="text-dark-400 text-sm mt-1">{totalElements} total entries</p>
        </div>
        <Button onClick={() => { setEditingIncome(null); setShowForm(true); }}>
          <HiPlus className="w-4 h-4 mr-2" />
          Add Income
        </Button>
      </div>

      {/* Monthly Summary */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10">
            <HiCash className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-dark-400">This Month's Income</p>
            <p className="text-3xl font-bold text-green-400">{formatCurrency(monthlySummary)}</p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="!p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value || undefined, page: 0 }))}
          />
          <Input
            label="End Date"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value || undefined, page: 0 }))}
          />
          <Select
            label="Category"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="All Categories"
            value={filters.categoryId || ''}
            onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value || undefined, page: 0 }))}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={5} /></div>
        ) : incomes.length === 0 ? (
          <div className="p-12 text-center text-dark-500">
            <p className="text-lg">No income entries found</p>
            <p className="text-sm mt-1">Add your first income to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700 text-left">
                  <th className="p-4 text-dark-400 font-medium">Description</th>
                  <th className="p-4 text-dark-400 font-medium">Category</th>
                  <th className="p-4 text-dark-400 font-medium">Date</th>
                  <th className="p-4 text-dark-400 font-medium text-right">Amount</th>
                  <th className="p-4 text-dark-400 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income.id} className="border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors">
                    <td className="p-4 text-dark-200 font-medium">{income.description}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium">
                        {income.categoryName}
                      </span>
                    </td>
                    <td className="p-4 text-dark-400">{formatDate(income.incomeDate)}</td>
                    <td className="p-4 text-right text-green-400 font-semibold">
                      +{formatCurrency(income.amount)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingIncome(income); setShowForm(true); }}
                          className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-primary-400 transition-colors"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(income)}
                          className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination
        currentPage={filters.page || 0}
        totalPages={totalPages}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingIncome(null); }}
        title={editingIncome ? 'Edit Income' : 'Add Income'}
      >
        <IncomeForm
          income={editingIncome}
          categories={categories}
          onSuccess={() => { setShowForm(false); setEditingIncome(null); loadIncomes(); loadMonthlySummary(); }}
          onCancel={() => { setShowForm(false); setEditingIncome(null); }}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Income"
        message={`Are you sure you want to delete "${deleteTarget?.description}"?`}
        loading={deleting}
      />
    </div>
  );
}
