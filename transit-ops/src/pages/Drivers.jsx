import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Star, Edit2 } from 'lucide-react';
import { driverService } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Table } from '../components/Table';
import { Button, Input, Select, Badge, Avatar, Pagination } from '../components/CommonUI';
import { Modal } from '../components/Modal';

export default function Drivers() {
  const { addNotification } = useNotifications();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and sorting
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add/Edit driver states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const [form, setForm] = useState({
    name: '',
    licenseNumber: '',
    category: 'Class A',
    expiryDate: '',
    phone: '',
    safetyScore: 90,
  });

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      name: '',
      licenseNumber: '',
      category: 'Class A',
      expiryDate: '',
      phone: '',
      safetyScore: 90,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setSelectedDriver(driver);
    setForm(driver);
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await driverService.create(form);
      addNotification('Driver Enrolled', `Driver ${form.name} was hired and registered successfully.`, 'success');
      setIsAddOpen(false);
      loadDrivers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await driverService.update(form);
      addNotification('Driver Profile Updated', `Profile of ${form.name} has been updated.`, 'success');
      setIsEditOpen(false);
      loadDrivers();
    } catch (err) {
      console.error(err);
    }
  };

  const getSafetyScoreStyle = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/25';
    if (score >= 75) return 'text-amber-500 bg-amber-500/10 border-amber-500/25';
    return 'text-rose-600 bg-rose-500/10 border-rose-500/25';
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory ? d.category === filterCategory : true;
    const matchStatus = filterStatus ? d.status === filterStatus : true;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const currentData = filteredDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusColors = {
    Available: 'success',
    'On Trip': 'info',
    'Off Duty': 'secondary',
  };

  const columns = [
    {
      header: 'Driver Info',
      key: 'name',
      render: (row) => (
        <div className="flex items-center space-x-3 text-left">
          <Avatar name={row.name} size="sm" />
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block">{row.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{row.id}</span>
          </div>
        </div>
      ),
    },
    { header: 'License ID', key: 'licenseNumber', render: (row) => <code className="font-mono text-xs">{row.licenseNumber}</code> },
    { header: 'License Category', key: 'category' },
    { header: 'Expiry Date', key: 'expiryDate', render: (row) => {
      const isExpiringSoon = new Date(row.expiryDate) - new Date() < 30 * 24 * 60 * 60 * 1000;
      return (
        <span className={isExpiringSoon ? 'text-amber-500 font-bold' : ''}>
          {row.expiryDate}
        </span>
      );
    }},
    { header: 'Contact', key: 'phone' },
    {
      header: 'Safety Score',
      key: 'safetyScore',
      render: (row) => (
        <div className="flex items-center justify-center">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-black tracking-wide ${getSafetyScoreStyle(row.safetyScore)}`}>
            <Star className="w-3.5 h-3.5 mr-1 fill-current" />
            {row.safetyScore}/100
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <Badge variant={statusColors[row.status] || 'secondary'}>{row.status}</Badge>,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEdit(row);
          }}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Drivers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor commercial drivers, safety certifications, scores, and dispatch availability.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Enroll Driver
        </Button>
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
            placeholder="Search driver by name or license ID..."
            className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <Select
            options={[
              { label: 'All Licenses', value: '' },
              { label: 'Class A CDL', value: 'Class A' },
              { label: 'Class B CDL', value: 'Class B' },
              { label: 'Class C CDL', value: 'Class C' },
            ]}
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Available', value: 'Available' },
              { label: 'On Trip', value: 'On Trip' },
              { label: 'Off Duty', value: 'Off Duty' },
            ]}
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
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
            <Users className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">No Drivers Found</h3>
            <p className="text-xs text-slate-450 mt-1">Try resetting filters or registering a new commercial driver.</p>
          </div>
        }
      />

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* --- ADD DRIVER MODAL --- */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Hire Commercial Driver">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="Johnathan Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="License Number"
              required
              placeholder="DL-783921"
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
            />
            <Select
              label="License Category"
              options={[
                { label: 'Class A CDL', value: 'Class A' },
                { label: 'Class B CDL', value: 'Class B' },
                { label: 'Class C CDL', value: 'Class C' },
              ]}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="License Expiration"
              type="date"
              required
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
            <Input
              label="Phone Contact"
              required
              placeholder="+1 (555) 012-4456"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <Input
            label="Initial Safety Score (0-100)"
            type="number"
            min="0"
            max="100"
            required
            value={form.safetyScore}
            onChange={(e) => setForm({ ...form, safetyScore: Number(e.target.value) })}
          />
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Enroll Driver
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT DRIVER MODAL --- */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Driver Profile">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="Johnathan Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="License Number"
              required
              placeholder="DL-783921"
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
            />
            <Select
              label="License Category"
              options={[
                { label: 'Class A CDL', value: 'Class A' },
                { label: 'Class B CDL', value: 'Class B' },
                { label: 'Class C CDL', value: 'Class C' },
              ]}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="License Expiration"
              type="date"
              required
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
            <Input
              label="Phone Contact"
              required
              placeholder="+1 (555) 012-4456"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Safety Score"
              type="number"
              min="0"
              max="100"
              required
              value={form.safetyScore}
              onChange={(e) => setForm({ ...form, safetyScore: Number(e.target.value) })}
            />
            <Select
              label="Shift Status"
              options={[
                { label: 'Available', value: 'Available' },
                { label: 'On Trip', value: 'On Trip' },
                { label: 'Off Duty', value: 'Off Duty' },
              ]}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
