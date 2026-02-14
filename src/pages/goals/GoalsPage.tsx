import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiTrendingUp } from 'react-icons/hi';
import { goalService } from '../../api/goalService';
import { goalContributionService } from '../../api/goalContributionService';
import type { Goal, GoalCreateRequest, GoalContributionCreateRequest, GoalType } from '../../types';
import { Button, Card, Modal } from '../../components';
import toast from 'react-hot-toast';

const goalTypeLabels: Record<GoalType, string> = {
  SAVINGS: 'Savings Goal',
  DEBT_PAYOFF: 'Debt Payoff',
  INVESTMENT: 'Investment Goal',
  PURCHASE: 'Purchase Goal',
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [goalFormData, setGoalFormData] = useState<GoalCreateRequest>({
    name: '',
    goalType: 'SAVINGS',
    targetAmount: 0,
    targetDate: new Date().toISOString().split('T')[0],
    priority: 3,
    color: '#10B981',
  });

  const [contributionFormData, setContributionFormData] = useState<GoalContributionCreateRequest>({
    goalId: '',
    amount: 0,
    contributionDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await goalService.getAll();
      setGoals(response.data);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await goalService.update(editingGoal.id, goalFormData);
        toast.success('Goal updated successfully');
      } else {
        await goalService.create(goalFormData);
        toast.success('Goal created successfully');
      }
      fetchGoals();
      handleCloseGoalModal();
    } catch (error) {
      toast.error('Failed to save goal');
    }
  };

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await goalContributionService.create(contributionFormData);
      toast.success('Contribution added successfully');
      fetchGoals();
      handleCloseContributionModal();
    } catch (error) {
      toast.error('Failed to add contribution');
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalFormData({
      name: goal.name,
      description: goal.description,
      goalType: goal.goalType,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate,
      icon: goal.icon,
      color: goal.color,
      priority: goal.priority,
    });
    setShowGoalModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await goalService.delete(id);
      toast.success('Goal deleted successfully');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleAddContribution = (goal: Goal) => {
    setSelectedGoal(goal);
    setContributionFormData({
      goalId: goal.id,
      amount: 0,
      contributionDate: new Date().toISOString().split('T')[0],
    });
    setShowContributionModal(true);
  };

  const handleCloseGoalModal = () => {
    setShowGoalModal(false);
    setEditingGoal(null);
    setGoalFormData({
      name: '',
      goalType: 'SAVINGS',
      targetAmount: 0,
      targetDate: new Date().toISOString().split('T')[0],
      priority: 3,
      color: '#10B981',
    });
  };

  const handleCloseContributionModal = () => {
    setShowContributionModal(false);
    setSelectedGoal(null);
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Financial Goals</h1>
          <p className="text-dark-400 mt-1">Track your savings and financial targets</p>
        </div>
        <Button onClick={() => setShowGoalModal(true)}>
          <HiPlus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-dark-400">Active Goals</h3>
          <p className="text-3xl font-bold text-dark-50 mt-2">{activeGoals.length}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-dark-400">Total Target</h3>
          <p className="text-3xl font-bold text-dark-50 mt-2">
            ${activeGoals.reduce((sum, g) => sum + g.targetAmount, 0).toFixed(0)}
          </p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-dark-400">Total Saved</h3>
          <p className="text-3xl font-bold text-dark-50 mt-2">
            ${activeGoals.reduce((sum, g) => sum + g.currentAmount, 0).toFixed(0)}
          </p>
        </Card>
      </div>

      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-dark-50 mb-4">Active Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => (
              <Card key={goal.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-dark-50">{goal.name}</h3>
                    <p className="text-sm text-dark-400">{goalTypeLabels[goal.goalType]}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg ${
                    goal.priority <= 2 ? 'bg-red-500/20 text-red-400' :
                    goal.priority === 3 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    Priority {goal.priority}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">Progress</span>
                    <span className="text-dark-300">{goal.progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(goal.progressPercentage, 100)}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <p className="text-dark-500">Current</p>
                    <p className="text-dark-200 font-medium">${goal.currentAmount.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-dark-500">Target</p>
                    <p className="text-dark-200 font-medium">${goal.targetAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => handleAddContribution(goal)}>
                    <HiTrendingUp className="w-4 h-4 mr-2" />
                    Add Funds
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(goal)}>
                    <HiPencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(goal.id)}>
                    <HiTrash className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-dark-50 mb-4">Completed Goals 🎉</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="opacity-75">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-dark-50">{goal.name}</h3>
                    <p className="text-sm text-green-400">✓ Completed</p>
                  </div>
                  <p className="text-lg font-bold text-dark-200">${goal.targetAmount.toFixed(2)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {!loading && goals.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-dark-400">No goals yet. Create your first goal to get started.</p>
        </Card>
      )}

      {/* Goal Modal */}
      <Modal isOpen={showGoalModal} onClose={handleCloseGoalModal} title={editingGoal ? 'Edit Goal' : 'Add New Goal'}>
        <form onSubmit={handleGoalSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Goal Name</label>
            <input
              type="text"
              value={goalFormData.name}
              onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Goal Type</label>
            <select
              value={goalFormData.goalType}
              onChange={(e) => setGoalFormData({ ...goalFormData, goalType: e.target.value as GoalType })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
            >
              {Object.entries(goalTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Target Amount</label>
            <input
              type="number"
              step="0.01"
              value={goalFormData.targetAmount}
              onChange={(e) => setGoalFormData({ ...goalFormData, targetAmount: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Target Date</label>
            <input
              type="date"
              value={goalFormData.targetDate}
              onChange={(e) => setGoalFormData({ ...goalFormData, targetDate: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Priority (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={goalFormData.priority}
              onChange={(e) => setGoalFormData({ ...goalFormData, priority: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseGoalModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingGoal ? 'Update' : 'Create'} Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Contribution Modal */}
      <Modal isOpen={showContributionModal} onClose={handleCloseContributionModal} title="Add Contribution">
        <form onSubmit={handleContributionSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-dark-400 mb-4">
              Adding contribution to: <span className="font-semibold text-dark-200">{selectedGoal?.name}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={contributionFormData.amount}
              onChange={(e) => setContributionFormData({ ...contributionFormData, amount: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Contribution Date</label>
            <input
              type="date"
              value={contributionFormData.contributionDate}
              onChange={(e) => setContributionFormData({ ...contributionFormData, contributionDate: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Notes (optional)</label>
            <textarea
              value={contributionFormData.notes || ''}
              onChange={(e) => setContributionFormData({ ...contributionFormData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseContributionModal}>
              Cancel
            </Button>
            <Button type="submit">
              Add Contribution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
