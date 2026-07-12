const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Required for UUID primary keys
const db = require('./db/db'); // Ensure this points to your SQLite connection file

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. VEHICLE REGISTRY ROUTES
// ==========================================

// Get all vehicles (with optional status filter)
app.get('/api/vehicles', (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM vehicles';
    let params = [];
    
    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }
    
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create a new vehicle
app.post('/api/vehicles', (req, res) => {
    const { reg_number, name_model, type, max_capacity_kg, acquisition_cost } = req.body;
    const id = uuidv4(); 
    
    const sql = `
        INSERT INTO vehicles (id, reg_number, name_model, type, max_capacity_kg, acquisition_cost, odometer, status) 
        VALUES (?, ?, ?, ?, ?, ?, 0, 'Available')
    `;
    
    db.run(sql, [id, reg_number, name_model, type, max_capacity_kg, acquisition_cost], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id, reg_number, status: 'Available' });
    });
});

// ==========================================
// 2. DRIVER MANAGEMENT ROUTES
// ==========================================

// Get all drivers (with optional status filter)
app.get('/api/drivers', (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM drivers';
    let params = [];
    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Register a new driver
app.post('/api/drivers', (req, res) => {
    const { name, license_number, license_category, license_expiry_date, contact_number } = req.body;
    const id = uuidv4();

    const sql = `
        INSERT INTO drivers (id, name, license_number, license_category, license_expiry_date, contact_number, safety_score, status) 
        VALUES (?, ?, ?, ?, ?, ?, 100.0, 'Available')
    `;
    db.run(sql, [id, name, license_number, license_category, license_expiry_date, contact_number], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id, name, status: 'Available', safety_score: 100.0 });
    });
});

// ==========================================
// 3. TRIP LIFECYCLE & DISPATCH MANAGEMENT
// ==========================================

// Create a new Draft Trip
app.post('/api/trips', (req, res) => {
    const { source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km } = req.body;
    const id = uuidv4();

    const sql = `
        INSERT INTO trips (id, source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Draft')
    `;
    db.run(sql, [id, source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id, status: 'Draft' });
    });
});

// CORE BUSINESS RULE: DISPATCH TRIP
app.post('/api/trips/dispatch', (req, res) => {
    const { trip_id } = req.body;

    // Fetch Trip, Vehicle, and Driver details in one query
    const fetchSql = `
        SELECT t.*, 
               v.status as v_status, v.max_capacity_kg, 
               d.status as d_status, d.license_expiry_date 
        FROM trips t
        JOIN vehicles v ON t.vehicle_id = v.id
        JOIN drivers d ON t.driver_id = d.id
        WHERE t.id = ?
    `;

    db.get(fetchSql, [trip_id], (err, trip) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!trip) return res.status(404).json({ error: 'Trip not found.' });

        // Mandatory Business Rule Validations
        if (trip.v_status !== 'Available') {
            return res.status(400).json({ error: `Vehicle is currently ${trip.v_status}. Must be Available to dispatch.` });
        }
        if (trip.d_status !== 'Available') {
            return res.status(400).json({ error: `Driver is currently ${trip.d_status}. Must be Available to dispatch.` });
        }
        if (new Date(trip.license_expiry_date) < new Date()) {
            return res.status(400).json({ error: 'Dispatch blocked: Driver license is expired!' });
        }
        if (trip.cargo_weight_kg > trip.max_capacity_kg) {
            return res.status(400).json({ error: `Cargo weight (${trip.cargo_weight_kg}kg) exceeds vehicle capacity (${trip.max_capacity_kg}kg).` });
        }

        // Execute Atomic State Transitions
        db.serialize(() => {
            db.run('BEGIN TRANSACTION;');
            db.run("UPDATE trips SET status = 'Dispatched' WHERE id = ?", [trip_id]);
            db.run("UPDATE vehicles SET status = 'On Trip' WHERE id = ?", [trip.vehicle_id]);
            db.run("UPDATE drivers SET status = 'On Trip' WHERE id = ?", [trip.driver_id]);
            db.run('COMMIT;', (err) => {
                if (err) {
                    db.run('ROLLBACK;');
                    return res.status(500).json({ error: 'Transaction failed: ' + err.message });
                }
                res.json({ message: 'Success! Trip dispatched. Vehicle and Driver status updated to On Trip.' });
            });
        });
    });
});

// Complete Trip (Auto-restores Vehicle and Driver to 'Available')
app.post('/api/trips/complete', (req, res) => {
    const { trip_id, final_odometer } = req.body;

    db.get('SELECT * FROM trips WHERE id = ?', [trip_id], (err, trip) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!trip || trip.status !== 'Dispatched') {
            return res.status(400).json({ error: 'Trip must be in Dispatched state to complete.' });
        }

        db.serialize(() => {
            db.run('BEGIN TRANSACTION;');
            db.run("UPDATE trips SET status = 'Completed' WHERE id = ?", [trip_id]);
            db.run("UPDATE vehicles SET status = 'Available', odometer = ? WHERE id = ?", [final_odometer, trip.vehicle_id]);
            db.run("UPDATE drivers SET status = 'Available' WHERE id = ?", [trip.driver_id]);
            db.run('COMMIT;', (err) => {
                if (err) {
                    db.run('ROLLBACK;');
                    return res.status(500).json({ error: 'Failed to complete trip: ' + err.message });
                }
                res.json({ message: 'Trip completed! Vehicle and Driver restored to Available.' });
            });
        });
    });
});

// Cancel Trip (Restores assets if already dispatched)
app.post('/api/trips/cancel', (req, res) => {
    const { trip_id } = req.body;
    db.get('SELECT * FROM trips WHERE id = ?', [trip_id], (err, trip) => {
        if (err || !trip) return res.status(404).json({ error: 'Trip not found.' });
        
        db.serialize(() => {
            db.run('BEGIN TRANSACTION;');
            db.run("UPDATE trips SET status = 'Cancelled' WHERE id = ?", [trip_id]);
            if (trip.status === 'Dispatched') {
                db.run("UPDATE vehicles SET status = 'Available' WHERE id = ?", [trip.vehicle_id]);
                db.run("UPDATE drivers SET status = 'Available' WHERE id = ?", [trip.driver_id]);
            }
            db.run('COMMIT;', (err) => {
                if (err) {
                    db.run('ROLLBACK;');
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Trip cancelled successfully.' });
            });
        });
    });
});

// ==========================================
// 4. MAINTENANCE & FUEL LOGS
// ==========================================

// Create Maintenance Log (Auto-switches vehicle to 'In Shop' so it cannot be dispatched)
app.post('/api/maintenance', (req, res) => {
    const { vehicle_id, description, cost, date } = req.body;
    const id = uuidv4();

    db.serialize(() => {
        db.run('BEGIN TRANSACTION;');
        const sql = `INSERT INTO maintenance_logs (id, vehicle_id, description, cost, date, status) VALUES (?, ?, ?, ?, ?, 'Open')`;
        db.run(sql, [id, vehicle_id, description, cost, date], function(err) {
            if (err) {
                db.run('ROLLBACK;');
                return res.status(400).json({ error: err.message });
            }
            db.run("UPDATE vehicles SET status = 'In Shop' WHERE id = ? AND status != 'Retired'", [vehicle_id]);
            db.run('COMMIT;', () => res.status(201).json({ id, status: 'Open', message: 'Vehicle moved to In Shop status.' }));
        });
    });
});

// Close Maintenance Log (Auto-restores vehicle to 'Available')
app.post('/api/maintenance/close', (req, res) => {
    const { log_id } = req.body;
    db.get('SELECT vehicle_id FROM maintenance_logs WHERE id = ?', [log_id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Maintenance log not found.' });
        
        db.serialize(() => {
            db.run('BEGIN TRANSACTION;');
            db.run("UPDATE maintenance_logs SET status = 'Closed' WHERE id = ?", [log_id]);
            db.run("UPDATE vehicles SET status = 'Available' WHERE id = ? AND status = 'In Shop'", [row.vehicle_id]);
            db.run('COMMIT;', () => res.json({ message: 'Maintenance closed. Vehicle is now Available.' }));
        });
    });
});

// Log Fuel Expenses
app.post('/api/fuel', (req, res) => {
    const { vehicle_id, liters, cost, date } = req.body;
    const id = uuidv4();
    const sql = `INSERT INTO fuel_logs (id, vehicle_id, liters, cost, date) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [id, vehicle_id, liters, cost, date], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id, message: 'Fuel log recorded successfully.' });
    });
});

// ==========================================
// 5. ANALYTICS & KPI REPORTING ENGINE
// ==========================================

// Dashboard KPI Metrics (Active, Available, In Maintenance, and Fleet Utilization %)
app.get('/api/analytics/kpis', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_vehicles,
            SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available_vehicles,
            SUM(CASE WHEN status = 'On Trip' THEN 1 ELSE 0 END) as active_vehicles,
            SUM(CASE WHEN status = 'In Shop' THEN 1 ELSE 0 END) as maintenance_vehicles,
            ROUND((SUM(CASE WHEN status = 'On Trip' THEN 1.0 ELSE 0.0 END) / NULLIF(COUNT(*), 0)) * 100, 1) as fleet_utilization_pct
        FROM vehicles WHERE status != 'Retired'
    `;
    db.get(sql, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || { total_vehicles: 0, available_vehicles: 0, active_vehicles: 0, maintenance_vehicles: 0, fleet_utilization_pct: 0 });
    });
});

// Financial Analytics: Operational Cost, Fuel Efficiency (km/L), and Vehicle ROI
app.get('/api/analytics/vehicle-roi', (req, res) => {
    const sql = `
        SELECT 
            v.id,
            v.reg_number,
            v.name_model,
            v.acquisition_cost,
            v.odometer,
            IFNULL(m.total_maintenance, 0) as maintenance_cost,
            IFNULL(f.total_fuel_cost, 0) as fuel_cost,
            IFNULL(f.total_liters, 0) as fuel_liters,
            (IFNULL(m.total_maintenance, 0) + IFNULL(f.total_fuel_cost, 0)) as total_operational_cost,
            ROUND(v.odometer / NULLIF(IFNULL(f.total_liters, 0), 0), 2) as fuel_efficiency_km_l
        FROM vehicles v
        LEFT JOIN (
            SELECT vehicle_id, SUM(cost) as total_maintenance 
            FROM maintenance_logs GROUP BY vehicle_id
        ) m ON v.id = m.vehicle_id
        LEFT JOIN (
            SELECT vehicle_id, SUM(cost) as total_fuel_cost, SUM(liters) as total_liters 
            FROM fuel_logs GROUP BY vehicle_id
        ) f ON v.id = f.vehicle_id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Enriched ROI calculation: Revenue - (Maintenance + Fuel) / Acquisition Cost
        const enrichedData = rows.map(row => {
            const estimatedRevenue = row.odometer * 2.5; // Demo metric: $2.50 earned per km driven
            const netProfit = estimatedRevenue - row.total_operational_cost;
            const roi = row.acquisition_cost > 0 ? ((netProfit / row.acquisition_cost) * 100).toFixed(1) : 0;
            return { 
                ...row, 
                estimated_revenue: estimatedRevenue, 
                roi_percentage: `${roi}%`,
                net_profit: netProfit
            };
        });

        res.json(enrichedData);
    });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 TransitOps backend running on port ${PORT}`);
});