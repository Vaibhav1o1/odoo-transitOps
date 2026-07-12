import React, { useState } from 'react';
import { BarChart3, Download, FileText, TrendingUp, DollarSign, Fuel, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Card, Button, StatCard, Badge } from '../components/CommonUI';
import { useNotifications } from '../context/NotificationContext';

// Mock report datasets
const roiData = [
  { month: 'Jan', roi: 12 },
  { month: 'Feb', roi: 14 },
  { month: 'Mar', roi: 15 },
  { month: 'Apr', roi: 16.5 },
  { month: 'May', roi: 17.2 },
  { month: 'Jun', roi: 18.4 },
];

const mileageData = [
  { name: 'Cascadia', km: 24000 },
  { name: 'Volvo FH', km: 31000 },
  { name: 'Kenworth', km: 28000 },
  { name: 'Transit Van', km: 12000 },
];

const efficiencyData = [
  { name: 'Van FL', value: 4.8 },
  { name: 'Semi TX', value: 3.2 },
  { name: 'Heavy NY', value: 2.8 },
  { name: 'Van NV', value: 4.5 },
];

const expenseShare = [
  { name: 'Fuel', value: 5800, color: '#2563EB' },
  { name: 'Maintenance', value: 3100, color: '#EF4444' },
  { name: 'Toll', value: 1200, color: '#14B8A6' },
  { name: 'Others', value: 850, color: '#F59E0B' },
];

export default function Reports() {
  const { addNotification } = useNotifications();
  const [exporting, setExporting] = useState(null);

  const handleExport = (type) => {
    setExporting(type);
    addNotification('Export Initiated', `Assembling metrics for ${type} conversion. Please wait...`, 'info');
    
    setTimeout(() => {
      setExporting(null);
      addNotification('Download Ready', `TransitOps_Report_${new Date().toISOString().split('T')[0]}.${type.toLowerCase()} has been saved to downloads.`, 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Operational Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Evaluate investment metrics, fuel diagnostics, and monthly utilization metrics.
          </p>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-1/2 sm:w-auto"
            icon={Download}
            loading={exporting === 'CSV'}
            onClick={() => handleExport('CSV')}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            className="w-1/2 sm:w-auto"
            icon={FileText}
            loading={exporting === 'PDF'}
            onClick={() => handleExport('PDF')}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Fleet ROI Index" value="18.4%" trend="up" percent={2.3} icon={TrendingUp} color="blue" />
        <StatCard title="Fuel Efficiency" value="4.2 km/L" trend="up" percent={0.8} icon={Fuel} color="teal" />
        <StatCard title="Operational Cost" value="$14,250" trend="down" percent={5.4} icon={DollarSign} color="red" />
        <StatCard title="Active Utilization" value="84.5%" trend="up" percent={3.1} icon={Activity} color="orange" />
      </div>

      {/* RECHARTS REPORTS GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI trend Area */}
        <Card className="text-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">Fleet Return on Investment (ROI) Trend</h3>
            <Badge variant="info">6-Month Span</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={roiData} margin={{ left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Area type="monotone" dataKey="roi" stroke="#2563EB" fill="#2563EB" fillOpacity={0.08} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Vehicle Mileage Bar */}
        <Card className="text-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">Top Vehicle Utilization (Mileage in km)</h3>
            <Badge variant="success">Diagnostics</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mileageData} margin={{ left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="km" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense share Pie */}
        <Card className="text-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">Financial Expense Distribution</h3>
            <Badge variant="secondary">Fiscal Year</Badge>
          </div>
          <div className="h-64 flex flex-col md:flex-row items-center justify-center">
            <div className="w-1/2 h-full min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseShare} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                    {expenseShare.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 text-left pl-4">
              {expenseShare.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between font-semibold">
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-655 dark:text-slate-350">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-950 dark:text-slate-50">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Fuel Efficiency Line */}
        <Card className="text-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">Vehicle Fuel Efficiency (km/L)</h3>
            <Badge variant="warning">Efficiency</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyData} margin={{ left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
