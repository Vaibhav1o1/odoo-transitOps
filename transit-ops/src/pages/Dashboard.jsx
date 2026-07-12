import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Map,
  Users,
  Wrench,
  DollarSign,
  TrendingUp,
  Percent,
  Plus,
  Compass,
  ArrowRight,
  Receipt,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { dashboardService, vehicleService, driverService, tripService, maintenanceService, expenseService } from '../services/mockApi';
import { StatCard, Card, Skeleton, Button, Badge, Input, Select } from '../components/CommonUI';
import { Modal, Drawer } from '../components/Modal';

// Mock chart data
const utilizationTrendData = [
  { name: 'Jan', rate: 70 },
  { name: 'Feb', rate: 75 },
  { name: 'Mar', rate: 72 },
  { name: 'Apr', rate: 82 },
  { name: 'May', rate: 85 },
  { name: 'Jun', rate: 80 },
  { name: 'Jul', rate: 88 },
];

const fuelCostData = [
  { month: 'Mar', cost: 4200 },
  { month: 'Apr', cost: 5100 },
  { month: 'May', cost: 4800 },
  { month: 'Jun', cost: 6200 },
  { month: 'Jul', cost: 5800 },
];

const tripCompletionData = [
  { name: 'Mon', completed: 12, target: 15 },
  { name: 'Tue', completed: 14, target: 15 },
  { name: 'Wed', completed: 15, target: 15 },
  { name: 'Thu', completed: 11, target: 15 },
  { name: 'Fri', completed: 16, target: 15 },
  { name: 'Sat', completed: 8, target: 10 },
  { name: 'Sun', completed: 5, target: 8 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Lists for recent items
  const [recentTrips, setRecentTrips] = useState([]);
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);

  // Modals state
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [tripDrawerOpen, setTripDrawerOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);

  // Form states for Quick Actions
  const [newVehicle, setNewVehicle] = useState({ registrationNumber: '', name: '', type: 'Semi-Truck', capacity: '', odometer: '', status: 'Available', region: 'North' });
  const [newDriver, setNewDriver] = useState({ name: '', licenseNumber: '', category: 'Class A', expiryDate: '', phone: '', safetyScore: 95 });
  const [newTrip, setNewTrip] = useState({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', distance: '' });
  const [newFuel, setNewFuel] = useState({ vehicleId: '', cost: '', odometer: '', date: new Date().toISOString().split('T')[0] });

  // Options for selects
  const [vehiclesList, setVehiclesList] = useState([]);
  const [driversList, setDriversList] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await dashboardService.getStats();
      setStats(statsRes);

      const tripsRes = await tripService.getAll();
      setRecentTrips(tripsRes.slice(0, 3));

      const maintRes = await maintenanceService.getAll();
      setRecentMaintenance(maintRes.slice(0, 3));

      const expRes = await expenseService.getAll();
      setRecentExpenses(expRes.slice(0, 3));

      // Get vehicles & drivers for dropdown selections
      const vList = await vehicleService.getAll();
      setVehiclesList(vList.filter(v => v.status === 'Available'));
      const dList = await driverService.getAll();
      setDriversList(dList.filter(d => d.status === 'Available'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await vehicleService.create(newVehicle);
      addNotification('Vehicle Registered', `Vehicle ${newVehicle.registrationNumber} has been registered successfully.`, 'success');
      setVehicleModalOpen(false);
      setNewVehicle({ registrationNumber: '', name: '', type: 'Semi-Truck', capacity: '', odometer: '', status: 'Available', region: 'North' });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      await driverService.create(newDriver);
      addNotification('Driver Hired', `Driver ${newDriver.name} is now registered in the pool.`, 'success');
      setDriverModalOpen(false);
      setNewDriver({ name: '', licenseNumber: '', category: 'Class A', expiryDate: '', phone: '', safetyScore: 95 });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      await tripService.create({ ...newTrip, status: 'Dispatched' });
      // Update vehicle & driver status to On Trip
      const targetVehicle = vehiclesList.find(v => v.id === newTrip.vehicleId);
      const targetDriver = driversList.find(d => d.id === newTrip.driverId);
      if (targetVehicle) await vehicleService.update({ ...targetVehicle, status: 'On Trip' });
      if (targetDriver) await driverService.update({ ...targetDriver, status: 'On Trip' });

      addNotification('Trip Dispatched', `Route from ${newTrip.source} to ${newTrip.destination} has been dispatched.`, 'success');
      setTripDrawerOpen(false);
      setNewTrip({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', distance: '' });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogFuel = async (e) => {
    e.preventDefault();
    try {
      const selectedV = vehiclesList.find(v => v.id === newFuel.vehicleId) || vehiclesList[0];
      await expenseService.create({
        vehicleId: newFuel.vehicleId,
        expenseType: 'Fuel',
        cost: Number(newFuel.cost),
        date: newFuel.date,
        description: `Fuel logged at ${newFuel.odometer} km`
      });

      // Also update vehicle odometer
      if (selectedV && Number(newFuel.odometer) > selectedV.odometer) {
        await vehicleService.update({
          ...selectedV,
          odometer: Number(newFuel.odometer)
        });
      }

      addNotification('Fuel Logged', `Logged fuel expense of $${newFuel.cost} for vehicle.`, 'success');
      setFuelModalOpen(false);
      setNewFuel({ vehicleId: '', cost: '', odometer: '', date: new Date().toISOString().split('T')[0] });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors = {
    Available: 'success',
    'On Trip': 'info',
    'In Shop': 'danger',
    Retired: 'secondary',
    Dispatched: 'info',
    Completed: 'success',
    Cancelled: 'danger',
    Draft: 'secondary',
    Open: 'warning',
    'In Progress': 'info',
    Closed: 'success',
  };

  // Pie chart variables
  const statusDistribution = stats ? [
    { name: 'Available', value: stats.availableVehicles, color: '#22C55E' },
    { name: 'On Trip', value: stats.activeVehicles - stats.availableVehicles - stats.maintenanceVehicles, color: '#2563EB' },
    { name: 'In Shop', value: stats.maintenanceVehicles, color: '#EF4444' },
  ].filter(i => i.value > 0) : [];

  return (
    <div className="space-y-6 text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Welcome, {user?.name || 'Manager'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Here's the operational overview for TransitOps fleet network.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" size="sm" onClick={loadDashboardData} icon={TrendingUp}>
            Reload Stats
          </Button>
        </div>
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} variant="card" />
          ))
        ) : (
          <>
            <StatCard title="Active Vehicles" value={stats.activeVehicles} trend="up" percent={4.2} icon={Truck} color="blue" />
            <StatCard title="Active Trips" value={stats.activeTrips} trend="up" percent={12.4} icon={Compass} color="teal" />
            <StatCard title="Drivers on Duty" value={stats.driversOnDuty} trend="down" percent={2.1} icon={Users} color="green" />
            <StatCard title="Fleet Utilization" value={`${stats.utilizationRate}%`} trend="up" percent={8.5} icon={Percent} color="orange" />
          </>
        )}
      </div>

      {/* QUICK ACTIONS MENU */}
      <div className="bg-gradient-to-br from-blue-500/5 to-teal-500/5 border border-blue-200/10 dark:border-blue-900/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center space-x-3.5 text-left w-full md:w-auto">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Quick Dispatch Actions</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Register assets and assign routes immediately.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:flex flex-wrap gap-2.5 w-full md:w-auto justify-end">
          <Button size="sm" variant="secondary" icon={Plus} onClick={() => setVehicleModalOpen(true)} className="justify-start">Add Vehicle</Button>
          <Button size="sm" variant="secondary" icon={Plus} onClick={() => setDriverModalOpen(true)} className="justify-start">Add Driver</Button>
          <Button size="sm" variant="secondary" icon={Plus} onClick={() => setFuelModalOpen(true)} className="justify-start">Log Fuel</Button>
          <Button size="sm" variant="primary" icon={Compass} onClick={() => setTripDrawerOpen(true)} className="justify-start">Create Trip</Button>
        </div>
      </div>

      {/* CHARTS LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Utilization Area Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Fleet Utilization % Trend</h3>
            <Badge variant="info">Monthly Overview</Badge>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Fuel Costs Bar Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-855 dark:text-slate-200">Monthly Fuel Costs ($)</h3>
            <Badge variant="warning">Fleet Expenses</Badge>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelCostData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="cost" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Vehicle Status Pie/Donut Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Vehicle Status Distribution</h3>
            <Badge variant="secondary">Live Status</Badge>
          </div>
          <div className="h-64 flex flex-col md:flex-row items-center justify-center text-xs">
            {loading ? <Skeleton variant="circle" className="w-40 h-40" /> : (
              statusDistribution.length === 0 ? (
                <div className="text-slate-500">No vehicle status data available</div>
              ) : (
                <>
                  <div className="w-1/2 h-full min-h-[160px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-2 mt-4 md:mt-0 text-left">
                    {statusDistribution.map((entry, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="font-semibold text-slate-750 dark:text-slate-300 capitalize">{entry.name}:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-50">{entry.value} vehicles</span>
                      </div>
                    ))}
                  </div>
                </>
              )
            )}
          </div>
        </Card>

        {/* Trip Completion Line Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Trip Dispatched vs. Targets</h3>
            <Badge variant="success">Performance</Badge>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tripCompletionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#22C55E" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="target" stroke="#94A3B8" strokeDasharray="5 5" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* RECENT ACTIVITY LOGS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Trips */}
        <Card className="xl:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Dispatches</h3>
            <button onClick={() => navigate('/trips')} className="text-xs font-semibold text-blue-600 dark:text-blue-450 hover:underline flex items-center">
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {loading ? Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} variant="line" />) : (
              recentTrips.map((trip) => (
                <div key={trip.id} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-slate-850/50 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-850 dark:text-slate-105">{trip.source} → {trip.destination}</div>
                    <div className="text-slate-450 font-medium">Distance: {trip.distance} km</div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={statusColors[trip.status]}>{trip.status}</Badge>
                    <div className="text-[10px] text-slate-400 mt-1">{trip.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Maintenance */}
        <Card className="xl:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Shop Repairs</h3>
            <button onClick={() => navigate('/maintenance')} className="text-xs font-semibold text-blue-600 dark:text-blue-450 hover:underline flex items-center">
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {loading ? Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} variant="line" />) : (
              recentMaintenance.map((maint) => (
                <div key={maint.id} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-slate-850/50 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1 pr-3 max-w-[70%]">
                    <div className="font-bold text-slate-850 dark:text-slate-100 truncate" title={maint.issue}>{maint.issue}</div>
                    <div className="text-slate-450 font-medium">Vehicle ID: {maint.vehicleId}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={statusColors[maint.status]}>{maint.status}</Badge>
                    <div className="text-[10px] text-slate-400 mt-1">{maint.assignedDate}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Expenses */}
        <Card className="xl:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Financial Logs</h3>
            <button onClick={() => navigate('/expenses')} className="text-xs font-semibold text-blue-600 dark:text-blue-450 hover:underline flex items-center">
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {loading ? Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} variant="line" />) : (
              recentExpenses.map((exp) => (
                <div key={exp.id} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-slate-850/50 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-850 dark:text-slate-100">{exp.description}</div>
                    <div className="text-slate-450 font-medium">{exp.expenseType} • Vehicle {exp.vehicleId}</div>
                  </div>
                  <div className="text-right space-y-1 font-bold text-slate-950 dark:text-slate-50">
                    ${exp.cost.toFixed(2)}
                    <div className="text-[10px] font-normal text-slate-400 mt-1">{exp.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* --- QUICK ACTION MODALS --- */}
      {/* 1. Add Vehicle Modal */}
      <Modal isOpen={vehicleModalOpen} onClose={() => setVehicleModalOpen(false)} title="Register Fleet Vehicle">
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <Input label="Registration Number" required placeholder="TX-9902" value={newVehicle.registrationNumber} onChange={e => setNewVehicle({...newVehicle, registrationNumber: e.target.value})} />
          <Input label="Vehicle Name / Model" required placeholder="Ford Transit 350" value={newVehicle.name} onChange={e => setNewVehicle({...newVehicle, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cargo Capacity (tons)" type="number" required placeholder="3.5" value={newVehicle.capacity} onChange={e => setNewVehicle({...newVehicle, capacity: e.target.value})} />
            <Input label="Odometer (km)" type="number" required placeholder="45000" value={newVehicle.odometer} onChange={e => setNewVehicle({...newVehicle, odometer: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Vehicle Type" options={[{label: 'Cargo Van', value: 'Cargo Van'}, {label: 'Semi-Truck', value: 'Semi-Truck'}, {label: 'Heavy Duty Truck', value: 'Heavy Duty Truck'}, {label: 'Box Truck', value: 'Box Truck'}]} value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})} />
            <Select label="Operational Region" options={[{label: 'North', value: 'North'}, {label: 'South', value: 'South'}, {label: 'East', value: 'East'}, {label: 'West', value: 'West'}]} value={newVehicle.region} onChange={e => setNewVehicle({...newVehicle, region: e.target.value})} />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <Button variant="outline" onClick={() => setVehicleModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Register Vehicle</Button>
          </div>
        </form>
      </Modal>

      {/* 2. Add Driver Modal */}
      <Modal isOpen={driverModalOpen} onClose={() => setDriverModalOpen(false)} title="Hire Fleet Driver">
        <form onSubmit={handleAddDriver} className="space-y-4">
          <Input label="Full Name" required placeholder="Marcus Aurelius" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="License Number" required placeholder="DL-920194" value={newDriver.licenseNumber} onChange={e => setNewDriver({...newDriver, licenseNumber: e.target.value})} />
            <Select label="License Category" options={[{label: 'Class A CDL', value: 'Class A'}, {label: 'Class B CDL', value: 'Class B'}, {label: 'Class C CDL', value: 'Class C'}]} value={newDriver.category} onChange={e => setNewDriver({...newDriver, category: e.target.value})} />
          </div>
          <Input label="License Expiration Date" type="date" required value={newDriver.expiryDate} onChange={e => setNewDriver({...newDriver, expiryDate: e.target.value})} />
          <Input label="Phone Contact" type="tel" required placeholder="+1 (555) 019-3382" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} />
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <Button variant="outline" onClick={() => setDriverModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Hire Driver</Button>
          </div>
        </form>
      </Modal>

      {/* 3. Log Fuel Expense Modal */}
      <Modal isOpen={fuelModalOpen} onClose={() => setFuelModalOpen(false)} title="Log Fuel Expense">
        <form onSubmit={handleLogFuel} className="space-y-4">
          <Select
            label="Select Active Vehicle"
            options={vehiclesList.map(v => ({ label: `${v.registrationNumber} - ${v.name}`, value: v.id }))}
            value={newFuel.vehicleId}
            onChange={e => setNewFuel({...newFuel, vehicleId: e.target.value})}
          />
          <Input label="Cost of Fuel ($)" type="number" step="0.01" required placeholder="120.00" value={newFuel.cost} onChange={e => setNewFuel({...newFuel, cost: e.target.value})} />
          <Input label="Current Odometer (km)" type="number" required placeholder="148000" value={newFuel.odometer} onChange={e => setNewFuel({...newFuel, odometer: e.target.value})} />
          <Input label="Date of Expense" type="date" required value={newFuel.date} onChange={e => setNewFuel({...newFuel, date: e.target.value})} />
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <Button variant="outline" onClick={() => setFuelModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Log Expense</Button>
          </div>
        </form>
      </Modal>

      {/* 4. Create Trip Drawer */}
      <Drawer isOpen={tripDrawerOpen} onClose={() => setTripDrawerOpen(false)} title="Dispatch New Cargo Trip">
        <form onSubmit={handleCreateTrip} className="space-y-4">
          <Input label="Departure Source Address" required placeholder="Chicago Terminal Hub, IL" value={newTrip.source} onChange={e => setNewTrip({...newTrip, source: e.target.value})} />
          <Input label="Destination Address" required placeholder="Detroit Delivery Center, MI" value={newTrip.destination} onChange={e => setNewTrip({...newTrip, destination: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cargo Weight (Tons)" type="number" step="0.1" required placeholder="14.5" value={newTrip.cargoWeight} onChange={e => setNewTrip({...newTrip, cargoWeight: e.target.value})} />
            <Input label="Trip Distance (km)" type="number" required placeholder="460" value={newTrip.distance} onChange={e => setNewTrip({...newTrip, distance: e.target.value})} />
          </div>

          <Select
            label="Assign Vehicle"
            options={[
              { label: 'Select available...', value: '' },
              ...vehiclesList.map(v => ({ label: `${v.registrationNumber} (${v.type})`, value: v.id }))
            ]}
            required
            value={newTrip.vehicleId}
            onChange={e => setNewTrip({...newTrip, vehicleId: e.target.value})}
          />

          <Select
            label="Assign Driver"
            options={[
              { label: 'Select available...', value: '' },
              ...driversList.map(d => ({ label: `${d.name} (${d.category})`, value: d.id }))
            ]}
            required
            value={newTrip.driverId}
            onChange={e => setNewTrip({...newTrip, driverId: e.target.value})}
          />

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Dispatch Summary</h5>
            <div className="text-xs space-y-1.5 font-medium text-slate-700 dark:text-slate-350">
              <div className="flex justify-between"><span>Total Distance:</span> <span>{newTrip.distance || 0} km</span></div>
              <div className="flex justify-between"><span>Est. Travel Time:</span> <span>{Math.round((newTrip.distance || 0) / 75) || 0} hrs</span></div>
              <div className="flex justify-between"><span>Cargo Capacity:</span> <span>{newTrip.cargoWeight || 0} tons</span></div>
            </div>
          </div>

          <div className="pt-6 flex justify-between space-x-3">
            <Button variant="outline" className="w-1/2" onClick={() => setTripDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="success" className="w-1/2">Dispatch Trip</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
