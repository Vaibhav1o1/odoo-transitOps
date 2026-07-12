import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Edit2, Trash2, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { vehicleService } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Table } from '../components/Table';
import { Button, Input, Select, Badge, Pagination } from '../components/CommonUI';
import { Modal, ConfirmationDialog } from '../components/Modal';

export default function Vehicles() {
  const { addNotification } = useNotifications();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters, sorting and pagination states
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [sortField, setSortField] = useState('registrationNumber');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form states
  const [form, setForm] = useState({
    registrationNumber: '',
    name: '',
    type: 'Semi-Truck',
    capacity: '',
    odometer: '',
    acquisitionCost: '',
    status: 'Available',
    region: 'North',
  });

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleOpenAdd = () => {
    setForm({
      registrationNumber: '',
      name: '',
      type: 'Semi-Truck',
      capacity: '',
      odometer: '',
      acquisitionCost: '',
      status: 'Available',
      region: 'North',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setForm({
      ...vehicle,
      acquisitionCost: vehicle.acquisitionCost ? Math.round(vehicle.acquisitionCost * 83) : ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await vehicleService.create({
        ...form,
        acquisitionCost: Number(form.acquisitionCost) / 83 // convert user input INR to database USD
      });
      addNotification('Asset Added', `Vehicle ${form.registrationNumber} has been successfully registered.`, 'success');
      setIsAddOpen(false);
      loadVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await vehicleService.update({
        ...form,
        acquisitionCost: Number(form.acquisitionCost) / 83 // convert user input INR to database USD
      });
      addNotification('Asset Updated', `Vehicle ${form.registrationNumber} details have been updated.`, 'success');
      setIsEditOpen(false);
      loadVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await vehicleService.delete(selectedVehicle.id);
      addNotification('Asset Removed', `Vehicle ${selectedVehicle.registrationNumber} has been retired and removed.`, 'success');
      setIsDeleteOpen(false);
      loadVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter and Sort implementation
  const filteredVehicles = vehicles
    .filter((v) => {
      const matchSearch =
        v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
        v.name.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType ? v.type === filterType : true;
      const matchStatus = filterStatus ? v.status === filterStatus : true;
      const matchRegion = filterRegion ? v.region === filterRegion : true;
      return matchSearch && matchType && matchStatus && matchRegion;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const currentData = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusColors = {
    Available: 'success',
    'On Trip': 'info',
    'In Shop': 'danger',
    Retired: 'secondary',
  };

  const columns = [
    {
      header: 'Reg Number',
      key: 'registrationNumber',
      render: (row) => (
        <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
          {row.registrationNumber}
        </span>
      ),
    },
    { header: 'Vehicle Model', key: 'name' },
    { header: 'Type', key: 'type' },
    { header: 'Capacity', key: 'capacity', render: (row) => `${row.capacity} Tons` },
    { header: 'Odometer', key: 'odometer', render: (row) => `${row.odometer.toLocaleString()} km` },
    { header: 'Region', key: 'region' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <Badge variant={statusColors[row.status]}>{row.status}</Badge>,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDelete(row);
            }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Vehicles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage operational transportation assets, mileage records, and shop maintenance statuses.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Register Vehicle
        </Button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full lg:max-w-md">
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
              placeholder="Search registration or vehicle name..."
              className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-3 gap-2.5 w-full lg:w-auto">
            <Select
              options={[
                { label: 'All Types', value: '' },
                { label: 'Semi-Truck', value: 'Semi-Truck' },
                { label: 'Cargo Van', value: 'Cargo Van' },
                { label: 'Heavy Duty Truck', value: 'Heavy Duty Truck' },
                { label: 'Box Truck', value: 'Box Truck' },
              ]}
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Select
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Available', value: 'Available' },
                { label: 'On Trip', value: 'On Trip' },
                { label: 'In Shop', value: 'In Shop' },
                { label: 'Retired', value: 'Retired' },
              ]}
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Select
              options={[
                { label: 'All Regions', value: '' },
                { label: 'North', value: 'North' },
                { label: 'South', value: 'South' },
                { label: 'East', value: 'East' },
                { label: 'West', value: 'West' },
              ]}
              value={filterRegion}
              onChange={(e) => {
                setFilterRegion(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Sorting buttons */}
        <div className="flex items-center space-x-2 border-t border-slate-100 dark:border-slate-850 pt-3 text-xs font-semibold text-slate-500">
          <SlidersHorizontal className="w-4 h-4 mr-1 text-slate-400" />
          <span>Sort By:</span>
          <button
            onClick={() => handleSort('registrationNumber')}
            className={`px-3 py-1 rounded-lg border flex items-center space-x-1 ${
              sortField === 'registrationNumber' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>Registration</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleSort('odometer')}
            className={`px-3 py-1 rounded-lg border flex items-center space-x-1 ${
              sortField === 'odometer' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>Odometer</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        data={currentData}
        loading={loading}
        emptyState={
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">No Vehicles Registered</h3>
            <p className="text-xs text-slate-450 mt-1">Try resetting filters or registering a new vehicle asset.</p>
          </div>
        }
      />

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* --- ADD VEHICLE MODAL --- */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Fleet Vehicle">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Registration Number"
            required
            placeholder="TX-2938"
            value={form.registrationNumber}
            onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
          />
          <Input
            label="Vehicle Name"
            required
            placeholder="Freightliner Cascadia"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cargo Capacity (Tons)"
              type="number"
              required
              placeholder="18"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
            <Input
              label="Initial Odometer (km)"
              type="number"
              required
              placeholder="120000"
              value={form.odometer}
              onChange={(e) => setForm({ ...form, odometer: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Acquisition Cost (₹)"
              type="number"
              required
              placeholder="1000000"
              value={form.acquisitionCost}
              onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
            />
            <Select
              label="Vehicle Type"
              options={[
                { label: 'Semi-Truck', value: 'Semi-Truck' },
                { label: 'Cargo Van', value: 'Cargo Van' },
                { label: 'Heavy Duty Truck', value: 'Heavy Duty Truck' },
                { label: 'Box Truck', value: 'Box Truck' },
              ]}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Operational Region"
              options={[
                { label: 'North', value: 'North' },
                { label: 'South', value: 'South' },
                { label: 'East', value: 'East' },
                { label: 'West', value: 'West' },
              ]}
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
            <Select
              label="Initial Status"
              options={[
                { label: 'Available', value: 'Available' },
                { label: 'On Trip', value: 'On Trip' },
                { label: 'In Shop', value: 'In Shop' },
                { label: 'Retired', value: 'Retired' },
              ]}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT VEHICLE MODAL --- */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Fleet Vehicle Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Registration Number"
            required
            placeholder="TX-2938"
            value={form.registrationNumber}
            onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
          />
          <Input
            label="Vehicle Name"
            required
            placeholder="Freightliner Cascadia"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cargo Capacity (Tons)"
              type="number"
              required
              placeholder="18"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
            <Input
              label="Odometer (km)"
              type="number"
              required
              placeholder="120000"
              value={form.odometer}
              onChange={(e) => setForm({ ...form, odometer: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Acquisition Cost (₹)"
              type="number"
              required
              placeholder="1000000"
              value={form.acquisitionCost}
              onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
            />
            <Select
              label="Vehicle Type"
              options={[
                { label: 'Semi-Truck', value: 'Semi-Truck' },
                { label: 'Cargo Van', value: 'Cargo Van' },
                { label: 'Heavy Duty Truck', value: 'Heavy Duty Truck' },
                { label: 'Box Truck', value: 'Box Truck' },
              ]}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Operational Region"
              options={[
                { label: 'North', value: 'North' },
                { label: 'South', value: 'South' },
                { label: 'East', value: 'East' },
                { label: 'West', value: 'West' },
              ]}
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
            <Select
              label="Current Status"
              options={[
                { label: 'Available', value: 'Available' },
                { label: 'On Trip', value: 'On Trip' },
                { label: 'In Shop', value: 'In Shop' },
                { label: 'Retired', value: 'Retired' },
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
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- CONFIRM RETIRE VEHICLE DIALOG --- */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Retire Fleet Vehicle"
        message={`Are you absolutely sure you want to retire and remove vehicle ${
          selectedVehicle?.registrationNumber
        } (${selectedVehicle?.name}) from the TransitOps system? This operation cannot be reversed.`}
        confirmText="Retire Vehicle"
      />
    </div>
  );
}
