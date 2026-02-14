import { useEffect, useState } from 'react';
import { HiDownload } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Card, Select } from '../../components';
import { taxService, type TaxReport } from '../../api/taxService';
import { formatCurrency } from '../../utils/helpers';

export default function TaxPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState<number | null>(null);
  const [report, setReport] = useState<TaxReport[]>([]);
  const [loading, setLoading] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const quarters = [1, 2, 3, 4];

  useEffect(() => {
    loadReport();
  }, [year, quarter]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = quarter
        ? await taxService.getQuarterlyReport(year, quarter)
        : await taxService.getAnnualReport(year);
      setReport(res.data);
    } catch {
      toast.error('Failed to load tax report');
    }
    setLoading(false);
  };

  const totalDeductions = report.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tax Planning & Reporting</h1>
        <p className="text-gray-600 mt-1">Track tax-deductible expenses and generate reports</p>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Year"
              value={String(year)}
              onChange={(e) => setYear(Number(e.target.value))}
              options={years.map((y) => ({ value: String(y), label: String(y) }))}
            />
            <Select
              label="Quarter (Optional)"
              value={quarter ? String(quarter) : ''}
              onChange={(e) => setQuarter(e.target.value ? Number(e.target.value) : null)}
              options={[
                { value: '', label: 'Annual' },
                ...quarters.map((q) => ({ value: String(q), label: `Q${q}` })),
              ]}
            />
            <div className="flex items-end">
              <Button variant="secondary" className="w-full">
                <HiDownload className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {quarter ? `Q${quarter} ${year}` : year} Tax Summary
          </h3>
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Tax Deductible Expenses</p>
            <p className="text-3xl font-bold text-indigo-600">{formatCurrency(totalDeductions)}</p>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : report.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tax-deductible expenses found for this period
            </div>
          ) : (
            <div className="space-y-4">
              {report.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{item.taxCategory}</p>
                    <p className="text-sm text-gray-500">{item.transactionCount} transactions</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(item.totalAmount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tax Categories Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">Business Expenses</p>
              <p className="text-gray-600">Office supplies, equipment, travel, meals</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">Medical Expenses</p>
              <p className="text-gray-600">Healthcare, prescriptions, insurance premiums</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">Charitable Donations</p>
              <p className="text-gray-600">Cash and non-cash donations to qualified organizations</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">Home Office</p>
              <p className="text-gray-600">Utilities, rent, mortgage interest (proportional)</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
