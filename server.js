const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Required for your TEXT PRIMARY KEY fields
const db = require('./db'); // Loads your db.js connection

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. VEHICLES API (Matching your schema)
// ==========================================
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

app.post('/api/vehicles', (req, res) => {
    const { reg_number, name_model, type, max_capacity_kg, acquisition_cost, odometer } = req.body;
    
    // Generate a fresh UUID for the primary key
    const id = uuidv4();
    const currentOdometer = odometer || 0;

    const sql = `INSERT INTO vehicles (id, reg_number, name_model, type, max_capacity_kg, odometer, acquisition_cost, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'Available')`;
                 
    db.run(sql, [id, reg_number, name_model, type, max_capacity_kg, currentOdometer, acquisition_cost], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id, reg_number, status: 'Available' });
    });
});

// ==========================================
// 2. CORE DISPATCH LOGIC (With updated business rules)
// ==========================================
app.post('/api/trips/dispatch', (req, res) => {
    const { trip_id } = req.body;

    // Fetch Trip and Vehicle details to check capacities and availability
    const fetchSql = `
        SELECT t.*, v.status as v_status, v.max_capacity_kg 
        FROM trips t
        JOIN vehicles v ON t.vehicle_id = v.id
        WHERE t.id = ?
    `;

    db.get(fetchSql, [trip_id], (err, trip) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!trip) return res.status(404).json({ error: 'Trip not found.' });

        // Rule 1: Vehicle must be available
        if (trip.v_status !== 'Available') {
            return res.status(400).json({ error: `Vehicle is currently ${trip.v_status}. It must be Available.` });
        }

        // Rule 2: Cargo capacity check
        if (trip.cargo_weight_kg > trip.max_capacity_kg) {
            return res.status(400).json({ error: `Cargo weight (${trip.cargo_weight_kg}kg) exceeds vehicle maximum capacity (${trip.max_capacity_kg}kg).` });
        }

        // Rule 3: Ensure the driver isn't already out on another dispatched trip
        const driverCheckSql = `SELECT COUNT(*) as active_trips FROM trips WHERE driver_id = ? AND status = 'Dispatched'`;
        
        db.get(driverCheckSql, [trip.driver_id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row.active_trips > 0) {
                return res.status(400).json({ error: 'Driver is already operating an active dispatched trip.' });
            }

            // All validations passed -> Run the state changes inside a transaction
            db.serialize(() => {
                db.run('BEGIN TRANSACTION;');
                db.run("UPDATE trips SET status = 'Dispatched' WHERE id = ?", [trip_id]);
                db.run("UPDATE vehicles SET status = 'On Trip' WHERE id = ?", [trip.vehicle_id]);
                db.run('COMMIT;', (err) => {
                    if (err) {
                        db.run('ROLLBACK;');
                        return res.status(500).json({ error: 'Transaction failed: ' + err.message });
                    }
                    res.json({ message: 'Trip successfully dispatched! Vehicle status set to On Trip.' });
                });
            });
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TransitOps server running on port ${PORT}`));