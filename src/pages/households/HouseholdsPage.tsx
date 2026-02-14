import { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiUserAdd } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Card, Modal, ConfirmDialog } from '../../components';
import { householdService, type Household, type HouseholdCreateRequest } from '../../api/householdService';
import { formatDate } from '../../utils/helpers';

export default function HouseholdsPage() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState<Household | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Household | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shared Finances</h1>
          <p className="text-gray-600 mt-1">Manage family accounts and shared expenses</p>
        </div>
        <Button onClick={() => { setEditingHousehold(null); setShowForm(true); }}>
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
                    <h3 className="text-xl font-bold text-gray-900">{household.name}</h3>
                    <p className="text-sm text-gray-500">Owner: {household.ownerName}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingHousehold(household); setShowForm(true); }}
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
                    <p className="text-sm text-gray-600">{household.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Created {formatDate(household.createdAt)}</span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" className="flex-1">
                      <HiUserAdd className="mr-2" />
                      Add Member
                    </Button>
                    <Button variant="secondary" className="flex-1">
                      View Details
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
        onClose={() => setShowForm(false)}
        title={editingHousehold ? 'Edit Household' : 'Create Household'}
      >
        <div className="p-4">
          <p className="text-gray-500">Household form will be implemented here</p>
        </div>
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
