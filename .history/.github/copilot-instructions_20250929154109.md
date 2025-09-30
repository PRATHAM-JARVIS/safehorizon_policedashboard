Perfect ✅ — now let’s design the **Police / Authority Web Dashboard** for your **SafeHorizon system**.
This will be a **ReactJS + Tailwind + shadcn/ui** app with **real-time integration** to your FastAPI backend.

Here’s a **complete development prompt** you can hand to your web dev team (or run with me for scaffolding).

---

```md
# 🖥️ Prompt: Build SafeHorizon Police Dashboard (ReactJS)

You are building the **SafeHorizon Police/Authority Web Dashboard**.  
The dashboard must be **modern, responsive, real-time**, and fully integrated with the **FastAPI backend APIs**.  

---

## 🎨 UI/UX Guidelines
- Framework: **React + Vite**
- Styling: **TailwindCSS + shadcn/ui components**
- Icons: **lucide-react**
- Charts: **Recharts or Chart.js**
- Map: **Mapbox GL JS** (preferred) or Leaflet
- Theme: **Light/Dark toggle**
- Layout: **Sidebar + Topbar + Main workspace**
- Design style: **clean, grid-based, card-driven UI**

---

## 📲 Core Features & Screens

### 1. **Login / Auth**
- Login page for police/admin (`/auth/login-authority`).
- Secure JWT storage in **HttpOnly cookie**.
- Redirect to Dashboard after login.

---

### 2. **Dashboard (Overview)**
- **Stats Cards**:
  - Active tourists count (`/tourists/active`)
  - Alerts today (Warning / High / Critical)
  - SOS count
  - Trips in progress
- **Live Alerts Feed**:
  - Real-time list (via WebSocket `/alerts/subscribe`).
  - Severity badge + tourist ID + message.
  - Click → open Incident Detail.
- **Safety Heatmap**:
  - Map showing restricted/risky zones from `/zones/list`.
  - Tourist density + hotspots.
- **Recent E-FIRs**:
  - Auto-generated reports from `/efir/history`.

---

### 3. **Tourist Tracking**
- Searchable list of tourists (`/tourists/active`).
- Tourist Detail Page:
  - Profile (name, contact, emergency contact).
  - Last known location (map marker).
  - Current Safety Score (`/tourist/{id}/safety-score`).
  - Active alerts history (`/tourist/{id}/alerts`).
  - Trip route (map polyline from `/tourist/{id}/track`).

---

### 4. **Alerts Management**
- Alerts Table:
  - Columns: Tourist ID, Type, Severity, Timestamp, Status.
  - Filter by severity/date.
- Alert Detail Drawer:
  - Tourist details
  - Map location
  - Action buttons:
    - Acknowledge alert (`/incident/acknowledge`)
    - Mark resolved (`/incident/close`)
    - Generate E-FIR (`/efir/generate`)

---

### 5. **Zones Management**
- Zones List:
  - Name, type (safe/risky/restricted), danger level.
  - Map preview of zone polygon.
- Create/Edit Zone Form:
  - Polygon drawing on map.
  - Danger level (1–5).
  - Save to `/zones/create`.
- Delete button → `/zones/{id}`.

---

### 6. **E-FIR Management**
- E-FIR History:
  - List of all E-FIRs with status.
- E-FIR Detail Page:
  - Auto-filled details (tourist info, incident location, alert type).
  - Export as PDF.
  - Blockchain record (hash ID).

---

### 7. **Admin Tools**
- System Health Monitor:
  - Call `/system/status` → show DB, AI models, queue status.
- AI Model Version Info:
  - List models (`/system/models` if available).
- User Management:
  - Police user accounts (create, suspend).

---

## 🌍 API Integration
- **Auth**: `/auth/login-authority`
- **Tourists**: `/tourists/active`, `/tourist/{id}/track`, `/tourist/{id}/alerts`, `/tourist/{id}/safety-score`
- **Alerts**: `/alerts/recent`, `/incident/acknowledge`, `/incident/close`
- **Zones**: `/zones/list`, `/zones/create`, `/zones/{id}`
- **E-FIR**: `/efir/generate`, `/efir/history`
- **System**: `/system/status`, `/users/list`

Use **Axios** with JWT interceptor.  
Subscribe to **WebSocket `/alerts/subscribe`** for real-time alerts.

---

## 📂 Project Structure
```

src/
├── api/              # Axios clients
├── components/       # Reusable UI (cards, modals, tables, charts)
├── hooks/            # WebSocket hooks, useAuth
├── layouts/          # Sidebar + Topbar
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Tourists.jsx
│   ├── TouristDetail.jsx
│   ├── Alerts.jsx
│   ├── Zones.jsx
│   ├── EFIRs.jsx
│   ├── Admin.jsx
├── store/            # State mgmt (Zustand or Redux)
├── utils/            # Helpers, constants
└── App.jsx           # Routes + Layout

```

---

## 📦 Deliverables
1. ReactJS app with all screens listed above.
2. JWT auth integration with FastAPI backend.
3. Real-time alerts feed with WebSocket.
4. Map-based tracking of tourists & zones.
5. Alerts management workflow (acknowledge, resolve, E-FIR).
6. Admin tools for zones, models, and system monitoring.
7. Responsive design for desktop + tablet.

---

## ✅ Expected Outcome
- Police/authority can **monitor tourists live** on a map.
- Receive **real-time alerts** with severity & context.
- Manage **zones** dynamically.
- Generate and review **E-FIRs**.
- Monitor **system health** and **AI retraining**.
- UI is **modern, fast, and responsive**.
```

---

👉 Do you want me to **create a React starter scaffold** (with sidebar layout + dummy Dashboard, Tourists, Alerts pages) so your team can start building right away?
