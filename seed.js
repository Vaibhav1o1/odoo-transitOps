const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./transitops.db');

console.log("🌱 Starting database seeding for TransitOps...");

db.serialize(() => {
    // 1. FORCE BUILD THE SCHEMA FIRST (So tables always exist!)
    console.log("Checking and initializing database tables...");
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error("❌ Schema initialization failed inside seed script:", err.message);
            return;
        }
    });

    // 2. Clean existing tables
    console.log("Cleaning old telemetry data...");
    db.run("DELETE FROM fuel_logs");
    db.run("DELETE FROM maintenance_logs");
    db.run("DELETE FROM trips");
    db.run("DELETE FROM drivers");
    db.run("DELETE FROM vehicles");
    db.run("DELETE FROM users");

    db.run("BEGIN TRANSACTION;");

    // ==========================================
    // 3. SEED USERS & VEHICLES
    // ==========================================
    console.log("Inserting fleet assets and users...");
    
    // Create Users
    const saltRounds = 10;
    const defaultPassword = bcrypt.hashSync("admin123", saltRounds);

    const adminId = uuidv4();
    db.run("INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)", [adminId, "admintransitops@gmail.com", "Alex Mercer", defaultPassword, "Fleet Manager"]);

    const driverId = uuidv4();
    db.run("INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)", [driverId, "driver@transitops.com", "Elena Rostova", defaultPassword, "Driver"]);

    const vStmt = db.prepare(`
        INSERT INTO vehicles (id, reg_number, name_model, type, max_capacity_kg, odometer, acquisition_cost, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const vIds = {
        van1: uuidv4(), van2: uuidv4(), trk1: uuidv4(), trk2: uuidv4(), 
        van3: uuidv4(), trk3: uuidv4(), van4: uuidv4(), trk4: uuidv4()
    };

    const vehicles = [
        [vIds.van1, "VAN-01", "Ford Transit 350", "Van", 1200, 45200, 42000, "Available"],
        [vIds.van2, "VAN-02", "Mercedes Sprinter", "Van", 1500, 28400, 55000, "On Trip"],
        [vIds.trk1, "TRK-01", "Volvo FH16 Heavy", "Truck", 18000, 112000, 135000, "Available"],
        [vIds.trk2, "TRK-02", "Freightliner Cascadia", "Truck", 20000, 89000, 140000, "On Trip"],
        [vIds.van3, "VAN-03", "Ram ProMaster", "Van", 1100, 61000, 38000, "In Shop"],
        [vIds.trk3, "TRK-03", "Kenworth T680", "Truck", 17500, 145000, 130000, "Available"],
        [vIds.van4, "VAN-04", "Ford Transit Connect", "Van", 600, 19000, 31000, "Retired"],
        [vIds.trk4, "TRK-04", "Peterbilt 579", "Truck", 22000, 210000, 150000, "In Shop"]
    ];

    vehicles.forEach(v => vStmt.run(v));
    vStmt.finalize();

    // ==========================================
    // 4. SEED DRIVERS
    // ==========================================
    console.log("Registering fleet drivers...");
    const dStmt = db.prepare(`
        INSERT INTO drivers (id, user_id, name, license_number, license_category, license_expiry_date, contact_number, safety_score, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const dIds = {
        alex: uuidv4(), elena: uuidv4(), marcus: uuidv4(), sarah: uuidv4(), david: uuidv4()
    };

    const drivers = [
        [dIds.alex, adminId, "Alex Mercer", "DL-90812", "Class A (Heavy)", "2028-10-15", "+1-555-0101", 98.5, "Available"],
        [dIds.elena, driverId, "Elena Rostova", "DL-44319", "Class B (Van)", "2027-05-20", "+1-555-0102", 99.0, "On Trip"],
        [dIds.marcus, adminId, "Marcus Vance", "DL-11204", "Class A (Heavy)", "2029-01-11", "+1-555-0103", 94.2, "Available"],
        [dIds.sarah, adminId, "Sarah Jenkins", "DL-88210", "Class B (Van)", "2027-08-30", "+1-555-0104", 96.8, "On Trip"],
        [dIds.david, adminId, "David Kim", "DL-33109", "Class A (Heavy)", "2024-01-01", "+1-555-0105", 88.0, "Available"]
    ];

    drivers.forEach(d => dStmt.run(d));
    dStmt.finalize();

    // ==========================================
    // 5. SEED TRIPS, MAINTENANCE & FUEL
    // ==========================================
    console.log("Generating active trips, maintenance logs, and fuel telemetry...");
    
    // Trips
    const tStmt = db.prepare(`
        INSERT INTO trips (id, vehicle_id, driver_id, source, destination, cargo_weight_kg, planned_distance_km, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    tStmt.run([uuidv4(), vIds.van2, dIds.elena, "Warehouse A", "Distribution Center B", 1200, 340, "Dispatched"]);
    tStmt.run([uuidv4(), vIds.trk2, dIds.sarah, "Port Terminal 4", "Factory Gate 1", 16500, 850, "Dispatched"]);
    tStmt.finalize();

    // Maintenance Logs
    const mStmt = db.prepare(`
        INSERT INTO maintenance_logs (id, vehicle_id, description, cost, date, status) VALUES (?, ?, ?, ?, ?, ?)
    `);
    mStmt.run([uuidv4(), vIds.van3, "Transmission Fluid & Brake Pad Replacement", 1450.00, "2026-07-10", "Open"]);
    mStmt.run([uuidv4(), vIds.trk4, "Engine Telemetry Sensor Fault & Tire Rotation", 2800.00, "2026-07-11", "Open"]);
    mStmt.run([uuidv4(), vIds.van1, "Routine 40,000 Mile Service", 450.00, "2026-06-15", "Closed"]);
    mStmt.finalize();

    // Fuel Logs
    const fStmt = db.prepare(`
        INSERT INTO fuel_logs (id, vehicle_id, liters, cost, date) VALUES (?, ?, ?, ?, ?)
    `);
    fStmt.run([uuidv4(), vIds.van1, 120.5, 180.75, "2026-07-01"]);
    fStmt.run([uuidv4(), vIds.trk1, 450.0, 675.00, "2026-07-02"]);
    fStmt.run([uuidv4(), vIds.van2, 140.0, 210.00, "2026-07-05"]);
    fStmt.finalize();

    db.run("COMMIT;", (err) => {
        if (err) {
            console.error("❌ Seeding failed:", err.message);
        } else {
            console.log("✅ Database successfully seeded with UUIDs and new column names!");
        }
        db.close();
    });
});