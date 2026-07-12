const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Connect to (or create) the SQLite database file
const db = new sqlite3.Database('./transitops.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Ensure foreign keys are strictly enforced
        db.run('PRAGMA foreign_keys = ON;');
        
        // Read and execute the schema file to build missing tables
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schema, (err) => {
                if (err) console.error('Failed to execute schema:', err);
                else console.log('Database tables initialized successfully.');
            });
        } else {
            console.warn('Warning: schema.sql file not found in the root directory.');
        }
    }
});

module.exports = db;