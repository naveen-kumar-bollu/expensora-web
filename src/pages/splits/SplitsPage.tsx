import { useEffect, useState } from 'react';
import { HiPlus, HiTrash, HiClock } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Card, Modal, ConfirmDialog } from '../../components';
import { transactionSplitService, type TransactionSplit } from '../../api/transactionSplitService';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function SplitsPage() {
  const [splits, setSplits] = useState<TransactionSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<TransactionSplit | null>(null);

  useEffect(() => {
    loadSplits();
  }, []);

  const loadSplits = async () => {
    setLoading(true);
    try {
      const res = await transactionSplitService.getMySplits();
      setSplits(res.data);
    } catch {
      toast.error('Failed to load splits');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await transactionSplitService.delete(deleteTarget.id);
      toast.success('Split deleted');
      setDeleteTarget(null);
      loadSplits();
    } catch {
      toast.error('Failed to delete split');
    }
  };

  const groupedSplits = splits.reduce((acc, split) => {
    const key = split.expenseId || split.incomeId || 'unknown';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(split);
    return acc;
  }, {} as Record<string, TransactionSplit[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Split Transactions</h1>
          <p className="text-gray-600 mt-1">View and manage transaction splits</p>
        </div>
      </div>

      {loading ? (
        <Card><div className="p-8 text-center">Loading...</div></Card>
      ) : splits.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-gray-500">
            <p>No split transactions found.</p>
            <p className="text-sm mt-2">Split transactions are created when you add expenses or income across multiple categories.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSplits).map(([transactionId, transactionSplits]) => {
            const totalAmount = transactionSplits.reduce((sum, s) => sum + s.amount, 0);
            const type = transactionSplits[0].expenseId ? 'Expense' : 'Income';
            
            return (
              <Card key={transactionId}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {type} Split - {formatCurrency(totalAmount)}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          type === 'Expense' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <HiClock size={14} />
                        {formatDate(transactionSplits[0].createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {transactionSplits.map((split) => (
                      <div key={split.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{split.categoryName}</p>
                              {split.description && (
                                <p className="text-sm text-gray-500">{split.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{formatCurrency(split.amount)}</p>
                              {split.percentage && (
                                <p className="text-sm text-gray-500">{split.percentage.toFixed(1)}%</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteTarget(split)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <HiTrash size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total Split</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Split"
        message="Are you sure you want to delete this split? This action cannot be undone."
      />
    </div>
  );
}
