import { useState } from 'react';
import { HiUpload, HiDownload, HiDocumentText } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Card, Select } from '../../components';
import { importExportService } from '../../api/importExportService';

export default function ImportExportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<string>('BANK_CSV');
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setImporting(true);
    try {
      const columnMapping = {
        description: 'Description',
        amount: 'Amount',
        date: 'Date',
      };
      await importExportService.importTransactions(selectedFile, format, columnMapping);
      toast.success('Import successful');
      setSelectedFile(null);
    } catch {
      toast.error('Import failed');
    }
    setImporting(false);
  };

  const handleExportExpenses = async () => {
    try {
      const startDate = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      const response = await importExportService.exportExpenses(startDate, endDate);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenses.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export successful');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleExportBackup = async () => {
    try {
      const response = await importExportService.exportFullBackup();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expensora-backup.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Backup created');
    } catch {
      toast.error('Backup failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Import/Export</h1>
        <p className="text-gray-600 mt-1">Import transactions from various sources or export your data</p>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Import Transactions</h3>
          <div className="space-y-4">
            <Select
              label="Import Format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              options={[
                { value: 'BANK_CSV', label: 'Bank CSV' },
                { value: 'MINT_CSV', label: 'Mint CSV' },
                { value: 'YNAB4', label: 'YNAB4' },
                { value: 'CUSTOM_CSV', label: 'Custom CSV' },
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>
              )}
            </div>

            <Button onClick={handleImport} disabled={!selectedFile || importing}>
              <HiUpload className="mr-2" />
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Export Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="secondary" onClick={handleExportExpenses}>
              <HiDownload className="mr-2" />
              Export Expenses
            </Button>
            <Button variant="secondary">
              <HiDownload className="mr-2" />
              Export Income
            </Button>
            <Button variant="secondary" onClick={handleExportBackup}>
              <HiDocumentText className="mr-2" />
              Full Backup
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Import History</h3>
          <div className="text-center py-8 text-gray-500">
            Import history will be displayed here
          </div>
        </div>
      </Card>
    </div>
  );
}
