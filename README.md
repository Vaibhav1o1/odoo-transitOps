# TransitOps — Fleet & Logistics Management ERP

TransitOps is a lightweight, real-time fleet management and logistics ERP system built during an 8-hour hackathon sprint. It handles vehicle registration, driver allocation, and trip tracking with automated state-machine transitions and strict business rule validation.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Axios, Lucide React
* **Backend:** Node.js, Express.js
* **Database:** SQLite (`sqlite3`) — chosen for zero-server overhead, local portability, and embedded transactional support.
* **ID Generation:** `uuid` (V4) for globally unique text-based primary keys across relational tables.



---

## 📁 Project Directory Structure

The project is structured with a root-level backend environment and a dedicated subdirectory for the React frontend application:-

```text
odoo-transitOps/                  (Repository Root - Backend)
├── db/
│   ├── db.js                    # Database pool connection & auto-migration engine[cite: 2]
│   └── schema.sql               # Relational SQL definition & check constraints[cite: 1]
├── transit-ops/                  (Frontend Workspace)
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.js           # Central Axios HTTP service layer
│   │   │   └── mockApi.js       # Local visual prototype fallbacks
│   │   ├── App.jsx              # Core UI Layout & Dashboard Component
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── package.json                 # Backend dependencies
└── server.js                    # Express Application Entry & Core Business Logic Engine

```

---

## 🚀 Quick Start & Installation

### Prerequisite

Ensure you have **Node.js** (v18 or higher) installed on your machine.

### 1. Backend Setup

Open a terminal at the repository root folder (`odoo-transitOps/`) and run:

```bash
# Install backend dependencies
npm install

# Start the Express API server
node server.js

```

The server will initialize an empty database file named `transitops.db` and run the structural migrations automatically. The backend runs on **`http://localhost:5000`**.

### 2. Frontend Setup

Open a **second terminal window**, change directory into the frontend workspace, and run:

```bash
# Navigate to the frontend folder
cd transit-ops

# Install frontend dependencies
npm install

# Start the Vite local development engine
npm run dev

```

*Open your browser to **`http://localhost:5173`** to access the live dashboard.*

---

## 🧠 Core Business Logic & Constraints

The application shifts beyond basic CRUD processing by executing atomic database transactions that enforce core operational conditions:

1. **Capacity Fail-safe:** A trip cannot be dispatched if the configured `cargo_weight_kg` exceeds the maximum designated payload capacity (`max_capacity_kg`) of the assigned vehicle.


2. **Conflict Resolution:** Vehicles and drivers are locked into state lifecycles (`Available` $\rightarrow$ `On Trip`). The system rejects dispatches involving assets that are flagged as `In Shop` or already assigned to an active trip.


3. **Transactional Integrity:** Modifying the deployment status of a route updates the trip registry, the fleet registry, and driver availability simultaneously inside a guarded database transaction blocks to prevent partial failures.

---

## 📊 Database Schema Details

The local relational architecture tracks six foundational telemetry entities:

* **`users`**: Manages RBAC authentication rules (`Fleet Manager`, `Driver`, `Safety Officer`, `Financial Analyst`).


* **`vehicles`**: Tracks structural specifications, mileage meters, maintenance statuses, and financial acquisition lines.


* **`drivers`**: Links legal operating credentials and identity fields back to specific user profiles.


* **`trips`**: Logs origin routing points, destination points, payload metrics, and dispatch lifecycle flows.


* **`maintenance_logs`**: Registers open/closed workshop repair details mapped to individual vehicles.


* **`fuel_expenses`**: Aggregates operating cost telemetry (Fuel, Tolls, Upkeep) to calculate asset ROI.
