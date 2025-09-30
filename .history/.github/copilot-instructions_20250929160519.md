Got it ✅
Since you’ve already defined the **Authority Dashboard endpoints** in your API spec, here’s a **single full development prompt** to build the **Police/Authority Dashboard**.

This prompt covers **UI/UX requirements**, **screens**, and **backend integration** — mapped directly to the endpoints you’ve already built.

---

```md
# 🖥️ Prompt: Build SafeHorizon Police/Authority Dashboard (React + Tailwind)

You are building the **SafeHorizon Police Dashboard** — a **ReactJS web app** for authorities to monitor tourist safety in real time.  
It must be **modern, responsive, and fully integrated with the SafeHorizon FastAPI backend**.

---

## 🎨 UI/UX Guidelines
- Framework: **React (Vite or Next.js)**
- Styling: **TailwindCSS + shadcn/ui**
- Icons: **lucide-react**
- Charts: **Recharts**
- Map: **Mapbox GL JS** or **Leaflet**
- Layout: **Sidebar (navigation)** + **Topbar (user info, logout)** + **Main content**
- Theme: **Light/Dark toggle**
- Design style: **Card-driven, clean, responsive**

---

## 📲 Screens & Required Features

### 1. **Login (Authority Only)**
- Login form → calls `POST /auth/login-authority`
- Store token securely (HttpOnly cookie or secure storage).
- Redirect to Dashboard on success.

---

### 2. **Dashboard (Overview)**
- **Stats cards** (API: `/tourists/active`, `/alerts/recent`):
  - Active tourists count
  - Alerts today (Warning / High / Critical)
  - SOS count
  - Trips in progress
- **Live Alerts Feed** (real-time via `WS /alerts/subscribe`):
  - List of incoming alerts with severity badge, tourist ID, timestamp.
  - Click → open Incident Detail.
- **Map View**:
  - Show restricted zones (`/zones/list`).
  - Overlay tourist locations (`/tourists/active`).
  - Highlight critical alerts.

---

### 3. **Tourists Management**
- **Tourists List** (API: `/tourists/active`):
  - Name, email, safety score, last seen, location.
  - Search + filter.
- **Tourist Detail** (API: `/tourist/{id}/track`, `/tourist/{id}/alerts`):
  - Profile info.
  - Current safety score.
  - Last known location (map).
  - Trip route history.
  - Alerts list for that tourist.

---

### 4. **Alerts Management**
- **Alerts Table** (API: `/alerts/recent`):
  - Columns: Tourist, Type, Severity, Location, Status, Timestamp.
  - Filters: severity, date range.
- **Alert Detail Drawer**:
  - Tourist info.
  - Map with location of incident.
  - Action buttons:
    - Acknowledge (`POST /incident/acknowledge`)
    - Resolve (`POST /incident/close`)
    - Generate E-FIR (`POST /efir/generate`)

---

### 5. **Zones Management**
- **Zones List** (API: `/zones/list`):
  - Name, type (restricted/safe/risky), description.
  - Map preview polygon.
- **Create Zone** (API: `/zones/create`):
  - Draw polygon on map.
  - Set danger level + description.
- **Delete Zone** (API: `DELETE /zones/{zone_id}`).

---

### 6. **E-FIR Management**
- **E-FIR History**:
  - Show generated E-FIRs with blockchain hash.
- **E-FIR Detail**:
  - Incident info (tourist, alert, notes).
  - Export as PDF.
  - Blockchain hash verification.

---

### 7. **Admin Tools (if authority has admin rights)**
- **System Status** (API: `/system/status`):
  - Show DB/AI/queue health.
- **Users List** (API: `/users/list`).
- **Suspend User** (API: `PUT /users/{user_id}/suspend`).

---

## 🌍 API Integration
Use the provided endpoints:contentReference[oaicite:1]{index=1}:
- Auth: `/auth/login-authority`
- Tourists: `/tourists/active`, `/tourist/{id}/track`, `/tourist/{id}/alerts`
- Alerts: `/alerts/recent`, `/incident/acknowledge`, `/incident/close`
- Zones: `/zones/list`, `/zones/create`, `/zones/{id}`
- E-FIR: `/efir/generate`
- System: `/system/status`, `/users/list`
- WebSocket: `WS /alerts/subscribe` for real-time alerts

Use **Axios** with JWT interceptor.

---

## 📂 Project Structure
```

src/
├── api/              # API clients (axios)
├── components/       # Reusable UI (cards, tables, modals, charts)
├── hooks/            # useAuth, useWebSocket
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
├── store/            # State management (Zustand/Redux)
└── App.jsx           # Routes + Layout

```

---

## 📦 Deliverables
1. ReactJS dashboard with:
   - Login + JWT auth
   - Overview dashboard
   - Tourist tracking & detail view
   - Real-time alerts feed
   - Zones management (map polygons)
   - E-FIR workflow
   - Admin tools (status, user management)
2. Responsive UI for desktop & tablet.
3. Secure WebSocket connection for live alerts.

---

## ✅ Expected Outcome
- Police authorities can:
  - Monitor tourists in real time.
  - Track SOS and anomalies instantly.
  - Manage restricted zones.
  - Generate blockchain-backed E-FIRs.
  - Ensure system health and user control.
- Dashboard is **fast, responsive, and production-ready**.
```

---

👉 Do you want me to also **design the UI flow (wireframe)** for this dashboard, like I did for the mobile app, so your devs know exactly which elements go where on each screen?
