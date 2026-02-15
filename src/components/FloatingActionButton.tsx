import { useState, useEffect } from 'react';
import { HiPlus, HiX, HiCreditCard, HiCash } from 'react-icons/hi';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from './Modal';
import ExpenseForm from '../pages/expenses/ExpenseForm';
import IncomeForm from '../pages/income/IncomeForm';
import { categoryService } from '../api/categoryService';
import type { Category } from '../types';

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on auth pages
  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const [expenseRes, incomeRes] = await Promise.all([
        categoryService.getAll('EXPENSE'),
        categoryService.getAll('INCOME')
      ]);
      setExpenseCategories(expenseRes.data);
      setIncomeCategories(incomeRes.data);
    } catch {
      // Silently fail
    }
  };

  if (isAuthPage) return null;

  const handleExpenseClick = () => {
    setIsOpen(false);
    setShowExpenseForm(true);
  };

  const handleIncomeClick = () => {
    setIsOpen(false);
    setShowIncomeForm(true);
  };

  const handleExpenseSuccess = () => {
    setShowExpenseForm(false);
  };

  const handleIncomeSuccess = () => {
    setShowIncomeForm(false);
  };

  return (
    <>
      {/* Quick Actions Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Action Buttons */}
          <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3">
            <button
              onClick={handleExpenseClick}
              className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-lg transform transition-all hover:scale-105"
            >
              <HiCreditCard className="w-5 h-5" />
              <span className="font-medium">Add Expense</span>
            </button>
            <button
              onClick={handleIncomeClick}
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full shadow-lg transform transition-all hover:scale-105"
            >
              <HiCash className="w-5 h-5" />
              <span className="font-medium">Add Income</span>
            </button>
          </div>
        </>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 ${
          isOpen 
            ? 'bg-gray-600 hover:bg-gray-700 rotate-45' 
            : 'bg-gradient-to-br from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600'
        }`}
      >
        {isOpen ? (
          <HiX className="w-6 h-6 text-white" />
        ) : (
          <HiPlus className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Expense Form Modal */}
      <Modal
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        title="Quick Add Expense"
      >
        <ExpenseForm 
          expense={null}
          categories={expenseCategories}
          onSuccess={handleExpenseSuccess}
          onCancel={() => setShowExpenseForm(false)}
        />
      </Modal>

      {/* Income Form Modal */}
      <Modal
        isOpen={showIncomeForm}
        onClose={() => setShowIncomeForm(false)}
        title="Quick Add Income"
      >
        <IncomeForm 
          income={null}
          categories={incomeCategories}
          onSuccess={handleIncomeSuccess}
          onCancel={() => setShowIncomeForm(false)}
        />
      </Modal>
    </>
  );
}
