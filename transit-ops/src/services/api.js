import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- VEHICLE SERVICE ---
export const vehicleService = {
  getAll: async () => {
    const res = await api.get('/vehicles');
    return res.data.map(v => ({
      id: v.id,
      registrationNumber: v.reg_number,
      name: v.name_model,
      type: v.type,
      capacity: v.max_capacity_kg,
      odometer: v.odometer,
      acquisitionCost: v.acquisition_cost,
      status: v.status,
      region: v.region || 'North', // Region isn't in backend schema, default to North
    }));
  },
  
  create: async (vehicle) => {
    const res = await api.post('/vehicles', {
      reg_number: vehicle.registrationNumber,
      name_model: vehicle.name,
      type: vehicle.type,
      max_capacity_kg: Number(vehicle.capacity || 0),
      acquisition_cost: Number(vehicle.acquisitionCost || 0),
      odometer: Number(vehicle.odometer || 0)
    });
    return res.data;
  },

  update: async (vehicle) => {
    const res = await api.put(`/vehicles/${vehicle.id}`, {
      reg_number: vehicle.registrationNumber,
      name_model: vehicle.name,
      type: vehicle.type,
      max_capacity_kg: Number(vehicle.capacity || 0),
      acquisition_cost: Number(vehicle.acquisitionCost || 0),
      odometer: Number(vehicle.odometer || 0),
      status: vehicle.status
    });
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  }
};

// --- DRIVER SERVICE ---
export const driverService = {
  getAll: async () => {
    const res = await api.get('/drivers');
    return res.data.map(d => ({
      id: d.id,
      name: d.name,
      licenseNumber: d.license_number,
      category: d.license_category || 'Class A',
      expiryDate: d.license_expiry_date || '2030-01-01',
      contact: d.contact_number || '',
      safetyScore: d.safety_score,
      status: d.status
    }));
  },

  create: async (driver) => {
    const res = await api.post('/drivers', {
      name: driver.name,
      license_number: driver.licenseNumber,
      license_category: driver.category,
      license_expiry_date: driver.expiryDate,
      contact_number: driver.contact,
    });
    return res.data;
  },

  update: async (driver) => {
    const res = await api.put(`/drivers/${driver.id}`, {
      name: driver.name,
      license_number: driver.licenseNumber,
      license_category: driver.category,
      license_expiry_date: driver.expiryDate,
      contact_number: driver.contact,
      safety_score: driver.safetyScore,
      status: driver.status
    });
    return res.data;
  }
};

// --- TRIP SERVICE ---
export const tripService = {
  getAll: async () => {
    const res = await api.get('/trips');
    return res.data.map(t => ({
      id: t.id,
      source: t.source,
      destination: t.destination,
      vehicleId: t.vehicle_id,
      driverId: t.driver_id,
      cargoWeight: t.cargo_weight_kg,
      distance: t.planned_distance_km || 0,
      status: t.status
    }));
  },

  create: async (trip) => {
    const res = await api.post('/trips', {
      source: trip.source,
      destination: trip.destination,
      vehicle_id: trip.vehicleId,
      driver_id: trip.driverId,
      cargo_weight_kg: Number(trip.cargoWeight || 0),
      planned_distance_km: Number(trip.distance || 0)
    });
    
    if (trip.status === 'Dispatched') {
      await api.post('/trips/dispatch', { trip_id: res.data.id });
    }
    
    return res.data;
  },

  updateStatus: async (id, status) => {
    if (status === 'Dispatched') return api.post('/trips/dispatch', { trip_id: id }).then(r => r.data);
    if (status === 'Completed') return api.post('/trips/complete', { trip_id: id }).then(r => r.data);
    if (status === 'Cancelled') return api.post('/trips/cancel', { trip_id: id }).then(r => r.data);
  }
};

// --- MAINTENANCE SERVICE ---
export const maintenanceService = {
  getAll: async () => {
    const res = await api.get('/maintenance');
    return res.data.map(m => ({
      id: m.id,
      vehicleId: m.vehicle_id,
      description: m.description,
      cost: m.cost,
      assignedDate: m.date,
      status: m.status
    }));
  },

  create: async (log) => {
    const res = await api.post('/maintenance', {
      vehicle_id: log.vehicleId,
      description: log.description,
      cost: Number(log.cost || 0),
      date: new Date().toISOString().split('T')[0]
    });
    return res.data;
  },

  updateStatus: async (id, status, cost) => {
    if (status === 'Closed' && cost === undefined) {
       return api.post('/maintenance/close', { log_id: id }).then(r => r.data);
    }
    const res = await api.put(`/maintenance/${id}`, {
      status,
      cost: cost !== undefined ? Number(cost) : 0
    });
    return res.data;
  }
};

// --- EXPENSES SERVICE ---
export const expenseService = {
  getAll: async () => {
    const res = await api.get('/fuel');
    return res.data.map(e => ({
      id: e.id,
      vehicleId: e.vehicle_id,
      cost: e.cost,
      date: e.date,
      description: 'Fuel'
    }));
  },

  create: async (expense) => {
    const res = await api.post('/fuel', {
      vehicle_id: expense.vehicleId,
      liters: 0,
      cost: Number(expense.cost || 0),
      date: expense.date || new Date().toISOString().split('T')[0]
    });
    return res.data;
  }
};

// --- DASHBOARD SERVICE ---
export const dashboardService = {
  getStats: async () => {
    const kpisRes = await api.get('/analytics/kpis');
    const expensesRes = await api.get('/fuel');
    
    const d = kpisRes.data;
    
    const expenses = expensesRes.data.map(e => ({
      id: e.id,
      vehicleId: e.vehicle_id,
      cost: e.cost,
      date: e.date,
      description: 'Fuel'
    }));

    return {
      activeVehicles: d.active_vehicles || 0,
      availableVehicles: d.available_vehicles || 0,
      maintenanceVehicles: d.maintenance_vehicles || 0,
      activeTrips: d.active_trips || 0,
      pendingTrips: d.pending_trips || 0,
      driversOnDuty: d.drivers_on_duty || 0,
      utilizationRate: d.fleet_utilization_pct || 0,
      expenses,
    };
  }
};

export default api;