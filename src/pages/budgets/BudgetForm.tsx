import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button, Input, Select } from '../../components';
import { budgetService } from '../../api/budgetService';
import type { Budget, Category } from '../../types';
import { getMonthName, getCurrentYear } from '../../utils/helpers';

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  budget: Budget | null;
  categories: Category[];
  currentMonth: number;
  currentYear: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BudgetForm({
  budget, categories, currentMonth, currentYear, onSuccess, onCancel,
}: BudgetFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: budget?.categoryId || '',
      amount: budget?.amount || undefined,
      month: budget?.month || currentMonth,
      year: budget?.year || currentYear,
    },
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: getMonthName(i + 1),
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(getCurrentYear() - 2 + i),
    label: String(getCurrentYear() - 2 + i),
  }));

  const onSubmit = async (data: BudgetFormData) => {
    setLoading(true);
    try {
      if (budget) {
        await budgetService.update(budget.id, data);
        toast.success('Budget updated');
      } else {
        await budgetService.create(data);
        toast.success('Budget created');
      }
      onSuccess();
    } catch {
      toast.error('Failed to save budget');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Category"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        placeholder="Select category"
        error={errors.categoryId?.message}
        {...register('categoryId')}
      />

      <Input
        label="Budget Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        error={errors.amount?.message}
        {...register('amount')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Month"
          options={monthOptions}
          error={errors.month?.message}
          {...register('month')}
        />
        <Select
          label="Year"
          options={yearOptions}
          error={errors.year?.message}
          {...register('year')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {budget ? 'Update' : 'Create'} Budget
        </Button>
      </div>
    </form>
  );
}
