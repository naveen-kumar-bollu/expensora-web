import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button, Input, Select } from '../../components';
import { expenseService } from '../../api/expenseService';
import type { Expense, Category } from '../../types';
import { getTodayISO } from '../../utils/helpers';

const expenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  expenseDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense: Expense | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ExpenseForm({ expense, categories, onSuccess, onCancel }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense?.amount || undefined,
      description: expense?.description || '',
      categoryId: expense?.categoryId || '',
      expenseDate: expense?.expenseDate || getTodayISO(),
      notes: expense?.notes || '',
      tags: expense?.tags || '',
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    try {
      if (expense) {
        await expenseService.update(expense.id, data);
        toast.success('Expense updated');
      } else {
        await expenseService.create(data);
        toast.success('Expense added');
      }
      onSuccess();
    } catch {
      toast.error('Failed to save expense');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        error={errors.amount?.message}
        {...register('amount')}
      />

      <Input
        label="Description"
        placeholder="What was this expense for?"
        error={errors.description?.message}
        {...register('description')}
      />

      <Select
        label="Category"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        placeholder="Select category"
        error={errors.categoryId?.message}
        {...register('categoryId')}
      />

      <Input
        label="Date"
        type="date"
        error={errors.expenseDate?.message}
        {...register('expenseDate')}
      />

      <Input
        label="Notes"
        placeholder="Any additional notes..."
        {...register('notes')}
      />

      <Input
        label="Tags"
        placeholder="tag1, tag2, tag3"
        {...register('tags')}
      />

      <div className="flex justify-end gap-3 pt-2 md:col-span-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {expense ? 'Update' : 'Add'} Expense
        </Button>
      </div>
    </form>
  );
}
