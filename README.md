# CATFleet360 Enterprise Heavy Equipment & Fleet Operating System

[![Live Server](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://frontend-ruby-tau-16.vercel.app)
[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://dharnish123.github.io/CATFleet360/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Live Production Server**: 🌐 [**https://frontend-ruby-tau-16.vercel.app**](https://frontend-ruby-tau-16.vercel.app)  
> **GitHub Pages Backup**: 🌐 [**https://dharnish123.github.io/CATFleet360/**](https://dharnish123.github.io/CATFleet360/)

**CATFleet360** is a full-stack enterprise equipment and fleet management operating system engineered with an authentic **Caterpillar Industrial Precision** design language (Cat Yellow `#ffcd00` & Charcoal `#231f20`).

---

## 🌐 Live Deployment & Access Links

| Environment | Live URL | Status |
| :--- | :--- | :--- |
| 🚀 **Vercel Production (Primary)** | [**https://frontend-ruby-tau-16.vercel.app**](https://frontend-ruby-tau-16.vercel.app) | 🟢 **Live & Active** |
| 🌍 **GitHub Pages (Backup)** | [**https://dharnish123.github.io/CATFleet360/**](https://dharnish123.github.io/CATFleet360/) | 🟢 **Live & Active** |
| 🐙 **GitHub Repository** | [**https://github.com/DHARNISH123/CATFleet360**](https://github.com/DHARNISH123/CATFleet360) | 🟢 **Main Branch** |

---

## 🔑 Demo Access & Role Accounts

Instant role switcher available in the top-right command bar, or sign in directly with:

| Role | Email | Password | Platform Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@catfleet360.com` | `catfleet2026` | Full platform control, asset registration, role management |
| **Fleet Manager** | `manager@catfleet360.com` | `catfleet2026` | Dispatching, rentals, lifecycle stage transitions, operator linking |
| **Technician** | `tech@catfleet360.com` | `catfleet2026` | Work orders, 5-stage Maintenance Kanban board, inspections |

---

## 🌟 Core Features & Modules

### 1. 🛰️ Live Geospatial Operations Center
- **Free Multi-Layer GIS Map Tile API Switcher**: High-res Satellite (ESRI), Tactical Dark (CartoDB), Streets (OpenStreetMap), and Topo Elevation (OpenTopoMap).
- **International Quick-Jump Regions**: Jump between USA California Quarry, India Chennai/Bangalore corridor, Australia Pilbara Iron Ore Pit, and Europe Rail Terminal.
- **Real-Time Telemetry & Radio Feed**: Streaming operational events with pause/play controls.

### 2. 📊 Smart Rental Tracking, Demand Forecasting & AI Anomaly Engine
- **Exact Problem Statement Dataset**: Built-in tracking for `EQX1001` through `EQX1007` across Sites `S001` to `S006`.
- **Automated Anomaly Detection**: Flags high idle hours, ghost unassigned assets, and misallocated machinery with 1-click **"Auto-Fix"**.
- **14-Day Demand Pre-Positioning**: AI matrix forecasting upcoming site machinery requirements.

### 3. 🚜 Equipment Explorer & 5-Tab Sliding Drawer
- High-density Grid and Table views with instant search, category filtering, and saved presets.
- **5-Tab Deep Inspector**: Overview & Specs, 7-Day Usage Telemetry Graphs, Maintenance History, Documents, and Chronological Activity Trail.
- **Official Compliance Reports**: Instant 1-click generation and download of Caterpillar Inspection & Compliance documents.

### 4. 🔄 Step-by-Step Asset Lifecycle Governance
- Deterministic 7-stage state machine: `Registered` ➔ `Available` ➔ `Assigned` ➔ `In Operation` ➔ `Under Maintenance` ➔ `Rental` ➔ `Retired`.
- Step buttons (`Prev Stage ⬅`, `Next Stage ➔`) and 1-click **"Simulate Full 7-Stage Progression"**.

### 5. 📱 QR Code Digital Check-In / Check-Out Terminal
- Instant operator shift handovers, meter reading sync, fuel level logging, and OSHA pre-trip safety walkaround inspection certification.

### 6. 🛠️ Maintenance Kanban & Commercial Rentals
- Drag-and-drop 5-column Kanban board (`Reported` ➔ `Inspection` ➔ `Scheduled` ➔ `In Progress` ➔ `Completed`).
- Rental contract calculator with automatic cost estimation (`days * dailyRate`).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet GIS.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, SQLite / PostgreSQL, JWT Authentication, bcryptjs, CORS.
- **Design System**: Caterpillar Industrial Precision (`#ffcd00`, `#231f20`, JetBrains Mono & Inter typography).
- **Deployment**: Vercel, GitHub Pages, Render (`render.yaml`).

---

## 💻 Local Development Setup

### 1. Start Backend:
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open [**http://localhost:3000**](http://localhost:3000) in your browser.

---

© 2026 CATFleet360. Developed for the Caterpillar Hackathon.
