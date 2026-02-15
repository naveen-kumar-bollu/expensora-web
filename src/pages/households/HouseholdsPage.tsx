import { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiUserAdd } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Card, Modal, ConfirmDialog, Input } from '../../components';
import { householdService, type Household, type HouseholdCreateRequest, type AddMemberRequest } from '../../api/householdService';
import { formatDate } from '../../utils/helpers';

export default function HouseholdsPage() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [editingHousehold, setEditingHousehold] = useState<Household | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Household | null>(null);
  const [formData, setFormData] = useState<HouseholdCreateRequest>({ name: '', description: '' });
  const [memberData, setMemberData] = useState<AddMemberRequest>({ email: '', role: 'VIEWER' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadHouseholds();
  }, []);

  const loadHouseholds = async () => {
    setLoading(true);
    try {
      const res = await householdService.getAll();
      setHouseholds(res.data);
    } catch {
      toast.error('Failed to load households');
    }
    setLoading(false);
  };

  const handleOpenForm = (household?: Household) => {
    if (household) {
      setEditingHousehold(household);
      setFormData({ name: household.name, description: household.description || '' });
    } else {
      setEditingHousehold(null);
      setFormData({ name: '', description: '' });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHousehold(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Household name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingHousehold) {
        await householdService.update(editingHousehold.id, formData);
        toast.success('Household updated');
      } else {
        await householdService.create(formData);
        toast.success('Household created');
      }
      handleCloseForm();
      loadHouseholds();
    } catch {
      toast.error(`Failed to ${editingHousehold ? 'update' : 'create'} household`);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await householdService.delete(deleteTarget.id);
      toast.success('Household deleted');
      setDeleteTarget(null);
      loadHouseholds();
    } catch {
      toast.error('Failed to delete household');
    }
  };

  const handleOpenMemberForm = (household: Household) => {
    setSelectedHousehold(household);
    setMemberData({ email: '', role: 'VIEWER' });
    setShowMemberForm(true);
  };

  const handleCloseMemberForm = () => {
    setShowMemberForm(false);
    setSelectedHousehold(null);
    setMemberData({ email: '', role: 'VIEWER' });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHousehold || !memberData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setSubmitting(true);
    try {
      await householdService.addMember(selectedHousehold.id, memberData);
      toast.success('Member added successfully');
      handleCloseMemberForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add member');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shared Finances</h1>
          <p className="text-gray-600 mt-1">Manage family accounts and shared expenses</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <HiPlus className="mr-2" />
          Create Household
        </Button>
      </div>

      {loading ? (
        <Card><div className="p-8 text-center">Loading...</div></Card>
      ) : households.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-gray-500">
            No households found. Create your first household to collaborate with family.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {households.map((household) => (
            <Card key={household.id}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{household.name}</h3>
                    <p className="text-sm text-gray-400">Owner: {household.ownerName}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenForm(household)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <HiPencil size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(household)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <HiTrash size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {household.description && (
                    <p className="text-sm text-gray-300">{household.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Created {formatDate(household.createdAt)}</span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" className="flex-1" onClick={() => handleOpenMemberForm(household)}>
                      <HiUserAdd className="mr-2" />
                      Add Member
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingHousehold ? 'Edit Household' : 'Create Household'}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Household Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter household name"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter household description"
              rows={3}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseForm} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Saving...' : editingHousehold ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showMemberForm}
        onClose={handleCloseMemberForm}
        title="Add Member"
      >
        <form onSubmit={handleAddMember} className="p-6 space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={memberData.email}
            onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
            placeholder="Enter member's email"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={memberData.role}
              onChange={(e) => setMemberData({ ...memberData, role: e.target.value as 'ADMIN' | 'EDITOR' | 'VIEWER' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="VIEWER">Viewer - Read-only access</option>
              <option value="EDITOR">Editor - Can add/edit transactions</option>
              <option value="ADMIN">Admin - Full access</option>
            </select>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              The member must have a registered account with this email address.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseMemberForm} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Household"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  );
}
