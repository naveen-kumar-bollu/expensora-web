import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button, Input, Select } from '../../components';
import { incomeService } from '../../api/incomeService';
import type { Income, Category } from '../../types';
import { getTodayISO } from '../../utils/helpers';

const incomeSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  incomeDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  income: Income | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function IncomeForm({ income, categories, onSuccess, onCancel }: IncomeFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: income?.amount || undefined,
      description: income?.description || '',
      categoryId: income?.categoryId || '',
      incomeDate: income?.incomeDate || getTodayISO(),
      notes: income?.notes || '',
      tags: income?.tags || '',
    },
  });

  const onSubmit = async (data: IncomeFormData) => {
    setLoading(true);
    try {
      if (income) {
        await incomeService.update(income.id, data);
        toast.success('Income updated');
      } else {
        await incomeService.create(data);
        toast.success('Income added');
      }
      onSuccess();
    } catch {
      toast.error('Failed to save income');
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
        placeholder="What was this income for?"
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
        error={errors.incomeDate?.message}
        {...register('incomeDate')}
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
          {income ? 'Update' : 'Add'} Income
        </Button>
      </div>
    </form>
  );
}
