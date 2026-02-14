import { useEffect, useState, useCallback } from 'react';
import { HiPlus, HiSearch, HiPencil, HiTrash, HiFilter } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Card, Input, Select, Modal, Pagination, ConfirmDialog, SkeletonTable } from '../../components';
import { expenseService } from '../../api/expenseService';
import { categoryService } from '../../api/categoryService';
import type { Expense, Category, ExpenseFilters } from '../../types';
import { formatCurrency, formatDate, debounce } from '../../utils/helpers';
import ExpenseForm from './ExpenseForm';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 0,
    size: 10,
    sort: 'expenseDate,desc',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll('EXPENSE');
      setCategories(res.data);
    } catch { /* handled */ }
  };

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await expenseService.getAll(filters);
      setExpenses(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch { /* handled */ }
    setLoading(false);
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setFilters((f) => ({ ...f, search: value || undefined, page: 0 }));
    }, 400),
    []
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await expenseService.delete(deleteTarget.id);
      toast.success('Expense deleted');
      setDeleteTarget(null);
      loadExpenses();
    } catch {
      toast.error('Failed to delete expense');
    }
    setDeleting(false);
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      await expenseService.bulkDelete(selectedIds);
      toast.success(`${selectedIds.length} expenses deleted`);
      setSelectedIds([]);
      setShowBulkDelete(false);
      loadExpenses();
    } catch {
      toast.error('Failed to delete expenses');
    }
    setDeleting(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expenses.map((e) => e.id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Expenses</h1>
          <p className="text-dark-400 text-sm mt-1">{totalElements} total expenses</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <Button variant="danger" onClick={() => setShowBulkDelete(true)}>
              <HiTrash className="w-4 h-4 mr-2" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button onClick={() => { setEditingExpense(null); setShowForm(true); }}>
            <HiPlus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="!p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search expenses..."
              icon={<HiSearch className="w-5 h-5" />}
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <HiFilter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-dark-700">
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
            <div className="flex gap-2">
              <Input
                label="Min Amount"
                type="number"
                placeholder="0"
                value={filters.minAmount ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
              />
              <Input
                label="Max Amount"
                type="number"
                placeholder="∞"
                value={filters.maxAmount ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, maxAmount: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={5} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-dark-500">
            <p className="text-lg">No expenses found</p>
            <p className="text-sm mt-1">Add your first expense to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700 text-left">
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === expenses.length && expenses.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded bg-dark-700 border-dark-600"
                    />
                  </th>
                  <th className="p-4 text-dark-400 font-medium">Description</th>
                  <th className="p-4 text-dark-400 font-medium">Category</th>
                  <th className="p-4 text-dark-400 font-medium">Date</th>
                  <th className="p-4 text-dark-400 font-medium text-right">Amount</th>
                  <th className="p-4 text-dark-400 font-medium">Tags</th>
                  <th className="p-4 text-dark-400 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(expense.id)}
                        onChange={() => toggleSelect(expense.id)}
                        className="rounded bg-dark-700 border-dark-600"
                      />
                    </td>
                    <td className="p-4 text-dark-200 font-medium">{expense.description}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-medium">
                        {expense.categoryName}
                      </span>
                    </td>
                    <td className="p-4 text-dark-400">{formatDate(expense.expenseDate)}</td>
                    <td className="p-4 text-right text-red-400 font-semibold">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="p-4">
                      {expense.tags && (
                        <div className="flex flex-wrap gap-1">
                          {expense.tags.split(',').map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-dark-700 text-dark-400 text-xs"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingExpense(expense); setShowForm(true); }}
                          className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-primary-400 transition-colors"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(expense)}
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
        onClose={() => { setShowForm(false); setEditingExpense(null); }}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <ExpenseForm
          expense={editingExpense}
          categories={categories}
          onSuccess={() => { setShowForm(false); setEditingExpense(null); loadExpenses(); }}
          onCancel={() => { setShowForm(false); setEditingExpense(null); }}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteTarget?.description}"?`}
        loading={deleting}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        isOpen={showBulkDelete}
        onClose={() => setShowBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Expenses"
        message={`Are you sure you want to delete ${selectedIds.length} expense(s)?`}
        loading={deleting}
      />
    </div>
  );
}
