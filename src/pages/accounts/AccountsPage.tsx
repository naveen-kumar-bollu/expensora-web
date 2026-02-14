import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiCreditCard, HiCash, HiLibrary } from 'react-icons/hi';
import { accountService } from '../../api/accountService';
import type { Account, AccountCreateRequest, AccountType } from '../../types';
import { Button, Card, Modal } from '../../components';
import toast from 'react-hot-toast';

const accountTypeLabels: Record<AccountType, string> = {
  BANK_CHECKING: 'Checking Account',
  BANK_SAVINGS: 'Savings Account',
  CREDIT_CARD: 'Credit Card',
  CASH: 'Cash',
  DIGITAL_WALLET: 'Digital Wallet',
  INVESTMENT: 'Investment',
};

const accountIcons: Record<AccountType, React.ComponentType<{ className?: string }>> = {
  BANK_CHECKING: HiLibrary,
  BANK_SAVINGS: HiLibrary,
  CREDIT_CARD: HiCreditCard,
  CASH: HiCash,
  DIGITAL_WALLET: HiLibrary,
  INVESTMENT: HiLibrary,
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [formData, setFormData] = useState<AccountCreateRequest>({
    name: '',
    accountType: 'BANK_CHECKING',
    initialBalance: 0,
    currency: 'USD',
    color: '#3B82F6',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountService.getAll();
      setAccounts(response.data);
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await accountService.update(editingAccount.id, formData);
        toast.success('Account updated successfully');
      } else {
        await accountService.create(formData);
        toast.success('Account created successfully');
      }
      fetchAccounts();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save account');
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      accountType: account.accountType,
      initialBalance: account.initialBalance,
      currency: account.currency,
      color: account.color,
      isDefault: account.isDefault,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await accountService.delete(id);
      toast.success('Account deleted successfully');
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(null);
    setFormData({
      name: '',
      accountType: 'BANK_CHECKING',
      initialBalance: 0,
      currency: 'USD',
      color: '#3B82F6',
    });
  };

  const totalBalance = accounts
    .filter(a => a.active)
    .reduce((sum, account) => sum + account.currentBalance, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Accounts & Wallets</h1>
          <p className="text-dark-400 mt-1">Manage your accounts and track balances</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <HiPlus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-primary-600 to-purple-600 text-white">
        <h3 className="text-sm font-medium opacity-90">Total Balance</h3>
        <p className="text-3xl font-bold mt-2">${totalBalance.toFixed(2)}</p>
        <p className="text-sm opacity-75 mt-1">{accounts.filter(a => a.active).length} Active Accounts</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : accounts.length === 0 ? (
          <Card className="col-span-full text-center py-12">
            <p className="text-dark-400">No accounts yet. Create your first account to get started.</p>
          </Card>
        ) : (
          accounts.map((account) => {
            const Icon = accountIcons[account.accountType];
            return (
              <Card key={account.id} className={!account.active ? 'opacity-50' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: account.color + '20' }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-50">{account.name}</h3>
                      <p className="text-sm text-dark-400">{accountTypeLabels[account.accountType]}</p>
                    </div>
                  </div>
                  {account.isDefault && (
                    <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-lg">
                      Default
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-dark-50">${account.currentBalance.toFixed(2)}</p>
                  <p className="text-xs text-dark-500 mt-1">{account.currency}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(account)}>
                    <HiPencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(account.id)}>
                    <HiTrash className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingAccount ? 'Edit Account' : 'Add New Account'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Account Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Account Type</label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value as AccountType })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
            >
              {Object.entries(accountTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {!editingAccount && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Initial Balance</label>
              <input
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Currency</label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Color</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 bg-dark-700 border border-dark-600 rounded-lg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isDefault || false}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm text-dark-300">Set as default account</label>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAccount ? 'Update' : 'Create'} Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
