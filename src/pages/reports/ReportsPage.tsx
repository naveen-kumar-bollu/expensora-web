import { useState } from 'react';
import { HiDownload, HiDocumentText } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Card, Select } from '../../components';
import { reportService } from '../../api/dashboardService';
import { getCurrentMonth, getCurrentYear, getMonthName, downloadBlob } from '../../utils/helpers';

export default function ReportsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const [loadingExpCsv, setLoadingExpCsv] = useState(false);
  const [loadingIncCsv, setLoadingIncCsv] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: getMonthName(i + 1),
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(getCurrentYear() - 2 + i),
    label: String(getCurrentYear() - 2 + i),
  }));

  const handleExportExpenses = async () => {
    setLoadingExpCsv(true);
    try {
      const res = await reportService.exportExpensesCsv(month, year);
      downloadBlob(res.data, `expenses_${year}_${month}.csv`);
      toast.success('Expenses CSV downloaded');
    } catch {
      toast.error('Failed to export expenses');
    }
    setLoadingExpCsv(false);
  };

  const handleExportIncome = async () => {
    setLoadingIncCsv(true);
    try {
      const res = await reportService.exportIncomeCsv(month, year);
      downloadBlob(res.data, `income_${year}_${month}.csv`);
      toast.success('Income CSV downloaded');
    } catch {
      toast.error('Failed to export income');
    }
    setLoadingIncCsv(false);
  };

  const handleMonthlySummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await reportService.getMonthlySummary(month, year);
      downloadBlob(res.data, `summary_${year}_${month}.txt`);
      toast.success('Monthly summary downloaded');
    } catch {
      toast.error('Failed to generate summary');
    }
    setLoadingSummary(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-dark-100">Reports</h1>

      {/* Period Selector */}
      <Card className="!p-4">
        <div className="flex gap-4">
          <Select
            options={monthOptions}
            value={String(month)}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
          <Select
            options={yearOptions}
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover>
          <div className="text-center">
            <div className="inline-flex p-4 rounded-2xl bg-red-500/10 mb-4">
              <HiDownload className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark-100 mb-2">Expenses CSV</h3>
            <p className="text-sm text-dark-400 mb-4">
              Export all expenses for {getMonthName(month)} {year}
            </p>
            <Button
              onClick={handleExportExpenses}
              loading={loadingExpCsv}
              className="w-full"
            >
              <HiDownload className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </Card>

        <Card hover>
          <div className="text-center">
            <div className="inline-flex p-4 rounded-2xl bg-green-500/10 mb-4">
              <HiDownload className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark-100 mb-2">Income CSV</h3>
            <p className="text-sm text-dark-400 mb-4">
              Export all income for {getMonthName(month)} {year}
            </p>
            <Button
              onClick={handleExportIncome}
              loading={loadingIncCsv}
              className="w-full"
            >
              <HiDownload className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </Card>

        <Card hover>
          <div className="text-center">
            <div className="inline-flex p-4 rounded-2xl bg-primary-500/10 mb-4">
              <HiDocumentText className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark-100 mb-2">Monthly Summary</h3>
            <p className="text-sm text-dark-400 mb-4">
              Full summary report for {getMonthName(month)} {year}
            </p>
            <Button
              onClick={handleMonthlySummary}
              loading={loadingSummary}
              className="w-full"
            >
              <HiDownload className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
