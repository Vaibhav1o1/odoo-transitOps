import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, Search, Calendar, Landmark, Wrench, Fuel } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { expenseService, vehicleService } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Table } from '../components/Table';
import { Button, Input, Select, Badge, Pagination, Card } from '../components/CommonUI';
import { Modal } from '../components/Modal';

// Mock charts data
const expenseTrendData = [
  { name: 'May', total: 564400 },
  { name: 'Jun', total: 680600 },
  { name: 'Jul', total: 651550 },
];

export default function Expenses() {
  const { addNotification } = useNotifications();

  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter/Pagination
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '',
    expenseType: 'Fuel',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const expRes = await expenseService.getAll();
      setExpenses(expRes);

      const vRes = await vehicleService.getAll();
      setVehicles(vRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      vehicleId: '',
      expenseType: 'Fuel',
      cost: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await expenseService.create({
        ...form,
        cost: Number(form.cost) / 83 // convert user input INR to database USD
      });
      addNotification('Expense Logged', `Logged ${form.expenseType} expense of ₹${Number(form.cost).toLocaleString('en-IN')}.`, 'success');
      setIsAddOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for charts
  const monthlyFuelCost = [
    { month: 'May', Fuel: (expenses.filter(e => e.expenseType === 'Fuel' && e.date.includes('05')).reduce((a,c)=>a+c.cost, 0) || 1200) * 83 },
    { month: 'Jun', Fuel: (expenses.filter(e => e.expenseType === 'Fuel' && e.date.includes('06')).reduce((a,c)=>a+c.cost, 0) || 1800) * 83 },
    { month: 'Jul', Fuel: (expenses.filter(e => e.expenseType === 'Fuel' && e.date.includes('07')).reduce((a,c)=>a+c.cost, 0) || 1455) * 83 },
  ];

  const distribution = [
    { name: 'Fuel', value: (expenses.filter(e => e.expenseType === 'Fuel').reduce((a,c)=>a+c.cost, 0) || 1) * 83 },
    { name: 'Maintenance', value: (expenses.filter(e => e.expenseType === 'Maintenance').reduce((a,c)=>a+c.cost, 0) || 1) * 83 },
    { name: 'Toll', value: (expenses.filter(e => e.expenseType === 'Toll').reduce((a,c)=>a+c.cost, 0) || 1) * 83 },
    { name: 'Other', value: (expenses.filter(e => e.expenseType === 'Other').reduce((a,c)=>a+c.cost, 0) || 1) * 83 },
  ];

  const PIE_COLORS = ['#2563EB', '#EF4444', '#14B8A6', '#F59E0B'];

  const filteredExpenses = expenses.filter((e) => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) || e.vehicleId.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType ? e.expenseType === filterType : true;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const currentData = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const icons = {
    Fuel: <Fuel className="w-4 h-4 text-blue-500" />,
    Maintenance: <Wrench className="w-4 h-4 text-rose-500" />,
    Toll: <Landmark className="w-4 h-4 text-teal-500" />,
    Other: <IndianRupee className="w-4 h-4 text-amber-500" />,
  };

  const columns = [
    {
      header: 'Vehicle registration',
      key: 'vehicleId',
      render: (row) => {
        const v = vehicles.find(item => item.id === row.vehicleId);
        return <span className="font-bold font-mono">{v ? v.registrationNumber : row.vehicleId}</span>;
      }
    },
    {
      header: 'Expense Type',
      key: 'expenseType',
      render: (row) => (
        <div className="flex items-center space-x-2 text-xs font-semibold">
          {icons[row.expenseType]}
          <span>{row.expenseType}</span>
        </div>
      ),
    },
    {
      header: 'Cost',
      key: 'cost',
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-slate-50">
          ₹{(row.cost * 83).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    { header: 'Date Logged', key: 'date' },
    { header: 'Memo / Description', key: 'description' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Fuel & Expenses Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Audit monthly operational costs, fuel dispatches, road tolls, and mechanic shop labor invoices.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Log Expense
        </Button>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Fuel Cost */}
        <Card className="p-4 text-xs">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-left">Fuel Spend Trends (₹)</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFuelCost} margin={{ left: -20 }}>
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" tickFormatter={(val) => '₹' + (val / 1000) + 'k'} />
                <Tooltip formatter={(value) => ['₹' + value.toLocaleString('en-IN'), 'Fuel Cost']} />
                <Bar dataKey="Fuel" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense Distribution */}
        <Card className="p-4 text-xs">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-left">Expense Breakdown</h4>
          <div className="h-48 flex items-center justify-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} innerRadius={35} outerRadius={50} paddingAngle={3} dataKey="value">
                    {distribution.map((entry, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => ['₹' + value.toLocaleString('en-IN'), 'Cost']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 text-left space-y-1.5 pl-2">
              {distribution.map((entry, idx) => (
                <div key={idx} className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-350">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Total Expense Trend */}
        <Card className="p-4 text-xs">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-left">Total Operating Trend (₹)</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expenseTrendData} margin={{ left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" tickFormatter={(val) => '₹' + (val / 1000) + 'k'} />
                <Tooltip formatter={(value) => ['₹' + value.toLocaleString('en-IN'), 'Cost']} />
                <Line type="monotone" dataKey="total" stroke="#14B8A6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search description or Vehicle ID..."
            className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            options={[
              { label: 'All Categories', value: '' },
              { label: 'Fuel', value: 'Fuel' },
              { label: 'Maintenance', value: 'Maintenance' },
              { label: 'Tolls', value: 'Toll' },
              { label: 'Other', value: 'Other' },
            ]}
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        data={currentData}
        loading={loading}
        emptyState={
          <div className="text-center py-12">
            <IndianRupee className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">No Expenses Logged</h3>
            <p className="text-xs text-slate-455 mt-1">Start auditing budgets. Click 'Log Expense' above.</p>
          </div>
        }
      />

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* --- ADD EXPENSE MODAL --- */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Log Fleet Expense">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Select
            label="Select Allocated Vehicle"
            required
            options={[
              { label: 'Select vehicle...', value: '' },
              ...vehicles.map((v) => ({
                label: `${v.registrationNumber} - ${v.name}`,
                value: v.id,
              })),
            ]}
            value={form.vehicleId}
            onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Expense Category"
              options={[
                { label: 'Fuel Spend', value: 'Fuel' },
                { label: 'Maintenance Shop', value: 'Maintenance' },
                { label: 'Road Highway Tolls', value: 'Toll' },
                { label: 'Other Operational', value: 'Other' },
              ]}
              value={form.expenseType}
              onChange={(e) => setForm({ ...form, expenseType: e.target.value })}
            />
            <Input
              label="Total Cost (₹)"
              type="number"
              step="1"
              required
              placeholder="12000"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
            />
          </div>
          <Input
            label="Expense Date"
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Input
            label="Description Memo"
            required
            placeholder="Diesel fuel refill - Pilot Station #304"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-855">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
