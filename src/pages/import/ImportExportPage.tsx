import { useEffect, useState } from 'react';
import { HiDownload, HiUpload } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Card } from '../../components';
import { importExportService, type ImportHistory } from '../../api/importExportService';
import { formatDate } from '../../utils/helpers';

export default function ImportExportPage() {
  const [history, setHistory] = useState<ImportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await importExportService.getHistory();
      setHistory(res.data);
    } catch {
      toast.error('Failed to load history');
    }
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await importExportService.importTransactions(file, 'CUSTOM_CSV', {});
      toast.success('Import started successfully');
      loadHistory();
    } catch {
      toast.error('Failed to import file');
    }
    setImporting(false);
  };

  const handleExportExpenses = async () => {
    try {
      const res = await importExportService.exportExpenses('2024-01-01', '2024-12-31');
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expenses.csv';
      a.click();
      toast.success('Export completed');
    } catch {
      toast.error('Failed to export');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import & Export</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Import transactions from CSV or export your data
        </p>
      </div>

      {/* Import/Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Import Data</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Import transactions from CSV files (Bank, Mint, YNAB formats supported)
          </p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={importing}
            />
            <Button icon={HiUpload} disabled={importing} className="w-full">
              {importing ? 'Importing...' : 'Choose File'}
            </Button>
          </label>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Export Data</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Export your expenses, income, or complete backup
          </p>
          <div className="space-y-2">
            <Button
              icon={HiDownload}
              variant="secondary"
              className="w-full"
              onClick={handleExportExpenses}
            >
              Export Expenses
            </Button>
          </div>
        </Card>
      </div>

      {/* Import History */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Import History</h3>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div>
                  <p className="font-medium">{item.fileName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(item.createdAt)} • {item.format}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    item.status === 'COMPLETED' ? 'text-green-600' :
                    item.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {item.status}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.successfulRecords}/{item.totalRecords} records
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
