<div align="center">

# TransitOps — Fleet & Logistics Management ERP

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge)](https://recharts.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Lucide](https://img.shields.io/badge/Lucide-F56565?style=for-the-badge)](https://lucide.dev/)

**TransitOps** is a lightweight, real-time fleet management and logistics ERP system built to digitize vehicle registry, driver allocation, dispatches, maintenance logging, and operational expenses. It enforces strict transactional integrity and business rule validations out of the box.

[📖 Setup Guide](#-setup--installation) · [🐛 Report Bug](https://github.com/Vaibhav1o1/odoo-transitOps/issues)

<br/>

</div>

---

## 📋 Table of Contents
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Features](#-features)
- [Mandatory Business Rules](#-mandatory-business-rules)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [User Roles & Access](#-user-roles--access)
- [Example Workflow](#-example-workflow)
- [Contributors](#-contributors)

---

## 🚨 The Problem
Many logistics companies still rely on manual spreadsheets and paper-based logs to coordinate transport operations. This workflow creates:
- 🚫 **Scheduling Conflicts:** Double-assigning vehicles and drivers to active dispatches.
- 📉 **Asset Underutilization:** Low visibility on fleet status (Active, Available, Retired).
- 🔧 **Missed Maintenance:** Lack of real-time status transitions when vehicles go to workshops.
- 📜 **Driver Non-Compliance:** Dispatches assigned to suspended drivers or expired licenses.
- 💸 **Vague Profitability Index:** Difficulty in tracking fuel efficiency (km/L) and exact vehicle ROI.

---

## 💡 Our Solution
**TransitOps** centralizes transport operations by establishing a relational mapping between vehicles, drivers, dispatches, and maintenance logs. It enforces automated state-machine validations and triggers atomic database updates on status transitions.

> One central dashboard. Real-time validation checks. Automatic asset locks. Analytics you can trust.

---

## ✨ Features

### 🔐 Authentication & Access Control (RBAC)
- Support for secure logins to isolate dashboards by user types.
- Strict Role-Based Access Control (RBAC) separating administrative actions from driver access.

### 📊 KPI Operations Dashboard
- Live dashboard displaying:
  - **Active Vehicles** (On-trip counts)
  - **Available Vehicles** (Idle and ready counts)
  - **Vehicles in Maintenance** (In-shop counts)
  - **Active Trips**, **Pending Trips**, **Drivers On Duty**
  - **Fleet Utilization (%)** metric.
- Dynamic filtering by **Vehicle Type**, **Operational Status**, and **Region**.

### 🚛 Vehicle Registry
- Master directory tracking **Registration Number (unique)**, **Model/Name**, **Type** (Van/Truck), **Max Capacity (kg)**, **Odometer (km)**, **Acquisition Cost ($)**, **Status**, and **Region** (North, South, East, West).
- Automated lifecycles (`Available`, `On Trip`, `In Shop`, `Retired`).

### 👤 Driver Management
- Full driver profiles tracking **Name**, **License Number**, **License Category**, **License Expiry Date**, **Contact Number**, **Safety Score**, and **Status** (`Available`, `On Trip`, `Off Duty`, `Suspended`).

### 🗺️ Trip Dispatch Management
- Dispatch router allowing managers to create trips with departure source, destination, cargo weight, and planned distance.
- Advanced pre-dispatch validations (checking capacity weight, license validity, and driver availability).
- Four-stage lifecycle: `Draft` $\rightarrow$ `Dispatched` $\rightarrow$ `Completed` $\rightarrow$ `Cancelled`.

### 🔧 Workshop Maintenance
- Logging interface to create and close vehicle repair logs.
- Automatically places vehicles in **"In Shop"** status upon open maintenance requests, locking them out of the active dispatch pool.

### ⛽ Fuel & Expense tracking
- Refueling log capturing liters, cost, and timestamps.
- Integrates with maintenance costs to compute **Total Operational Cost** per vehicle.

### 📈 Reports & Analytics
- Live calculations tracking **Fuel Efficiency** (km/L), **Fleet Utilization**, **Operational Cost**, and **Vehicle ROI** using the official formula:
  $$\text{Vehicle ROI} = \frac{\text{Estimated Revenue} - (\text{Maintenance} + \text{Fuel})}{\text{Acquisition Cost}}$$
- Single-click **CSV report exporter** compiling operational data directly to your downloads.

---

## 🛡️ Mandatory Business Rules
The application guards database integrity using these rules:
* **Unique Registrations:** Duplicate vehicle registration numbers are blocked.
* **Asset Guarding:** Retired or `In Shop` vehicles do not appear in the active selection pool.
* **Safety Lockouts:** Drivers with expired licenses or `Suspended` status are blocked from dispatches.
* **Double-Assign Prevention:** Assets marked `On Trip` cannot be assigned to any other trip.
* **Overweight Protection:** A dispatch fails if cargo weight exceeds the vehicle's maximum load capacity.
* **State Machine:**
  - *Dispatching:* Sets both vehicle and driver status to `On Trip`.
  - *Completion:* Restores both vehicle and driver status back to `Available` (requires inputting final odometer).
  - *Cancellation:* Restores both vehicle and driver back to `Available`.
  - *Maintenance:* Moves vehicle status to `In Shop`. Closing logs restores status back to `Available`.

---

## 🏗 Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                       REACT FRONTEND                        │
│            (Vite, TailwindCSS, Axios, Recharts)             │
│   Dashboard Filters · Live Reports View · CSV File Export   │
└───────────────────────────┬─────────────────────────────────┘
                            │ API Requests (Port 5001)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      EXPRESS BACKEND                        │
│         (Node.js, Express Router, Dynamic SQL Builder)      │
│   User Auth & RBAC · State Machines · Atomic Transactions   │
└───────────────────────────┬─────────────────────────────────┘
                            │ SQLite Client (sqlite3)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         DATA LAYER                          │
│                      SQLite Database                        │
│   users · vehicles · drivers · trips · maintenance_logs ·   │
│   fuel_logs                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack
| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React (Vite) | Core user interface structure |
| Styling | Tailwind CSS | Utility-first styling & responsiveness |
| Routing | React Router DOM v7 | Component routing & protective role gates |
| Charts | Recharts | Visual KPI analysis & graphs |
| Backend | Node.js / Express | API router & business validator |
| Database | SQLite3 | Local persistent storage |
| Icons | Lucide React | Modern icons |

---

## 📁 Project Structure
```text
odoo-transitOps/                  (Repository Root - Backend)
├── db/
│   ├── db.js                    # SQLite connection & auto-schema migration
│   └── schema.sql               # Relational SQL table definitions & checks
├── transit-ops/                  (Frontend Workspace)
│   ├── src/
│   │   ├── components/          # Reusable cards, selects, modals, and draw menus
│   │   ├── context/             # Auth, notifications, and dark-theme providers
│   │   ├── services/            # Axios API endpoint mapping
│   │   ├── pages/               # Dashboard, Vehicles, Drivers, Trips, and Reports
│   │   ├── App.jsx              # Routing & Context Setup
│   │   └── main.jsx             # React entry point
│   ├── package.json
│   └── vite.config.js
├── package.json                 # Backend scripts & packages
├── seed.js                      # DB seeding script containing mock dataset
└── server.js                    # Express Application & validation endpoints
```

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### 1. Clone & Install Backend
```bash
git clone https://github.com/Vaibhav1o1/odoo-transitOps.git
cd odoo-transitOps
npm install
```

### 2. Setup the Database Schema & Seed Data
Initialize your local database file (`transitops.db`) and seed it with dummy dataset by running:
```bash
node seed.js
```

### 3. Install Frontend Dependencies
```bash
cd transit-ops
npm install
cd ..
```

### 4. Start the Application
You can start the backend and frontend concurrently in development mode by running this command in your repository root directory:
```bash
npm run dev
```

---

## 👤 User Roles & Access
| Target User | Primary Responsibility | Key System Capability |
|---|---|---|
| 👑 **Fleet Manager** | Oversees assets and efficiency | Register/edit vehicles, close maintenance log tickets |
| 🧑‍✈️ **Driver** | Executes deliveries | Input logs, update trip progress, view dispatches |
| 🛡️ **Safety Officer** | Enforces compliance checks | Monitors driver safety index, validates license limits |
| 📊 **Financial Analyst** | Optimizes operating costs | Accesses profitability indices, checks ROI, CSV export |

---

## 📝 Example Workflow
* **Step 1:** Register vehicle `VAN-05` (Capacity: 500kg, Status: `Available`).
* **Step 2:** Hire driver `Alex` with a valid Class B license.
* **Step 3:** Create a dispatch with cargo weighing `450 kg` (System checks that $450\text{kg} \le 500\text{kg}$ and confirms).
* **Step 4:** Dispatching updates the status of both `VAN-05` and `Alex` to `On Trip` automatically.
* **Step 5:** Complete the trip by typing in the final odometer distance and fuel consumed.
* **Step 6:** System resets both vehicle and driver status back to `Available`.
* **Step 7:** Reports dynamically update fuel efficiency and operational cost stats.

---

## 🤝 Contributors
| Name | GitHub |
|------|--------|
| **Vaibhav Gupta** | [Vaibhav1o1](https://github.com/Vaibhav1o1) |
| **Raghib Aftab** | [raghib-aftab](https://github.com/raghib-aftab) |
| **Shaurya Jain** | [shauryajain111](https://github.com/shauryajain111) |
| **Hemant Nishad** | [hemant-code01](https://github.com/hemant-code01) |

---

<div align="center">

**Built with ❤️ for smart logistics management**

</div>
