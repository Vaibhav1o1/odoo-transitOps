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
import { dashboardService, vehicleService, driverService, tripService, maintenanceService, expenseService } from '../services/api';
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
  { month: 'Mar', cost: 348600 },
  { month: 'Apr', cost: 423300 },
  { month: 'May', cost: 398400 },
  { month: 'Jun', cost: 514600 },
  { month: 'Jul', cost: 481400 },
];

const formatINR = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

// Database values are in USD, so we convert them to INR for realistic presentation
const formatDbCost = (cost) => {
  return formatINR(Number(cost || 0) * 83);
};

const tripCompletionData = [
  { name: 'Mon', completed: 12, target: 15 },
  { name: 'Tue', completed: 14, target: 15 },
  { name: 'Wed', completed: 15, target: 15 },
  { name: 'Thu', completed: 11, target: 15 },
  { name: 'Fri', completed: 16, target: 15 },
  { name: 'Sat', completed: 8, target: 10 },
  { name: 'Sun', completed: 5, target: 8 },
];

const CITY_COORDS = {
  'Delhi': { x: 50, y: 50, label: 'Delhi (DEL)' },
  'Mumbai': { x: 60, y: 180, label: 'Mumbai (BOM)' },
  'Bengaluru': { x: 130, y: 220, label: 'Bengaluru (BLR)' },
  'Chennai': { x: 210, y: 230, label: 'Chennai (MAA)' },
  'Kolkata': { x: 270, y: 160, label: 'Kolkata (CCU)' },
  'Hyderabad': { x: 170, y: 150, label: 'Hyderabad (HYD)' },
  'Ahmedabad': { x: 40, y: 110, label: 'Ahmedabad (AMD)' },
  'Pune': { x: 100, y: 140, label: 'Pune (PNQ)' },
  'Samastipur': { x: 220, y: 70, label: 'Samastipur (SPJ)' }
};

const getCoords = (cityName, defaultCity = 'Delhi') => {
  if (!cityName) return CITY_COORDS[defaultCity];
  const name = cityName.toLowerCase();
  for (const key of Object.keys(CITY_COORDS)) {
    if (name.includes(key.toLowerCase()) || key.toLowerCase().includes(name)) {
      return CITY_COORDS[key];
    }
  }
  // Fallbacks for seed data
  if (name.includes('warehouse a')) return CITY_COORDS['Delhi'];
  if (name.includes('distribution center b')) return CITY_COORDS['Mumbai'];
  if (name.includes('port terminal 4')) return CITY_COORDS['Chennai'];
  if (name.includes('factory gate 1')) return CITY_COORDS['Hyderabad'];
  
  // Hash fallback
  const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const keys = Object.keys(CITY_COORDS);
  return CITY_COORDS[keys[sum % keys.length]];
};

const HIGHWAY_SEGMENTS_DETAILED = {
  'Delhi-Ahmedabad': [
    { x: 50, y: 50 },
    { x: 42, y: 70 },
    { x: 52, y: 90 },
    { x: 40, y: 110 }
  ],
  'Ahmedabad-Mumbai': [
    { x: 40, y: 110 },
    { x: 55, y: 130 },
    { x: 45, y: 155 },
    { x: 60, y: 180 }
  ],
  'Mumbai-Pune': [
    { x: 60, y: 180 },
    { x: 75, y: 165 },
    { x: 88, y: 155 },
    { x: 100, y: 140 }
  ],
  'Pune-Hyderabad': [
    { x: 100, y: 140 },
    { x: 120, y: 160 },
    { x: 145, y: 135 },
    { x: 170, y: 150 }
  ],
  'Hyderabad-Bengaluru': [
    { x: 170, y: 150 },
    { x: 140, y: 175 },
    { x: 160, y: 200 },
    { x: 130, y: 220 }
  ],
  'Bengaluru-Chennai': [
    { x: 130, y: 220 },
    { x: 160, y: 210 },
    { x: 185, y: 235 },
    { x: 210, y: 230 }
  ],
  'Chennai-Kolkata': [
    { x: 210, y: 230 },
    { x: 250, y: 210 },
    { x: 230, y: 180 },
    { x: 270, y: 160 }
  ],
  'Kolkata-Samastipur': [
    { x: 270, y: 160 },
    { x: 240, y: 140 },
    { x: 255, y: 105 },
    { x: 220, y: 70 }
  ],
  'Samastipur-Delhi': [
    { x: 220, y: 70 },
    { x: 180, y: 80 },
    { x: 110, y: 60 },
    { x: 50, y: 50 }
  ],
  'Hyderabad-Samastipur': [
    { x: 170, y: 150 },
    { x: 195, y: 120 },
    { x: 210, y: 95 },
    { x: 220, y: 70 }
  ]
};

const getSegmentPoints = (src, dest) => {
  const key1 = `${src}-${dest}`;
  const key2 = `${dest}-${src}`;
  if (HIGHWAY_SEGMENTS_DETAILED[key1]) {
    return HIGHWAY_SEGMENTS_DETAILED[key1];
  } else if (HIGHWAY_SEGMENTS_DETAILED[key2]) {
    return [...HIGHWAY_SEGMENTS_DETAILED[key2]].reverse();
  }
  // fallback if cities are not defined in corridors map
  const p1 = CITY_COORDS[src] || CITY_COORDS['Delhi'];
  const p2 = CITY_COORDS[dest] || CITY_COORDS['Delhi'];
  return [p1, p1, p2, p2];
};

const getCubicBezierPoint = (p0, p1, p2, p3, t) => {
  const mt = 1 - t;
  const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
  const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
  return { x, y };
};

const getProgress = (vehicleId) => {
  const hash = vehicleId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const durationMs = 40000; // 40 seconds cycle
  const now = Date.now();
  const progress = ((now + hash * 1000) % durationMs) / durationMs;
  return progress;
};

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

  // Live Map Tracker State
  const [allVehicles, setAllVehicles] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [mapTab, setMapTab] = useState('map'); // 'map' or 'chart'
  const [selectedMapVehicle, setSelectedMapVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [simTime, setSimTime] = useState(Date.now());
  const [yearwiseExpenses, setYearwiseExpenses] = useState({});
  const [expandedYear, setExpandedYear] = useState(null);

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

  // Map simulation timer
  useEffect(() => {
    if (mapTab !== 'map') return;
    const interval = setInterval(() => {
      setSimTime(Date.now());
    }, 2000);
    return () => clearInterval(interval);
  }, [mapTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await dashboardService.getStats();
      setStats(statsRes);

      const tripsRes = await tripService.getAll();
      setRecentTrips(tripsRes.slice(0, 3));
      setAllTrips(tripsRes);

      const maintRes = await maintenanceService.getAll();
      setRecentMaintenance(maintRes.slice(0, 3));

      const expRes = await expenseService.getAll();
      setRecentExpenses(expRes.slice(0, 3));

      // Calculate yearwise expenses
      const grouped = {};
      const combinedExpenses = [
        ...expRes.map(e => ({
          id: e.id,
          type: 'Fuel',
          description: e.description || `Fuel logged for Vehicle ${e.vehicleId}`,
          cost: e.cost,
          date: e.date,
          vehicleId: e.vehicleId
        })),
        ...maintRes.map(m => ({
          id: m.id,
          type: 'Maintenance',
          description: m.description || `Repair: Vehicle ${m.vehicleId}`,
          cost: m.cost,
          date: m.assignedDate || m.date,
          vehicleId: m.vehicleId
        }))
      ];

      combinedExpenses.forEach(item => {
        const year = item.date ? new Date(item.date).getFullYear() : 2026;
        if (!grouped[year]) {
          grouped[year] = {
            total: 0,
            items: []
          };
        }
        grouped[year].items.push(item);
        grouped[year].total += Number(item.cost || 0);
      });

      Object.keys(grouped).forEach(year => {
        grouped[year].items.sort((a, b) => new Date(b.date) - new Date(a.date));
      });

      setYearwiseExpenses(grouped);
      const years = Object.keys(grouped).sort((a, b) => b - a);
      if (years.length > 0) {
        setExpandedYear(Number(years[0]));
      }

      // Get vehicles & drivers for dropdown selections
      const vList = await vehicleService.getAll();
      setAllVehicles(vList);
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
        cost: Number(newFuel.cost) / 83,
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

      addNotification('Fuel Logged', `Logged fuel expense of ₹${Number(newFuel.cost).toLocaleString('en-IN')} for vehicle.`, 'success');
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

  // Live Map calculations
  const baseMocks = [
    { id: 'v1', registrationNumber: 'DL-01-GB-4202', name: 'Tata Prima', type: 'Semi-Truck', status: 'On Trip' },
    { id: 'v2', registrationNumber: 'MH-12-PQ-8819', name: 'Mahindra Blazo', type: 'Heavy Duty Truck', status: 'On Trip' },
    { id: 'v3', registrationNumber: 'KA-03-HA-3312', name: 'Ashok Leyland Ecomet', type: 'Box Truck', status: 'Available' },
    { id: 'v4', registrationNumber: 'TS-09-XY-9092', name: 'BharatBenz 2823C', type: 'Dump Truck', status: 'In Shop' },
    { id: 'v5', registrationNumber: 'WB-02-TR-4567', name: 'Tata LPT 1613', type: 'Box Truck', status: 'Available' },
    { id: 'v6', registrationNumber: 'DL-02-CD-7890', name: 'Eicher Pro 2049', type: 'Cargo Van', status: 'In Shop' },
    { id: 'v7', registrationNumber: 'HR-55-XY-1234', name: 'Tata Ultra', type: 'Box Truck', status: 'On Trip' },
    { id: 'v8', registrationNumber: 'UP-16-AT-9988', name: 'Mahindra Furio', type: 'Cargo Van', status: 'On Trip' },
    { id: 'v9', registrationNumber: 'KA-51-MB-5678', name: 'Ashok Leyland Partner', type: 'Cargo Van', status: 'Available' },
    { id: 'v10', registrationNumber: 'GJ-01-ZZ-1122', name: 'BharatBenz 1917R', type: 'Heavy Duty Truck', status: 'Available' },
  ];

  // Merge database vehicles with mocks to ensure at least 10 exist
  const combinedVehicles = [...allVehicles];
  baseMocks.forEach(mock => {
    if (!combinedVehicles.some(v => v.registrationNumber === mock.registrationNumber)) {
      combinedVehicles.push(mock);
    }
  });

  const mapVehicles = combinedVehicles.map(v => {
    const activeTrip = allTrips.find(t => t.vehicleId === v.id && t.status === 'Dispatched');
    let route = activeTrip ? `${activeTrip.source} ➔ ${activeTrip.destination}` : null;
    let driverName = 'No Driver Assigned';
    if (activeTrip) {
      const drv = driversList.find(d => d.id === activeTrip.driverId);
      driverName = drv ? drv.name : 'Amit Sharma';
    } else if (v.status === 'On Trip') {
      if (v.id === 'v1') { route = 'Delhi ➔ Mumbai'; driverName = 'Amit Sharma'; }
      else if (v.id === 'v2') { route = 'Mumbai ➔ Bengaluru'; driverName = 'Rajesh Patil'; }
      else if (v.id === 'v7') { route = 'Delhi ➔ Samastipur'; driverName = 'Sanjay Gupta'; }
      else if (v.id === 'v8') { route = 'Samastipur ➔ Kolkata'; driverName = 'Karthik Raja'; }
      else { route = 'Delhi ➔ Mumbai'; driverName = 'Amit Sharma'; }
    }
    return {
      ...v,
      route,
      driverName,
      hub: v.hub || (v.status === 'Available' ? `${v.region || 'North'} Terminal` : null),
      facility: v.facility || (v.status === 'In Shop' ? 'Fleet Maintenance Yard' : null)
    };
  });

  const renderedVehicles = mapVehicles.map(vehicle => {
    let x = 0, y = 0;
    let progress = 0;
    if (vehicle.status === 'On Trip' && vehicle.route) {
      const parts = vehicle.route.split('➔');
      const src = parts[0]?.trim();
      const dest = parts[1]?.trim();
      progress = getProgress(vehicle.id);
      
      const timeFactor = simTime / 500;
      const wiggleX = Math.sin(timeFactor + vehicle.registrationNumber.charCodeAt(0)) * 0.5;
      const wiggleY = Math.cos(timeFactor + vehicle.registrationNumber.charCodeAt(1 || 0)) * 0.5;
      
      const pts = getSegmentPoints(src, dest);
      const bPt = getCubicBezierPoint(pts[0], pts[1], pts[2], pts[3], progress);
      x = bPt.x + wiggleX;
      y = bPt.y + wiggleY;
    } else if (vehicle.status === 'In Shop') {
      const repairCities = ['Pune', 'Ahmedabad', 'Hyderabad'];
      const hashIdx = vehicle.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % repairCities.length;
      const pt = CITY_COORDS[repairCities[hashIdx]];
      x = pt.x - 5 + (hashIdx * 3);
      y = pt.y + 7 - (hashIdx * 2);
    } else {
      const hubCities = ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata'];
      const hashIdx = vehicle.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % hubCities.length;
      const pt = CITY_COORDS[hubCities[hashIdx]];
      x = pt.x + 5 - (hashIdx * 2);
      y = pt.y - 7 + (hashIdx * 3);
    }
    return { ...vehicle, x, y, progress };
  });

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
          <div className="flex flex-col mb-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Fleet Utilization Trend (% of Active Fleet)</h3>
              <Badge variant="info">Monthly Overview</Badge>
            </div>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">
              Percentage of total vehicles actively dispatched on trips vs. idle or in-shop.
            </p>
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
                <YAxis stroke="#94A3B8" tickFormatter={(val) => `${val}%`} />
                <Tooltip formatter={(value) => [`${value}% Utilization`, 'Active Rate']} />
                <Area type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Fuel Costs Bar Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-855 dark:text-slate-200">Monthly Fuel Costs (₹)</h3>
            <Badge variant="warning">Fleet Expenses</Badge>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelCostData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" tickFormatter={(val) => '₹' + (val / 1000) + 'k'} />
                <Tooltip formatter={(value) => [formatINR(value), 'Cost']} />
                <Bar dataKey="cost" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Vehicle Tracking & Status Card */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Vehicle Tracking & Status</h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">Real-time coordinates & operational status</p>
            </div>
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setMapTab('map')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  mapTab === 'map' ? 'bg-white dark:bg-slate-800 text-blue-650 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                }`}
              >
                Live Map
              </button>
              <button
                type="button"
                onClick={() => setMapTab('chart')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  mapTab === 'chart' ? 'bg-white dark:bg-slate-800 text-blue-650 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                }`}
              >
                Distribution
              </button>
            </div>
          </div>

          {mapTab === 'map' ? (
            <div className="relative w-full h-64">
              {/* Search Box Overlay */}
              <div className="absolute top-2 left-2 z-10 w-40 bg-slate-900/90 backdrop-blur-md p-1 rounded-md border border-slate-800 shadow-md">
                <input
                  type="text"
                  placeholder="Search vehicle reg..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    const found = renderedVehicles.find(v => v.registrationNumber.toLowerCase().includes(e.target.value.toLowerCase()));
                    if (found && e.target.value) {
                      setSelectedMapVehicle(found);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Map SVG Canvas */}
              <svg viewBox="0 0 320 256" className="w-full h-full bg-[#f4f3f0] rounded-xl border border-slate-200 dark:border-slate-200 relative overflow-hidden select-none shadow-inner">
                <style>{`
                  @keyframes dash {
                    to {
                      stroke-dashoffset: -20;
                    }
                  }
                  .route-path-bg {
                    stroke: #e0a000;
                    stroke-width: 3.8;
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    opacity: 0.85;
                  }
                  .route-path-core {
                    stroke: #ffe082;
                    stroke-width: 1.8;
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                  }
                  .route-active-line {
                    stroke: #4285f4;
                    stroke-width: 2.2;
                    stroke-dasharray: 4, 4;
                    animation: dash 6s linear infinite;
                    fill: none;
                    opacity: 0.95;
                  }
                  .city-dot {
                    fill: #1e293b;
                    stroke: #ffffff;
                    stroke-width: 1.5;
                  }
                  .city-label {
                    font-size: 6px;
                    font-weight: 850;
                    fill: #0f172a;
                    paint-order: stroke;
                    stroke: #ffffff;
                    stroke-width: 2px;
                    stroke-linejoin: round;
                  }
                  .pulse-ring {
                    animation: map-pulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                  }
                  @keyframes map-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.75; }
                    50% { transform: scale(1.6); opacity: 0; }
                  }
                `}</style>

                {/* Highlighted Winding River (Google Maps Styled Water) */}
                <path d="M -10 100 Q 80 80 120 140 T 250 180 T 330 260" fill="none" stroke="#bae6fd" strokeWidth="12" strokeLinecap="round" opacity="0.65" />
                <path d="M -10 100 Q 80 80 120 140 T 250 180 T 330 260" fill="none" stroke="#c4dcfc" strokeWidth="6" strokeLinecap="round" opacity="0.95" />

                {/* Background Minor Roads (Touch of Google Maps) */}
                {[
                  { p1: { x: 10, y: 30 }, p2: { x: 300, y: 40 }, ctrl: { x: 150, y: 80 } },
                  { p1: { x: 20, y: 150 }, p2: { x: 280, y: 220 }, ctrl: { x: 150, y: 120 } },
                  { p1: { x: 110, y: 10 }, p2: { x: 120, y: 250 }, ctrl: { x: 80, y: 120 } },
                  { p1: { x: 250, y: 20 }, p2: { x: 240, y: 240 }, ctrl: { x: 290, y: 130 } }
                ].map((road, idx) => (
                  <g key={`minor-${idx}`} opacity="0.75">
                    <path d={`M ${road.p1.x} ${road.p1.y} Q ${road.ctrl.x} ${road.ctrl.y} ${road.p2.x} ${road.p2.y}`} stroke="#e4e4e4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d={`M ${road.p1.x} ${road.p1.y} Q ${road.ctrl.x} ${road.ctrl.y} ${road.p2.x} ${road.p2.y}`} stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="round" />
                  </g>
                ))}

                {/* Shipping Corridors - Roadways Casing (Curved Highways) */}
                {Object.entries(HIGHWAY_SEGMENTS_DETAILED).map(([key, pts], idx) => {
                  return (
                    <path key={`hbg-${idx}`} d={`M ${pts[0].x} ${pts[0].y} C ${pts[1].x} ${pts[1].y}, ${pts[2].x} ${pts[2].y}, ${pts[3].x} ${pts[3].y}`} className="route-path-bg" />
                  );
                })}

                {/* Shipping Corridors - Roadways Core (Curved Highways) */}
                {Object.entries(HIGHWAY_SEGMENTS_DETAILED).map(([key, pts], idx) => {
                  return (
                    <path key={`hcore-${idx}`} d={`M ${pts[0].x} ${pts[0].y} C ${pts[1].x} ${pts[1].y}, ${pts[2].x} ${pts[2].y}, ${pts[3].x} ${pts[3].y}`} className="route-path-core" />
                  );
                })}

                {/* Active Dispatches Paths */}
                {renderedVehicles.filter(v => v.status === 'On Trip' && v.route).map(vehicle => {
                  const parts = vehicle.route.split('➔');
                  const src = parts[0]?.trim();
                  const dest = parts[1]?.trim();
                  const pts = getSegmentPoints(src, dest);
                  return (
                    <g key={`line-${vehicle.id}`}>
                      <path d={`M ${pts[0].x} ${pts[0].y} C ${pts[1].x} ${pts[1].y}, ${pts[2].x} ${pts[2].y}, ${pts[3].x} ${pts[3].y}`} stroke="#174ea6" strokeWidth="4.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                      <path d={`M ${pts[0].x} ${pts[0].y} C ${pts[1].x} ${pts[1].y}, ${pts[2].x} ${pts[2].y}, ${pts[3].x} ${pts[3].y}`} className="route-active-line" />
                    </g>
                  );
                })}

                {/* City Nodes */}
                {Object.entries(CITY_COORDS).map(([name, pt]) => (
                  <g key={name}>
                    <circle cx={pt.x} cy={pt.y} r="3.5" className="city-dot" />
                    <text x={pt.x + 5} y={pt.y + 1.5} className="city-label">{name}</text>
                  </g>
                ))}

                {/* Vehicle Markers (Enlarged) */}
                {renderedVehicles
                  .filter(v => !searchQuery || v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(v => {
                    const isSelected = selectedMapVehicle?.id === v.id;
                    const markerColor = v.status === 'On Trip' ? '#2563eb' : v.status === 'In Shop' ? '#ef4444' : '#22c55e';
                    return (
                      <g
                        key={v.id}
                        onClick={() => setSelectedMapVehicle(v)}
                        className="cursor-pointer"
                        transform={`translate(${v.x}, ${v.y})`}
                      >
                        {v.status === 'On Trip' && (
                          <circle r="8" fill={markerColor} className="pulse-ring" style={{ transformOrigin: '0px 0px' }} />
                        )}
                        {isSelected && (
                          <circle r="11" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                        )}
                        <circle r="5" fill={markerColor} stroke="#ffffff" strokeWidth="1.2" />
                      </g>
                    );
                  })}
              </svg>

              {/* Float Map Overlay Tooltip */}
              {selectedMapVehicle && (
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-2 rounded-lg text-[9px] space-y-1 text-slate-100 shadow-xl z-20">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-50">{selectedMapVehicle.registrationNumber}</span>
                      <span className="text-[7.5px] bg-slate-800 text-slate-400 px-1 rounded uppercase tracking-wider">{selectedMapVehicle.type}</span>
                    </div>
                    <button onClick={() => setSelectedMapVehicle(null)} className="text-slate-500 hover:text-slate-350 font-bold">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5 text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[7px] block uppercase font-extrabold">Status</span>
                      <span className={`font-bold capitalize flex items-center space-x-1 ${
                        selectedMapVehicle.status === 'On Trip' ? 'text-blue-400' :
                        selectedMapVehicle.status === 'In Shop' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          selectedMapVehicle.status === 'On Trip' ? 'bg-blue-400' :
                          selectedMapVehicle.status === 'In Shop' ? 'bg-red-400' : 'bg-green-400'
                        }`} />
                        <span>{selectedMapVehicle.status}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[7px] block uppercase font-extrabold">Driver</span>
                      <span className="font-semibold text-slate-200">{selectedMapVehicle.driverName}</span>
                    </div>
                    
                    {selectedMapVehicle.status === 'On Trip' ? (
                      <>
                        <div className="col-span-2">
                          <span className="text-slate-500 text-[7px] block uppercase font-extrabold">Transit Route</span>
                          <span className="font-bold text-blue-400">{selectedMapVehicle.route}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[7px] block uppercase font-extrabold">Odo Speed / Progress</span>
                          <span className="font-semibold text-slate-200">
                            {Math.round(60 + (selectedMapVehicle.id.charCodeAt(0) % 20))} km/h • {Math.round((selectedMapVehicle.progress || 0) * 100)}%
                          </span>
                        </div>
                      </>
                    ) : selectedMapVehicle.status === 'In Shop' ? (
                      <div className="col-span-2">
                        <span className="text-slate-500 text-[7px] block uppercase font-extrabold">Facility Center</span>
                        <span className="font-semibold text-red-300">{selectedMapVehicle.facility}</span>
                      </div>
                    ) : (
                      <div className="col-span-2">
                        <span className="text-slate-500 text-[7px] block uppercase font-extrabold">Parked Hub</span>
                        <span className="font-semibold text-green-300">{selectedMapVehicle.hub}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
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
          )}
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

        {/* Financial Logs Card with Yearwise Collapsible Accordion */}
        <Card className="xl:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Financial Logs</h3>
            <button onClick={() => navigate('/expenses')} className="text-xs font-semibold text-blue-600 dark:text-blue-450 hover:underline flex items-center">
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} variant="line" />)
            ) : Object.keys(yearwiseExpenses).length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">No financial logs recorded</div>
            ) : (
              Object.keys(yearwiseExpenses)
                .sort((a, b) => b - a)
                .map((yearStr) => {
                  const year = Number(yearStr);
                  const data = yearwiseExpenses[year];
                  const isExpanded = expandedYear === year;
                  return (
                    <div key={year} className="border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden shadow-xs">
                      {/* Accordion Trigger Header */}
                      <button
                        type="button"
                        onClick={() => setExpandedYear(isExpanded ? null : year)}
                        className="w-full flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                      >
                        <span className="font-extrabold text-slate-900 dark:text-slate-55">{year} Operations</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-blue-650 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full text-[10px]">
                            {formatDbCost(data.total)}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        </div>
                      </button>

                      {/* Accordion Detail Body */}
                      {isExpanded && (
                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 max-h-48 overflow-y-auto space-y-2.5 scrollbar-thin">
                          {data.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start text-[10px] border-b border-slate-50 dark:border-slate-850/50 pb-2.5 last:border-0 last:pb-0">
                              <div className="space-y-0.5 pr-2 max-w-[70%]">
                                <div className="font-bold text-slate-850 dark:text-slate-100 truncate" title={item.description}>
                                  {item.description}
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  <Badge variant={item.type === 'Fuel' ? 'info' : 'warning'} className="text-[7.5px] px-1 py-0 leading-none">
                                    {item.type}
                                  </Badge>
                                  <span className="text-[9px] text-slate-450 font-medium">Vehicle {item.vehicleId.slice(0, 8)}...</span>
                                </div>
                              </div>
                              <div className="text-right space-y-0.5 shrink-0">
                                <div className="font-bold text-slate-950 dark:text-slate-50">
                                  {formatDbCost(item.cost)}
                                </div>
                                <div className="text-[8px] text-slate-400">{item.date}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
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
          <Input label="Cost of Fuel (₹)" type="number" step="1" required placeholder="8000" value={newFuel.cost} onChange={e => setNewFuel({...newFuel, cost: e.target.value})} />
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
