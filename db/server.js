const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Required for UUID primary keys
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. VEHICLE ROUTES
// ==========================================

// Get all vehicles
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
    const id = uuidv4(); // Generate UUID for the new record
    
    const sql = `
        INSERT INTO vehicles (id, reg_number, name_model, type, max_capacity_kg, acquisition_cost) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [id, reg_number, name_model, type, max_capacity_kg, acquisition_cost], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id, status: 'Available' });
    });
});

// ==========================================
// 2. CORE BUSINESS RULE: DISPATCH TRIP
// ==========================================

app.post('/api/trips/dispatch', (req, res) => {
    const { trip_id } = req.body;

    // Step 1: Fetch Trip and joined Vehicle details
    const fetchSql = `
        SELECT t.*, v.status as v_status, v.max_capacity_kg
        FROM trips t
        JOIN vehicles v ON t.vehicle_id = v.id
        WHERE t.id = ?
    `;

    db.get(fetchSql, [trip_id], (err, trip) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!trip) return res.status(404).json({ error: 'Trip not found.' });

        // Step 2: Validate Business Rules
        if (trip.v_status !== 'Available') {
            return res.status(400).json({ error: `Vehicle is currently ${trip.v_status}. Must be Available to dispatch.` });
        }
        if (trip.cargo_weight_kg > trip.max_capacity_kg) {
            return res.status(400).json({ error: `Cargo weight (${trip.cargo_weight_kg}kg) exceeds vehicle capacity (${trip.max_capacity_kg}kg).` });
        }

        // Step 3: Execute State Transitions Safely using a Transaction
        db.serialize(() => {
            db.run('BEGIN TRANSACTION;');
            
            // Update trip to Dispatched
            db.run("UPDATE trips SET status = 'Dispatched' WHERE id = ?", [trip_id]);
            // Update vehicle to On Trip
            db.run("UPDATE vehicles SET status = 'On Trip' WHERE id = ?", [trip.vehicle_id]);
            
            db.run('COMMIT;', (err) => {
                if (err) {
                    db.run('ROLLBACK;');
                    return res.status(500).json({ error: 'Transaction failed: ' + err.message });
                }
                res.json({ message: 'Success! Trip dispatched and vehicle is now On Trip.' });
            });
        });
    });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 TransitOps backend running on port ${PORT}`);
});