import { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Card, Modal, ConfirmDialog, Input, Select } from '../../components';
import { debtService, type Debt, type DebtCreateRequest } from '../../api/debtService';
import { debtPaymentService, type DebtPayment } from '../../api/debtPaymentService';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formData, setFormData] = useState<DebtCreateRequest>({
    name: '',
    debtType: 'CREDIT_CARD',
    principalAmount: 0,
    currentBalance: 0,
    interestRate: 0,
    minimumPayment: 0,
    startDate: new Date().toISOString().split('T')[0],
    targetPayoffDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    setLoading(true);
    try {
      const res = await debtService.getAll();
      setDebts(res.data);
    } catch {
      toast.error('Failed to load debts');
    }
    setLoading(false);
  };

  const loadPayments = async (debtId: string) => {
    try {
      const res = await debtPaymentService.getByDebt(debtId);
      setPayments(res.data);
    } catch {
      toast.error('Failed to load payments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDebt) {
        await debtService.update(editingDebt.id, formData);
        toast.success('Debt updated');
      } else {
        await debtService.create(formData);
        toast.success('Debt created');
      }
      setShowForm(false);
      loadDebts();
      resetForm();
    } catch {
      toast.error('Failed to save debt');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      debtType: 'CREDIT_CARD',
      principalAmount: 0,
      currentBalance: 0,
      interestRate: 0,
      minimumPayment: 0,
      startDate: new Date().toISOString().split('T')[0],
      targetPayoffDate: new Date().toISOString().split('T')[0],
    });
    setEditingDebt(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await debtService.delete(deleteTarget.id);
      toast.success('Debt deleted');
      setDeleteTarget(null);
      loadDebts();
    } catch {
      toast.error('Failed to delete debt');
    }
  };

  const calculateProgress = (debt: Debt) => {
    return ((debt.principalAmount - debt.currentBalance) / debt.principalAmount) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Debt & Loan Tracking</h1>
          <p className="text-gray-600 mt-1">Manage and track your debts and loans</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <HiPlus className="mr-2" />
          Add Debt
        </Button>
      </div>

      {loading ? (
        <Card><div className="p-8 text-center">Loading...</div></Card>
      ) : debts.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-gray-500">
            No debts found. Add your first debt to start tracking.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {debts.map((debt) => (
            <Card key={debt.id}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{debt.name}</h3>
                    <p className="text-sm text-gray-500">{debt.debtType.replace('_', ' ')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingDebt(debt);
                        setFormData({
                          name: debt.name,
                          debtType: debt.debtType,
                          principalAmount: debt.principalAmount,
                          currentBalance: debt.currentBalance,
                          interestRate: debt.interestRate,
                          minimumPayment: debt.minimumPayment,
                          startDate: debt.startDate,
                          targetPayoffDate: debt.targetPayoffDate,
                        });
                        setShowForm(true);
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <HiPencil size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(debt)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <HiTrash size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Balance</span>
                      <span className="font-semibold">{formatCurrency(debt.currentBalance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Original</span>
                      <span>{formatCurrency(debt.principalAmount)}</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${calculateProgress(debt)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Interest Rate</p>
                      <p className="font-semibold">{debt.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Min Payment</p>
                      <p className="font-semibold">{formatCurrency(debt.minimumPayment)}</p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-600">Target Payoff</p>
                    <p className="font-semibold">{formatDate(debt.targetPayoffDate)}</p>
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full mt-4"
                    onClick={() => {
                      setSelectedDebt(debt);
                      loadPayments(debt.id);
                    }}
                  >
                    View Payments
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editingDebt ? 'Edit Debt' : 'Add Debt'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Debt Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Chase Credit Card"
            required
          />

          <Select
            label="Debt Type"
            value={formData.debtType}
            onChange={(e) => setFormData({ ...formData, debtType: e.target.value as any })}
            options={[
              { value: 'CREDIT_CARD', label: 'Credit Card' },
              { value: 'PERSONAL_LOAN', label: 'Personal Loan' },
              { value: 'AUTO_LOAN', label: 'Auto Loan' },
              { value: 'MORTGAGE', label: 'Mortgage' },
              { value: 'STUDENT_LOAN', label: 'Student Loan' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />

          <Input
            label="Principal Amount"
            type="number"
            step="0.01"
            value={formData.principalAmount}
            onChange={(e) => setFormData({ ...formData, principalAmount: parseFloat(e.target.value) || 0 })}
            placeholder="Original amount borrowed"
            required
          />

          <Input
            label="Current Balance"
            type="number"
            step="0.01"
            value={formData.currentBalance}
            onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
            placeholder="Current outstanding balance"
            required
          />

          <Input
            label="Interest Rate (%)"
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
            placeholder="Annual interest rate"
            required
          />

          <Input
            label="Minimum Payment"
            type="number"
            step="0.01"
            value={formData.minimumPayment}
            onChange={(e) => setFormData({ ...formData, minimumPayment: parseFloat(e.target.value) || 0 })}
            placeholder="Monthly minimum payment"
            required
          />

          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />

          <Input
            label="Target Payoff Date"
            type="date"
            value={formData.targetPayoffDate}
            onChange={(e) => setFormData({ ...formData, targetPayoffDate: e.target.value })}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setShowForm(false); resetForm(); }} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingDebt ? 'Update Debt' : 'Add Debt'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Debt"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  );
}
