import React, { useState, useEffect } from 'react';
import { Map, Plus, Search, Compass, CheckCircle2, ChevronRight, X, User, Truck, Clock } from 'lucide-react';
import { tripService, vehicleService, driverService } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Table } from '../components/Table';
import { Button, Input, Select, Badge, Pagination } from '../components/CommonUI';
import { Drawer, Modal } from '../components/Modal';

export default function Trips() {
  const { addNotification } = useNotifications();
  
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter/Pagination
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Drawers / Detail view state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  // Step-based form state
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    source: '',
    destination: '',
    distance: '',
    cargoWeight: '',
    cargoType: 'General Cargo',
    vehicleId: '',
    driverId: '',
  });

  const loadTrips = async () => {
    setLoading(true);
    try {
      const tripList = await tripService.getAll();
      setTrips(tripList);

      const vList = await vehicleService.getAll();
      setVehicles(vList);

      const dList = await driverService.getAll();
      setDrivers(dList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleOpenCreate = () => {
    setStep(1);
    setForm({
      source: '',
      destination: '',
      distance: '',
      cargoWeight: '',
      cargoType: 'General Cargo',
      vehicleId: '',
      driverId: '',
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      // Dispatch immediately as 'Dispatched'
      const dispatchedTrip = await tripService.create({ ...form, status: 'Dispatched' });
      
      // Update vehicle & driver status to On Trip
      const selectedV = vehicles.find((v) => v.id === form.vehicleId);
      const selectedD = drivers.find((d) => d.id === form.driverId);
      if (selectedV) await vehicleService.update({ ...selectedV, status: 'On Trip' });
      if (selectedD) await driverService.update({ ...selectedD, status: 'On Trip' });

      addNotification('Route Dispatched', `Trip ${dispatchedTrip.id} dispatched from ${form.source} to ${form.destination}.`, 'success');
      setIsCreateOpen(false);
      loadTrips();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const trip = trips.find(t => t.id === id);
      await tripService.updateStatus(id, newStatus);
      
      // If completed or cancelled, set vehicle and driver back to Available
      if (newStatus === 'Completed' || newStatus === 'Cancelled') {
        const selectedV = vehicles.find((v) => v.id === trip.vehicleId);
        const selectedD = drivers.find((d) => d.id === trip.driverId);
        if (selectedV) await vehicleService.update({ ...selectedV, status: 'Available' });
        if (selectedD) await driverService.update({ ...selectedD, status: 'Available' });
      }

      addNotification('Trip Dispatch Logged', `Trip status set to ${newStatus}.`, 'success');
      setSelectedTrip(null);
      loadTrips();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTrips = trips.filter((t) => {
    const matchSearch =
      t.source.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const currentData = filteredTrips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusColors = {
    Draft: 'secondary',
    Dispatched: 'info',
    Completed: 'success',
    Cancelled: 'danger',
  };

  const columns = [
    {
      header: 'Trip ID',
      key: 'id',
      render: (row) => (
        <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
          {row.id}
        </span>
      ),
    },
    {
      header: 'Route Path',
      key: 'source',
      render: (row) => (
        <div className="flex flex-col text-left">
          <span className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
            {row.source} → {row.destination}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">{row.distance} km total</span>
        </div>
      ),
    },
    {
      header: 'Vehicle Assigned',
      key: 'vehicleId',
      render: (row) => {
        const v = vehicles.find((item) => item.id === row.vehicleId);
        return v ? `${v.registrationNumber} (${v.name})` : row.vehicleId;
      },
    },
    {
      header: 'Driver',
      key: 'driverId',
      render: (row) => {
        const d = drivers.find((item) => item.id === row.driverId);
        return d ? d.name : row.driverId;
      },
    },
    { header: 'Weight', key: 'cargoWeight', render: (row) => `${row.cargoWeight} Tons` },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <Badge variant={statusColors[row.status]}>{row.status}</Badge>,
    },
  ];

  // Helper to render timeline markers
  const renderTimelineMarker = (title, description, isPassed, isCurrent) => {
    return (
      <div className="flex items-start space-x-3 text-left">
        <div className="relative flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
              isPassed
                ? 'bg-blue-600 border-blue-600 text-white'
                : isCurrent
                ? 'bg-white dark:bg-slate-900 border-blue-600 text-blue-600'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-455'
            }`}
          >
            {isPassed ? <CheckCircle2 className="w-4.5 h-4.5" /> : '•'}
          </div>
        </div>
        <div className="flex-1 pb-4">
          <h4
            className={`text-xs font-bold tracking-wide uppercase ${
              isCurrent ? 'text-blue-600' : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {title}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
    );
  };

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const availableDrivers = drivers.filter((d) => d.status === 'Available');

  return (
    <div className="space-y-6 text-left">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Trips & Dispatches
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dispatch trucks, track active freight cargo routes, and record delivery completions.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Dispatch Cargo
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
            placeholder="Search Trip ID, source, or destination..."
            className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Draft', value: 'Draft' },
              { label: 'Dispatched', value: 'Dispatched' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
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
        onRowClick={(row) => setSelectedTrip(row)}
        emptyState={
          <div className="text-center py-12">
            <Map className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">No Trips Dispatched</h3>
            <p className="text-xs text-slate-455 mt-1">Ready to create a route? Click 'Dispatch Cargo' above.</p>
          </div>
        }
      />

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* --- CREATE STEP-BASED TRIP DRAWER --- */}
      <Drawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Dispatch New Cargo Trip">
        <div className="space-y-6">
          {/* Step Progress Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
              <span className="text-xs font-semibold text-slate-650">Route</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center space-x-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
              <span className="text-xs font-semibold text-slate-650">Asset</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center space-x-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
              <span className="text-xs font-semibold text-slate-650">Summary</span>
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {/* STEP 1: ROUTING */}
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="Departure Address"
                  required
                  placeholder="Houston Warehouse A, TX"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                />
                <Input
                  label="Destination Address"
                  required
                  placeholder="Chicago Distribution Center, IL"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                />
                <Input
                  label="Total Distance (km)"
                  type="number"
                  required
                  placeholder="1450"
                  value={form.distance}
                  onChange={(e) => setForm({ ...form, distance: e.target.value })}
                />
                <div className="pt-4 flex justify-end">
                  <Button
                    variant="primary"
                    disabled={!form.source || !form.destination || !form.distance}
                    onClick={() => setStep(2)}
                  >
                    Next: Assign Assets
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: ASSETS */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Cargo Weight (Tons)"
                    type="number"
                    step="0.1"
                    required
                    placeholder="12.5"
                    value={form.cargoWeight}
                    onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })}
                  />
                  <Select
                    label="Cargo Type"
                    options={[
                      { label: 'General Cargo', value: 'General Cargo' },
                      { label: 'Refrigerated Food', value: 'Refrigerated' },
                      { label: 'Hazardous Materials', value: 'HAZMAT' },
                      { label: 'Electronics', value: 'Electronics' },
                    ]}
                    value={form.cargoType}
                    onChange={(e) => setForm({ ...form, cargoType: e.target.value })}
                  />
                </div>
                <Select
                  label="Select Available Vehicle"
                  required
                  options={[
                    { label: 'Choose a vehicle...', value: '' },
                    ...availableVehicles.map((v) => ({
                      label: `${v.registrationNumber} - ${v.name} (${v.type})`,
                      value: v.id,
                    })),
                  ]}
                  value={form.vehicleId}
                  onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                />
                <Select
                  label="Select Available Driver"
                  required
                  options={[
                    { label: 'Choose a driver...', value: '' },
                    ...availableDrivers.map((d) => ({
                      label: `${d.name} (${d.category} CDL)`,
                      value: d.id,
                    })),
                  ]}
                  value={form.driverId}
                  onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                />
                <div className="pt-4 flex justify-between space-x-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!form.cargoWeight || !form.vehicleId || !form.driverId}
                    onClick={() => setStep(3)}
                  >
                    Next: Review dispatch
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: DISPATCH SUMMARY */}
            {step === 3 && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3.5 leading-relaxed text-slate-655 dark:text-slate-350">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 pb-2 border-b">Dispatch Authorization Summary</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Departure Point:</span>
                    <span>{form.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery Destination:</span>
                    <span>{form.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Mileage:</span>
                    <span>{form.distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cargo Details:</span>
                    <span>{form.cargoWeight} Tons ({form.cargoType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle Allocated:</span>
                    <span>{vehicles.find(v => v.id === form.vehicleId)?.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Driver Registered:</span>
                    <span>{drivers.find(d => d.id === form.driverId)?.name}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between space-x-3">
                  <Button variant="outline" className="w-1/2" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" variant="success" className="w-1/2">
                    Approve & Dispatch
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </Drawer>

      {/* --- DETAIL TIMELINE POPUP / DRAWER --- */}
      <Modal isOpen={!!selectedTrip} onClose={() => setSelectedTrip(null)} title={`Trip Tracker: ${selectedTrip?.id}`}>
        {selectedTrip && (
          <div className="space-y-6">
            {/* Summary Details */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-left">
              <div>
                <div className="text-slate-400 mb-0.5">Route Path</div>
                <div className="text-slate-850 dark:text-slate-100">{selectedTrip.source} → {selectedTrip.destination}</div>
              </div>
              <div>
                <div className="text-slate-400 mb-0.5">Distance</div>
                <div className="text-slate-850 dark:text-slate-100">{selectedTrip.distance} km</div>
              </div>
              <div>
                <div className="text-slate-400 mb-0.5">Assigned Truck</div>
                <div className="text-slate-850 dark:text-slate-100">
                  {vehicles.find((v) => v.id === selectedTrip.vehicleId)?.registrationNumber}
                </div>
              </div>
              <div>
                <div className="text-slate-400 mb-0.5">Assigned Driver</div>
                <div className="text-slate-850 dark:text-slate-100">
                  {drivers.find((d) => d.id === selectedTrip.driverId)?.name}
                </div>
              </div>
            </div>

            {/* Visual Milestones Timeline */}
            <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-300 uppercase tracking-wider mb-4 text-left">Milestones</h4>
              
              <div className="relative border-l border-slate-200 dark:border-slate-700 pl-4 space-y-4">
                {renderTimelineMarker(
                  '1. Manifest Drafted',
                  'Cargo load requirements calculated. Dispatch request authorized.',
                  true,
                  selectedTrip.status === 'Draft'
                )}
                {renderTimelineMarker(
                  '2. Dispatched',
                  'Vehicle departed source dock and is in transit route.',
                  selectedTrip.status === 'Completed' || selectedTrip.status === 'Dispatched',
                  selectedTrip.status === 'Dispatched'
                )}
                {renderTimelineMarker(
                  '3. Delivery Destination Arrived',
                  'Cargo unloaded and signature received. Route finalized.',
                  selectedTrip.status === 'Completed',
                  selectedTrip.status === 'Completed'
                )}
                {selectedTrip.status === 'Cancelled' &&
                  renderTimelineMarker(
                    'Trip Cancelled',
                    'Dispatch requested cancelled or recalled.',
                    true,
                    true
                  )}
              </div>
            </div>

            {/* Quick Status Modifiers */}
            {selectedTrip.status === 'Dispatched' && (
              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  className="w-1/2 text-rose-600 border-rose-200"
                  onClick={() => handleUpdateStatus(selectedTrip.id, 'Cancelled')}
                >
                  Cancel Trip
                </Button>
                <Button
                  variant="success"
                  className="w-1/2"
                  onClick={() => handleUpdateStatus(selectedTrip.id, 'Completed')}
                >
                  Complete Trip
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-850">
              <Button variant="outline" onClick={() => setSelectedTrip(null)}>
                Close Tracker
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
