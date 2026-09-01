# CATFleet360 Enterprise Heavy Equipment & Fleet Operating System

**CATFleet360** is a full-stack enterprise equipment and fleet management platform engineered with an Industrial Precision design language (Cat Yellow `#ffcd00` & Charcoal `#231f20`).

---

## 🌟 Core Architecture & Key Differentiators

Unlike traditional dashboards that rely on static pages and generic cards, **CATFleet360** introduces an enterprise workspace experience:

1. **Workspace-Based Interface**:
   - **Collapsible Navigation Rail**: Fast multi-tab switching with real-time telemetry health indicator.
   - **Universal Command Bar**: `Ctrl+K` global search across machinery, operators, work orders, and rentals; role-switching dropdown (Administrator, Fleet Manager, Technician); notification drawer; quick action creator.
   - **Contextual Sliding Drawers**: Inspect machine details, telemetry, and service manuals without losing your place in the workspace.

2. **Operations Overview Hub**:
   - **Fleet Health Engine**: Computes real-time health score (0-100) combining availability rate, utilization, and overdue service alerts.
   - **Interactive KPI Cards**: Clickable drill-down filtering by operational status and machinery category.
   - **Live Activity Timeline**: Chronological operational event feed with automated triggers.

3. **Equipment Explorer**:
   - **Dual Views**: High-density Grid View and Table View.
   - **Saved Filter Presets**: "All Fleet Machinery", "High Utilization Equipment", "Assets Needing Maintenance", and "Hydraulic Excavators".
   - **5-Tab Sliding Asset Drawer**: Overview & Specs, Usage & Runtime Graphs, Maintenance History, PDF Documents/Manuals, and Chronological Audit History.

4. **Asset Lifecycle Governance Workflow**:
   - Visual 7-Stage State Machine: `Registered` ➔ `Available` ➔ `Assigned` ➔ `In Operation` ➔ `Under Maintenance` ➔ `Rental` ➔ `Retired`.
   - Authorized stage transition controller with audit logging.

5. **Live Operations Center (Geospatial Tracking)**:
   - **Interactive Leaflet Map**: Machinery GPS coordinates, custom color-coded status pins, and interactive floating telemetry inspector.
   - **Operations Radio Feed**: Real-time simulated telemetry and geofence events stream.

6. **Maintenance Workspace**:
   - **Maintenance Kanban Board**: Interactive column workflow (`Reported` ➔ `Inspection Required` ➔ `Scheduled` ➔ `In Progress` ➔ `Completed`).
   - **Maintenance Planner**: Timeline schedule with cost and technician tracking.
   - **Work Order Creator**: Log new service requests with component priority.

7. **Commercial Rental Management**:
   - End-to-end workflow: `Requested` ➔ `Approved` ➔ `Active` ➔ `Completed`.
   - Automated duration and cost calculation ($/day rate * days).

8. **Certified Operator Directory**:
   - Operator profiles, OSHA/Cat Grade assist certifications, safety ratings, shift schedules, and machinery assignment modals.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, SQLite / PostgreSQL support, JWT Authentication, bcryptjs, CORS.
- **Design System**: Caterpillar Industrial Precision (`#ffcd00`, `#231f20`, JetBrains Mono & Inter typography).

---

## 🚀 Running the Application

### 1. Backend Server (Port 5000)
```bash
cd backend
npm install
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```

### 2. Frontend Application (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
