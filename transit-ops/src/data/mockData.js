import { VEHICLE_STATUS, TRIP_STATUS, MAINTENANCE_STATUS, MAINTENANCE_PRIORITY, EXPENSE_TYPE } from '../constants';

export const initialVehicles = [
  { id: 'V-1', registrationNumber: 'TX-4829', name: 'Freightliner Cascadia', type: 'Semi-Truck', capacity: 20, odometer: 145000, acquisitionCost: 120000, status: VEHICLE_STATUS.ON_TRIP, region: 'North' },
  { id: 'V-2', registrationNumber: 'CA-8891', name: 'Ford Transit 250', type: 'Cargo Van', capacity: 3.5, odometer: 42000, acquisitionCost: 45000, status: VEHICLE_STATUS.AVAILABLE, region: 'West' },
  { id: 'V-3', registrationNumber: 'NY-7254', name: 'Volvo FH16', type: 'Heavy Duty Truck', capacity: 25, odometer: 189300, acquisitionCost: 155000, status: VEHICLE_STATUS.IN_SHOP, region: 'East' },
  { id: 'V-4', registrationNumber: 'FL-3012', name: 'Mercedes-Benz Sprinter', type: 'Cargo Van', capacity: 4.0, odometer: 68100, acquisitionCost: 48000, status: VEHICLE_STATUS.AVAILABLE, region: 'South' },
  { id: 'V-5', registrationNumber: 'IL-5928', name: 'Kenworth T680', type: 'Semi-Truck', capacity: 22, odometer: 215400, acquisitionCost: 130000, status: VEHICLE_STATUS.ON_TRIP, region: 'North' },
  { id: 'V-6', registrationNumber: 'TX-9104', name: 'Isuzu NPR-HD', type: 'Box Truck', capacity: 8.0, odometer: 95000, acquisitionCost: 65000, status: VEHICLE_STATUS.IN_SHOP, region: 'South' },
  { id: 'V-7', registrationNumber: 'NV-2083', name: 'Ram ProMaster 3500', type: 'Cargo Van', capacity: 3.8, odometer: 31000, acquisitionCost: 43000, status: VEHICLE_STATUS.AVAILABLE, region: 'West' },
  { id: 'V-8', registrationNumber: 'OH-4421', name: 'Peterbilt 579', type: 'Semi-Truck', capacity: 24, odometer: 320000, acquisitionCost: 140000, status: VEHICLE_STATUS.RETIRED, region: 'East' },
];

export const initialDrivers = [
  { id: 'D-1', name: 'John Doe', licenseNumber: 'DL-893021', category: 'Class A', expiryDate: '2028-04-15', phone: '+1 (555) 019-2831', safetyScore: 94, status: 'On Trip' },
  { id: 'D-2', name: 'Sarah Connor', licenseNumber: 'DL-448201', category: 'Class A', expiryDate: '2026-08-22', phone: '+1 (555) 014-9842', safetyScore: 89, status: 'Available' },
  { id: 'D-3', name: 'Michael Scott', licenseNumber: 'DL-119302', category: 'Class B', expiryDate: '2027-11-05', phone: '+1 (555) 012-4091', safetyScore: 68, status: 'Off Duty' },
  { id: 'D-4', name: 'David Miller', licenseNumber: 'DL-720194', category: 'Class A', expiryDate: '2029-01-30', phone: '+1 (555) 016-7281', safetyScore: 97, status: 'Available' },
  { id: 'D-5', name: 'Carlos Santana', licenseNumber: 'DL-392019', category: 'Class C', expiryDate: '2026-07-28', phone: '+1 (555) 018-3829', safetyScore: 82, status: 'On Trip' },
  { id: 'D-6', name: 'Emily Watson', licenseNumber: 'DL-552093', category: 'Class A', expiryDate: '2028-10-12', phone: '+1 (555) 011-3820', safetyScore: 91, status: 'Available' },
];

export const initialTrips = [
  { id: 'T-1001', source: 'Houston, TX', destination: 'Chicago, IL', vehicleId: 'V-1', driverId: 'D-1', cargoWeight: 18.5, distance: 1750, status: TRIP_STATUS.DISPATCHED, date: '2026-07-11' },
  { id: 'T-1002', source: 'Los Angeles, CA', destination: 'Seattle, WA', vehicleId: 'V-2', driverId: 'D-5', cargoWeight: 2.8, distance: 1830, status: TRIP_STATUS.COMPLETED, date: '2026-07-09' },
  { id: 'T-1003', source: 'New York, NY', destination: 'Boston, MA', vehicleId: 'V-3', driverId: 'D-2', cargoWeight: 12.0, distance: 350, status: TRIP_STATUS.CANCELLED, date: '2026-07-10' },
  { id: 'T-1004', source: 'Atlanta, GA', destination: 'Miami, FL', vehicleId: 'V-5', driverId: 'D-5', cargoWeight: 21.0, distance: 1060, status: TRIP_STATUS.DISPATCHED, date: '2026-07-12' },
  { id: 'T-1005', source: 'Dallas, TX', destination: 'Denver, CO', vehicleId: 'V-4', driverId: 'D-4', cargoWeight: 3.5, distance: 1280, status: TRIP_STATUS.DRAFT, date: '2026-07-13' },
  { id: 'T-1006', source: 'Seattle, WA', destination: 'San Francisco, CA', vehicleId: 'V-7', driverId: 'D-6', cargoWeight: 3.0, distance: 1300, status: TRIP_STATUS.COMPLETED, date: '2026-07-08' },
];

export const initialMaintenance = [
  { id: 'M-501', vehicleId: 'V-3', issue: 'Engine coolant leak & radiator repair', priority: MAINTENANCE_PRIORITY.HIGH, status: MAINTENANCE_STATUS.IN_PROGRESS, assignedDate: '2026-07-10' },
  { id: 'M-502', vehicleId: 'V-6', issue: 'Brake pad replacement and rotor resurfacing', priority: MAINTENANCE_PRIORITY.MEDIUM, status: MAINTENANCE_STATUS.OPEN, assignedDate: '2026-07-12' },
  { id: 'M-503', vehicleId: 'V-2', issue: 'Scheduled oil change & tire rotation', priority: MAINTENANCE_PRIORITY.LOW, status: MAINTENANCE_STATUS.CLOSED, assignedDate: '2026-07-05', cost: 180 },
  { id: 'M-504', vehicleId: 'V-1', issue: 'Transmission fluid pressure issue', priority: MAINTENANCE_PRIORITY.CRITICAL, status: MAINTENANCE_STATUS.OPEN, assignedDate: '2026-07-12' },
  { id: 'M-505', vehicleId: 'V-5', issue: 'Windshield crack replacement', priority: MAINTENANCE_PRIORITY.LOW, status: MAINTENANCE_STATUS.CLOSED, assignedDate: '2026-07-02', cost: 450 },
];

export const initialExpenses = [
  { id: 'E-201', vehicleId: 'V-1', expenseType: EXPENSE_TYPE.FUEL, cost: 650.00, date: '2026-07-10', description: 'Diesel refuel - Pilot Station' },
  { id: 'E-202', vehicleId: 'V-3', expenseType: EXPENSE_TYPE.MAINTENANCE, cost: 1250.00, date: '2026-07-08', description: 'Engine diagnostics & sensor replacements' },
  { id: 'E-203', vehicleId: 'V-2', expenseType: EXPENSE_TYPE.TOLL, cost: 45.50, date: '2026-07-11', description: 'I-80 Turnpike toll charges' },
  { id: 'E-204', vehicleId: 'V-4', expenseType: EXPENSE_TYPE.FUEL, cost: 85.00, date: '2026-07-12', description: 'Unleaded fuel - Shell' },
  { id: 'E-205', vehicleId: 'V-5', expenseType: EXPENSE_TYPE.FUEL, cost: 720.00, date: '2026-07-09', description: 'Diesel refuel - Loves Station' },
  { id: 'E-206', vehicleId: 'V-2', expenseType: EXPENSE_TYPE.MAINTENANCE, cost: 180.00, date: '2026-07-05', description: 'Oil change and filters' },
  { id: 'E-207', vehicleId: 'V-7', expenseType: EXPENSE_TYPE.TOLL, cost: 32.00, date: '2026-07-07', description: 'Express lane tolls' },
  { id: 'E-208', vehicleId: 'V-6', expenseType: EXPENSE_TYPE.OTHER, cost: 150.00, date: '2026-07-06', description: 'Vehicle detailing & sanitization' },
];

export const initialNotifications = [
  { id: 'N-1', title: 'Vehicle maintenance updated', message: 'Freightliner Cascadia (TX-4829) is now set to On Trip.', time: '10 mins ago', type: 'info', read: false },
  { id: 'N-2', title: 'Trip T-1002 Completed', message: 'Driver Carlos Santana successfully delivered cargo weight of 2.8t to Seattle.', time: '2 hours ago', type: 'success', read: false },
  { id: 'N-3', title: 'Fuel Logged', message: 'Mercedes-Benz Sprinter (FL-3012) fuel cost of ₹7,055 logged successfully.', time: '5 hours ago', type: 'info', read: true },
  { id: 'N-4', title: 'Expense Approved', message: '₹1,03,750 maintenance invoice for Volvo FH16 has been approved.', time: '1 day ago', type: 'success', read: true },
  { id: 'N-5', title: 'Driver License Expiring', message: 'Carlos Santana (Class C) license expires on 2026-07-28 (16 days).', time: '2 days ago', type: 'warning', read: false },
];
