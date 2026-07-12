import {
  initialVehicles,
  initialDrivers,
  initialTrips,
  initialMaintenance,
  initialExpenses
} from '../data/mockData';

// Helper to get from local storage or set initial
const getOrInitialize = (key, initialData) => {
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);
  localStorage.setItem(key, JSON.stringify(initialData));
  return initialData;
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// --- VEHICLE SERVICE ---
export const vehicleService = {
  getAll: async () => {
    await delay();
    return getOrInitialize('vehicles', initialVehicles);
  },
  
  create: async (vehicle) => {
    await delay();
    const list = getOrInitialize('vehicles', initialVehicles);
    const newVehicle = {
      ...vehicle,
      id: `V-${Date.now()}`,
      odometer: Number(vehicle.odometer || 0),
      capacity: Number(vehicle.capacity || 0),
      acquisitionCost: Number(vehicle.acquisitionCost || 0),
    };
    list.unshift(newVehicle);
    saveToStorage('vehicles', list);
    return newVehicle;
  },

  update: async (vehicle) => {
    await delay();
    const list = getOrInitialize('vehicles', initialVehicles);
    const index = list.findIndex((v) => v.id === vehicle.id);
    if (index > -1) {
      list[index] = {
        ...list[index],
        ...vehicle,
        odometer: Number(vehicle.odometer || 0),
        capacity: Number(vehicle.capacity || 0),
        acquisitionCost: Number(vehicle.acquisitionCost || 0),
      };
      saveToStorage('vehicles', list);
      return list[index];
    }
    throw new Error('Vehicle not found');
  },

  delete: async (id) => {
    await delay();
    const list = getOrInitialize('vehicles', initialVehicles);
    const filtered = list.filter((v) => v.id !== id);
    saveToStorage('vehicles', filtered);
    return true;
  }
};

// --- DRIVER SERVICE ---
export const driverService = {
  getAll: async () => {
    await delay();
    return getOrInitialize('drivers', initialDrivers);
  },

  create: async (driver) => {
    await delay();
    const list = getOrInitialize('drivers', initialDrivers);
    const newDriver = {
      ...driver,
      id: `D-${Date.now()}`,
      safetyScore: Number(driver.safetyScore || 90),
      status: 'Available',
    };
    list.unshift(newDriver);
    saveToStorage('drivers', list);
    return newDriver;
  },

  update: async (driver) => {
    await delay();
    const list = getOrInitialize('drivers', initialDrivers);
    const index = list.findIndex((d) => d.id === driver.id);
    if (index > -1) {
      list[index] = { ...list[index], ...driver };
      saveToStorage('drivers', list);
      return list[index];
    }
    throw new Error('Driver not found');
  }
};

// --- TRIP SERVICE ---
export const tripService = {
  getAll: async () => {
    await delay();
    return getOrInitialize('trips', initialTrips);
  },

  create: async (trip) => {
    await delay();
    const list = getOrInitialize('trips', initialTrips);
    const newTrip = {
      ...trip,
      id: `T-${Math.floor(Math.random() * 9000 + 1000)}`,
      cargoWeight: Number(trip.cargoWeight || 0),
      distance: Number(trip.distance || 0),
      date: new Date().toISOString().split('T')[0],
    };
    list.unshift(newTrip);
    saveToStorage('trips', list);
    return newTrip;
  },

  updateStatus: async (id, status) => {
    await delay();
    const list = getOrInitialize('trips', initialTrips);
    const index = list.findIndex((t) => t.id === id);
    if (index > -1) {
      list[index].status = status;
      saveToStorage('trips', list);
      return list[index];
    }
    throw new Error('Trip not found');
  }
};

// --- MAINTENANCE SERVICE ---
export const maintenanceService = {
  getAll: async () => {
    await delay();
    return getOrInitialize('maintenance', initialMaintenance);
  },

  create: async (log) => {
    await delay();
    const list = getOrInitialize('maintenance', initialMaintenance);
    const newLog = {
      ...log,
      id: `M-${Date.now()}`,
      assignedDate: new Date().toISOString().split('T')[0],
      cost: log.cost ? Number(log.cost) : undefined,
    };
    list.unshift(newLog);
    saveToStorage('maintenance', list);
    return newLog;
  },

  updateStatus: async (id, status, cost) => {
    await delay();
    const list = getOrInitialize('maintenance', initialMaintenance);
    const index = list.findIndex((m) => m.id === id);
    if (index > -1) {
      list[index].status = status;
      if (cost !== undefined) {
        list[index].cost = Number(cost);
      }
      saveToStorage('maintenance', list);
      return list[index];
    }
    throw new Error('Maintenance item not found');
  }
};

// --- EXPENSES SERVICE ---
export const expenseService = {
  getAll: async () => {
    await delay();
    return getOrInitialize('expenses', initialExpenses);
  },

  create: async (expense) => {
    await delay();
    const list = getOrInitialize('expenses', initialExpenses);
    const newExpense = {
      ...expense,
      id: `E-${Date.now()}`,
      cost: Number(expense.cost || 0),
      date: expense.date || new Date().toISOString().split('T')[0],
    };
    list.unshift(newExpense);
    saveToStorage('expenses', list);
    return newExpense;
  }
};

// --- DASHBOARD SERVICE ---
export const dashboardService = {
  getStats: async () => {
    await delay(300);
    const vehicles = getOrInitialize('vehicles', initialVehicles);
    const drivers = getOrInitialize('drivers', initialDrivers);
    const trips = getOrInitialize('trips', initialTrips);
    const expenses = getOrInitialize('expenses', initialExpenses);

    const activeVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'In Shop').length;
    
    const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
    const pendingTrips = trips.filter(t => t.status === 'Draft').length;
    
    const driversOnDuty = drivers.filter(d => d.status === 'On Trip' || d.status === 'Available').length;
    const utilizationRate = activeVehicles > 0 
      ? Math.round(((vehicles.filter(v => v.status === 'On Trip').length) / activeVehicles) * 100) 
      : 0;

    return {
      activeVehicles,
      availableVehicles,
      maintenanceVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      utilizationRate,
      expenses,
    };
  }
};
