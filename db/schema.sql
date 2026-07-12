-- Enable foreign key support in SQLite
PRAGMA foreign_keys = ON;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- UUID
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'))
);

-- 2. Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY, -- UUID
    reg_number TEXT UNIQUE NOT NULL,
    name_model TEXT NOT NULL,
    type TEXT NOT NULL,
    max_capacity_kg REAL NOT NULL,
    odometer REAL NOT NULL DEFAULT 0,
    acquisition_cost REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Available' CHECK(status IN ('Available', 'On Trip', 'In Shop', 'Retired'))
);

-- 3. Drivers
CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY, -- UUID
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    license_number TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Trips
CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY, -- UUID
    vehicle_id TEXT NOT NULL,
    driver_id TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    cargo_weight_kg REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- 5. Maintenance Logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id TEXT PRIMARY KEY, -- UUID
    vehicle_id TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open', 'Closed')),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- 6. Fuel & Expenses
CREATE TABLE IF NOT EXISTS fuel_expenses (
    id TEXT PRIMARY KEY, -- UUID
    vehicle_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Fuel', 'Toll', 'Maintenance')),
    amount_cost REAL NOT NULL,
    liters REAL, -- Nullable
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);