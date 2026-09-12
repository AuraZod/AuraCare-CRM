<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0284c7&height=220&section=header&text=AuraCare%20CRM&fontSize=42&fontColor=fff&animation=twinkling&fontAlignY=38"/>

  <br/>

  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=18&duration=3000&pause=1000&color=0284C7&center=true&vCenter=true&width=620&lines=Full-Stack+Hospital+%26+Clinic+Management+System;Granular+Role-Based+Access+Control+(6+Roles);Express+REST+API+%2B+React+Vite+SPA+%2B+Electron;Deployed+on+Linux+VPS+%26+Vercel+CDN" alt="Typing SVG" />

  <br/>

[![Live Web App](https://img.shields.io/badge/Live_Web_App-0284C7?style=for-the-badge&logo=vercel&logoColor=white)](https://auracare-gamma.vercel.app)
[![Live API](https://img.shields.io/badge/Live_API-10B981?style=for-the-badge&logo=cloudflare&logoColor=white)](https://auracare-api.quobot.app/health)
[![Desktop Build](https://img.shields.io/badge/Desktop-Windows_x64-8B5CF6?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/AuraZod/AuraCare-CRM/releases/latest)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

<img src="frontend/public/openg.png" width="100%" alt="AuraCare Banner" />

</div>

---

## What it does

* **End-to-End Clinical Flow**: Manages the patient journey from reception desk check-in, real-time consultation queueing, digital prescriptions, lab testing, pharmacy dispensing, to final billing.
* **Granular Role-Based Access Control**: Enforces strict permission matrices across 6 clinical roles (**Super Admin**, **Admin**, **Doctor**, **Receptionist**, **Pharmacy Staff**, **Diagnostic Staff**).
* **Digital Prescriptions & Pharmacy Dispensing**: Doctors issue digital prescriptions that instantly route to the pharmacy queue, automatically deducting stock and tracking batch expiration.
* **Laboratory Test Order Tracking**: Diagnostic technicians manage specimen statuses, record quantitative test outcomes, and upload clinical diagnostic reports.
* **Billing & GST-Compliant Invoices**: Generates itemized invoices combining doctor consultation fees, diagnostic lab tests, and dispensed medications with PDF invoice export.
* **Real-time Facility Analytics & Audit Trails**: Tracks appointment volumes, daily revenue collection, low-stock inventory alerts, and security audit logs.
* **Cross-Platform Native Experience**: Deployed as a web app on Vercel and packaged into native desktop binaries via Electron.

---

### `>_ root@auracare:~/system# ./architecture_flow.sh`

```text
  [ Web Client ]             [ Desktop Client ]
 (React 18 + Vite)           (Electron Wrapper)
         │                            │
         └─────────────┬──────────────┘
                       │ HTTPS / REST (JWT Auth)
                       ▼
            ┌─────────────────────┐
            │  Cloudflare Tunnel  │ (DDoS Protection & SSL)
            └──────────┬──────────┘
                       │ Reverse Proxy
                       ▼
          ┌─────────────────────────┐
          │  Express.js REST API    │ (Linux VPS / PM2)
          │  ├─ RBAC Middleware     │
          │  ├─ 30-Day Session Mgr  │
          │  └─ Winston Audit Log   │
          └────────────┬────────────┘
                       │ Mongoose ODM
                       ▼
            ┌─────────────────────┐
            │   MongoDB Atlas     │ (Users, Patients, Prescriptions,
            │   (Cloud Cluster)   │  Invoices, Inventory, Audit Logs)
            └─────────────────────┘
```

---

### `>_ root@auracare:~/clinic# ./clinical_workflow.sh`

```text
Receptionist             Doctor               Pharmacy / Lab             Cashier
     │                      │                       │                       │
     ├─► Register Patient   │                       │                       │
     ├─► Schedule Appt ────►│                       │                       │
     │                      ├─► Consultation        │                       │
     │                      ├─► Issue Rx ──────────►├─► Dispense Drugs      │
     │                      ├─► Order Lab Test ────►├─► Upload Results      │
     │                      │                       │                       ├─► Compile Invoice
     │                      │                       │                       ├─► Apply GST / Disc
     │                      │                       │                       └─► Download PDF Bill
```

---

## 🔐 Role-Based Access Control (RBAC)

| Role | Primary Responsibilities | Scope & Permissions |
| :--- | :--- | :--- |
| **Super Admin** | Clinic owner, full facility control | Executive analytics, security audit logs, database backup & maintenance, staff review. |
| **Admin** | Hospital management & operations | Staff user creation, department setup, services pricing, integrations config. |
| **Doctor** | Clinical care & patient diagnosis | Patient medical histories, consultation notes, digital prescriptions, lab orders. |
| **Receptionist** | Front desk & scheduling | Patient intake, appointment booking, token generation, consultation queues. |
| **Pharmacy Staff** | Dispensary & drug stock | Prescription fulfillment, drug inventory management, batch expiry tracking. |
| **Diagnostic Staff** | Pathology & radiology | Laboratory test order tracking, specimen status updates, diagnostic report uploads. |

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/AuraZod/AuraCare-CRM.git
cd AuraCare-CRM

# 1. Start the Backend API
cd backend
npm install
cp .env.example .env
npm run dev

# 2. In a new terminal, start the Web Frontend
cd ../frontend
npm install
npm run dev
```

The web dashboard will be accessible at `http://localhost:8080`.

---

## 💻 Running Locally

### Prerequisites
* **Node.js**: `>= 18.0.0`
* **npm**: `>= 9.0.0`
* **MongoDB**: A running local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) URI.

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure your `backend/.env` file:

```env
PORT=3000
NODE_ENV=development

DB_URI=mongodb://localhost:27017/auracare-db

JWT_SECRET=your-jwt-auth-secret-key-here
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=your-jwt-refresh-secret-here
JWT_REFRESH_EXPIRE=60d

SESSION_MAX_AGE=30d
SESSION_CLEANUP_INTERVAL=24h

OWNER_EMAIL=admin@hospital.com
OWNER_PASSWORD=password123
OWNER_NAME=Admin User

CLIENT_URL=http://localhost:8080
LOG_LEVEL=info
```

Start the API server:
```bash
npm run dev
```
*API health check will be live at: `http://localhost:3000/health`*

---

### 2. Frontend Setup

```bash
cd ../frontend
npm install
```

Configure your `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SITE_NAME=AuraCare CRM
VITE_ORGANIZATION_NAME=AuraZod
VITE_DEVELOPMENT=true
```

Start the Vite development server:
```bash
npm run dev
```
*Open [http://localhost:8080](http://localhost:8080) in your browser.*

---

### 3. Desktop Application (Electron)

The desktop app wraps the compiled frontend into a cross-platform desktop application.

```bash
cd ../desktop
npm install
```

**Development Mode:**
```bash
# Concurrently spins up frontend and launches Electron
npm run dev
```

**Production Build (Standalones):**
```bash
# Package for Windows (.exe installer)
npm run build:win

# Package for Linux (.AppImage & .deb)
npm run build:linux
```
*Packaged outputs will be generated in `desktop/dist/`.*

---

## 🛠️ How It Works

Most hospital management systems are bloated, painful to use, and look like they were designed twenty years ago. During rounds or triage, staff do not have time to battle complex interfaces or wait for screens to re-render. AuraCare was developed for the **Hack Club Stardance** event to tackle this problem directly.

The system is separated into three distinct layers:
1. **Express REST Backend**: Manages MongoDB document schemas with Mongoose and enforces strict role-based access control. Every request is verified through JWT authorization middleware and authenticated against user permissions before hitting controller logic.
2. **Vite + React Frontend**: Built with React 18, TypeScript, and Tailwind CSS to guarantee instant client-side route transitions and reactive states. Custom UI components backed by Radix UI primitives and Lucide icons deliver a modern healthcare dashboard.
3. **Electron Desktop Bridge**: Packages the compiled web build so clinical staff can run AuraCare as a standalone window application without relying on an external browser tab.

A key challenge during development was session reliability. Hospital staff frequently move between terminals and consultation desks; traditional 15-minute token expirations would log doctors out mid-prescription. We implemented an extended 30-day session architecture paired with rolling token renewals and server-side inactivity tracking, ensuring uninterrupted clinical operations while retaining the ability for admins to revoke tokens immediately on demand.

---

## ⚠️ Troubleshooting & Common Pitfalls

* **CORS / API Network Errors**:
  * Verify that `VITE_API_URL` in `frontend/.env` points to your backend URL (e.g. `http://localhost:3000/api` for local development, or `https://auracare-api.quobot.app/api` for production).
* **Database Connection**:
  * Ensure MongoDB is running locally (`mongod`) or your IP address is whitelisted in MongoDB Atlas Network Access rules.
* **Port Availability**:
  * Default ports: Backend on `3000`, Frontend on `8080`. If `8080` is busy, Vite will fall back to the next available port. Update `desktop/main.js` if running the Electron app in dev mode on a custom port.

---

## 🏗️ Project Structure

```text
Arogya/
├── backend/                  # Node.js & Express REST API
│   ├── src/
│   │   ├── config/           # Database & auth configuration
│   │   ├── controllers/      # Route controllers (patients, billing, prescriptions, etc.)
│   │   ├── middleware/       # Auth guards, RBAC validator, error handlers
│   │   ├── models/           # Mongoose schemas (User, Patient, Invoice, etc.)
│   │   ├── routes/           # REST endpoints
│   │   └── services/         # Business logic (auth, email, sessions)
│   ├── scripts/              # DB seeder and test utilities
│   └── tests/                # Jest & Supertest suites
│
├── frontend/                 # React + TypeScript Web Dashboard
│   ├── src/
│   │   ├── components/       # Dashboards, layouts, and Radix UI components
│   │   ├── contexts/         # Authentication & theme providers
│   │   ├── pages/            # Role pages (Appointments, Prescriptions, Billing, etc.)
│   │   └── lib/              # API client & formatting utilities
│   └── public/               # Static assets & brand media
│
└── desktop/                  # Electron Native Desktop Wrapper
    ├── assets/               # Application icons
    ├── main.js               # Electron main process & IPC handlers
    └── preload.js            # Secure context bridge
```

---

## 👥 Credits

* **Frameworks & Libraries**: [Express](https://expressjs.com/), [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Electron](https://www.electronjs.org/), [Mongoose](https://mongoosejs.com/), [Lucide Icons](https://lucide.dev/).
* Built for the **Hack Club Stardance** showcase.

---

## 🤖 AI Usage

In compliance with Hack Club Stardance transparency guidelines:
* AI was utilized to draft initial Mongoose schemas, generate boilerplate CRUD endpoint definitions, design the role-permission matrix data structures, and assist in refining Tailwind utility layouts for clinical dashboard views.
* All business logic, session token architectures, clinical queue flows, and system integrations were designed, implemented, and verified specifically for this project.

---

## 🪪 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). See the [LICENSE](LICENSE) file for details.
