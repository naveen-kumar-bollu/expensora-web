import { useState, useEffect } from 'react';
import { HiPlus, HiTrash, HiRefresh } from 'react-icons/hi';
import { recurringTransactionService } from '../../api/recurringTransactionService';
import { categoryService } from '../../api/categoryService';
import type { RecurringTransaction, RecurringTransactionCreateRequest, TransactionType, Frequency, Category } from '../../types';
import { Button, Card, Modal } from '../../components';
import toast from 'react-hot-toast';

const frequencyLabels: Record<Frequency, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

export default function RecurringPage() {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<RecurringTransactionCreateRequest>({
    categoryId: '',
    amount: 0,
    description: '',
    transactionType: 'EXPENSE',
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [formData.transactionType]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll(formData.transactionType);
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await recurringTransactionService.getAll();
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to load recurring transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recurringTransactionService.create(formData);
      toast.success('Recurring transaction created successfully');
      fetchTransactions();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to create recurring transaction');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;
    try {
      await recurringTransactionService.delete(id);
      toast.success('Recurring transaction deleted successfully');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete recurring transaction');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      categoryId: '',
      amount: 0,
      description: '',
      transactionType: 'EXPENSE',
      frequency: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  const activeTransactions = transactions.filter(t => t.active);
  const inactiveTransactions = transactions.filter(t => !t.active);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Recurring Transactions</h1>
          <p className="text-dark-400 mt-1">Manage your recurring income and expenses</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <HiPlus className="w-4 h-4 mr-2" />
          Add Recurring
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-dark-400">Active Recurring</h3>
          <p className="text-3xl font-bold text-dark-50 mt-2">{activeTransactions.length}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-dark-400">Monthly Total</h3>
          <p className="text-3xl font-bold text-dark-50 mt-2">
            ₹{activeTransactions
              .filter(t => t.frequency === 'MONTHLY')
              .reduce((sum, t) => sum + (t.transactionType === 'INCOME' ? t.amount : -t.amount), 0)
              .toFixed(2)}
          </p>
        </Card>
      </div>

      {activeTransactions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-dark-50 mb-4">Active Recurring Transactions</h2>
          <div className="space-y-3">
            {activeTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      transaction.transactionType === 'INCOME'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      <HiRefresh className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-50">{transaction.description}</h3>
                      <p className="text-sm text-dark-400">
                        {transaction.categoryName} • {frequencyLabels[transaction.frequency]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.transactionType === 'INCOME' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.transactionType === 'INCOME' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-dark-500">
                        Next: {transaction.lastExecutionDate || transaction.startDate}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <HiTrash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {!loading && transactions.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-dark-400">
            No recurring transactions yet. Create one to automate your income and expenses.
          </p>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title="Add Recurring Transaction">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Type</label>
            <select
              value={formData.transactionType}
              onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as TransactionType })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setFormData({ ...formData, amount: isNaN(val) ? 0 : val });
              }}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Frequency })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
            >
              {Object.entries(frequencyLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">End Date (Optional)</label>
            <input
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value || undefined })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              Create Recurring
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
