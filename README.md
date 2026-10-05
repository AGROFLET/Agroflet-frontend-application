# AgroFlet Frontend Web Application (`agroflet-frontend-application`)

## Overview
AgroFlet is a Peruvian startup that improves the visibility, control and traceability of the land transport of
agricultural products. This repository contains the **Frontend Web Application** used by the two target segments:

- **Dispatchers** (collectors and producers who coordinate freight): register vehicles and drivers, schedule shipments,
  start transport, report incidents and positions, and close operations.
- **Wholesale buyers** (markets, warehouses and stores): follow the shipments addressed to them, check the planned route
  and the reported positions, and receive alerts about incidents and status changes.

The application is a Vue 3 + Vite single-page application organized with a domain-driven design (DDD) style, following
the structure of the course reference project (`learning-center`). It consumes the AgroFlet Platform API; during
Sprint 2 that API is a Fake API served by `json-server` (see [Fake API](#fake-api-json-server)).

Version `1.0.0` corresponds to **Sprint 2 (TB1)**: first version of the web application.

**Live application:** <https://agroflet-frontend-application.vercel.app> (Fake API at
<https://agroflet-frontend-application.vercel.app/api/v1>), also published on GitHub Pages at
<https://agroflet.github.io/Agroflet-frontend-application/>. See [Deployment](#deployment).

## Goals
- Support the core business process (shipment lifecycle `planned → in_transit → delivered | cancelled`) and its
  supporting processes (authentication, fleet resources, tracking, incidents and notifications).
- Keep domain rules explicit in plain JavaScript entities and keep them out of views and HTTP code.
- Provide a responsive, accessible (a11y) and internationalized (i18n: `en-US` default, `es-419`) experience consistent
  with the AgroFlet landing page and style guide.

## Tech Stack
| Concern | Technology |
|:--|:--|
| Framework | Vue 3.5 (Composition API, `<script setup>`) |
| Build tool | Vite 8 |
| State management / application services | Pinia 4 (setup stores) |
| Routing | Vue Router 5 (lazy-loaded routes, global guard) |
| Internationalization | Vue I18n 11 (`en`, `es`) |
| UI components | PrimeVue 5 with the Material preset customized with the AgroFlet palette, PrimeFlex 4, PrimeIcons 8 |
| HTTP client | Axios 1 (`BaseApi` + `BaseEndpoint`) |
| Maps (third-party service) | Leaflet 1.9 with OpenStreetMap tiles |
| Mock API | `json-server` 0.17 |
| Hosting | Vercel: static build plus a Vercel Function that serves the Fake API (`vercel.json`, `api/index.js`); GitHub Pages: static build published by GitHub Actions |

## Project Structure (DDD-Oriented)
```text
src/
  iam/                       # IAM: accounts, roles, session, profile, password recovery
    domain/model/            # User, UserType, SignIn/SignUp/UpdateProfile/ChangePassword commands, password policy
    application/             # useIamStore
    infrastructure/          # IamApi, assemblers, session storage, interceptor, authentication guard
    presentation/            # sign-in, sign-up, password recovery/reset, profile settings, sign-out
  fleet/                     # Fleet resources: vehicles and drivers
  shipments/                 # Core domain: shipments, locations, status history, filters
  tracking/                  # Planned route and reported positions (Leaflet map)
  incidents/                 # Route incidents, ETA recalculation and notifications
  shared/                    # BaseApi, BaseEndpoint, layout, shared components and views
  locales/                   # en.json, es.json
  i18n.js, router.js, pinia.js, main.js, app.vue, style.css
server/                      # Fake API (json-server): db.json, routes.json, start.sh
api/                         # Vercel Function that serves the Fake API in the deployed application
.github/workflows/           # GitHub Actions workflow that publishes the application on GitHub Pages
docs/                        # User stories (RTM), ADRs, class diagram, Fake API OpenAPI, Sprint 2 report
vercel.json                  # Vercel build, Fake API route and single-page application fallback
```

## Bounded Contexts
| Bounded context | Responsibility | Main elements |
|:--|:--|:--|
| IAM: Identity & Access Management (`iam`) | Sign-up, sign-in, sign-out, password recovery and change, profile and preferred language, route protection by role | `User`, `useIamStore`, `IamApi`, `authenticationGuard`, `iamInterceptor` |
| Fleet & Resource Management (`fleet`) | Vehicles and drivers of each dispatcher, availability and reservation of resources | `Vehicle`, `Driver`, `useFleetStore`, `FleetApi` |
| Shipment & Dispatch Operations, core (`shipments`) | Shipment registration, lifecycle transitions, status history, active operations, history with filters and search | `Shipment`, `Location`, `StatusChange`, `ShipmentFilter`, `useShipmentsStore`, `ShipmentsApi` |
| Real-Time Tracking & Route Telemetry (`tracking`) | Planned route and positions reported by the dispatcher (date, source, demo flag, stale detection) | `ReportedPosition`, `PlannedRoute`, `useTrackingStore`, `TrackingApi`, `ShipmentMap` |
| Incident, Alert & Audit Management (`incidents`) | Incidents with idempotency key, one-time ETA recalculation, notifications per participant without duplicates | `Incident`, `Notification`, `useIncidentsStore`, `useNotificationsStore`, `IncidentsApi` |
| Shared (`shared`) | Cross-context infrastructure and presentation | `BaseApi`, `BaseEndpoint`, `Layout`, `LanguageSwitcher`, `PageHeader`, `EmptyState` |

## Layer Responsibilities
- **Domain**: business concepts and invariants as plain JavaScript classes (no Vue, no HTTP). Example: `Shipment.startTransit()`
  only accepts a `planned` shipment and `Shipment.validateForCreation(vehicle)` rejects a weight that exceeds the vehicle capacity.
- **Application**: Pinia stores orchestrate use cases across entities and infrastructure. Example: `createShipment`
  validates, checks availability, creates the shipment, reserves vehicle and driver, records the status history and
  notifies participants, rolling back when the reservation fails.
- **Infrastructure**: API clients extend `BaseApi`, endpoints use `BaseEndpoint`, and assemblers map resources to entities.
- **Presentation**: views and components render state and call store actions; they never call Axios directly.

## Features by Role
| Feature | Dispatcher | Buyer |
|:--|:--:|:--:|
| Dashboard with active operations, KPIs and map (planned routes and reported positions) | ✓ | ✓ (own shipments) |
| Register shipment with resource reservation | ✓ | |
| Start transport, mark as delivered, cancel with reason | ✓ | |
| Register incident (ETA recalculated once, idempotent) and reported position | ✓ | |
| Shipment detail: summary, planned route, positions, incidents, status history | ✓ | ✓ (without driver DNI/phone) |
| History with filters (dates, status, cargo, destination) and search by code or plate | ✓ | ✓ |
| Notifications for incidents and status changes, mark as read | ✓ | ✓ |
| Vehicles and drivers management | ✓ | |
| Profile, preferred language and password change | ✓ | ✓ |

## Running the Project

### Prerequisites
- Node.js `^20.19.0` or `>=22.12.0` and npm (required by Vite 8).

### 1) Install dependencies
```bash
npm install
```

### 2) Start the application
From the project root:
```bash
npm run dev
```
Open the URL printed by Vite (by default `http://localhost:5173`). The same Vite server serves the Fake API at
`/api/v1` (see [Fake API](#fake-api-json-server)), so no second terminal is needed.

### 3) Build for production
```bash
npm run build
```

### 4) Preview the production build
```bash
npm run preview
```
Like `npm run dev`, the preview server also serves the Fake API at `/api/v1`.

### Fake API on its own (optional)
To try the endpoints with Swagger Editor or Postman, start the Fake API alone from the project root:
```bash
npm run server
```
or, as in the reference project:
```bash
cd server
sh start.sh
```
It listens on `http://localhost:3000/api/v1` (`server/routes.json` maps `/api/v1/*` to the root resources). The
application does not need it, because `npm run dev` already serves the Fake API.

### Demo accounts
All demo accounts use the password `Agroflet2026`.

| Email | Role | Preferred language |
|:--|:--|:--|
| `dispatcher@agroflet.pe` | Dispatcher (owns the seeded fleet and shipments) | English |
| `dispatcher2@agroflet.pe` | Dispatcher | Spanish |
| `buyer@agroflet.pe` | Buyer (receives AGF-0001, AGF-0003, AGF-0005) | Spanish |
| `buyer2@agroflet.pe` | Buyer (receives AGF-0002, AGF-0004) | Spanish |

Segment access from the landing page: `/iam/sign-in?segment=dispatcher|buyer` and `/iam/sign-up?segment=dispatcher|buyer`.

## Environment Variables
Environment files included: `.env.development` and `.env.production` (typed in `vite-env.d.ts`).

| Variable | Purpose |
|:--|:--|
| `VITE_AGROFLET_PLATFORM_API_URL` | Base URL of the AgroFlet Platform API (`/api/v1` in development and production: the Fake API on the application's own domain) |
| `VITE_USERS_ENDPOINT_PATH`, `VITE_PASSWORD_RESET_REQUESTS_ENDPOINT_PATH` | IAM endpoints |
| `VITE_VEHICLES_ENDPOINT_PATH`, `VITE_DRIVERS_ENDPOINT_PATH` | Fleet endpoints |
| `VITE_SHIPMENTS_ENDPOINT_PATH`, `VITE_STATUS_CHANGES_ENDPOINT_PATH`, `VITE_LOCATIONS_ENDPOINT_PATH` | Shipments endpoints |
| `VITE_POSITIONS_ENDPOINT_PATH` | Tracking endpoint |
| `VITE_INCIDENTS_ENDPOINT_PATH`, `VITE_NOTIFICATIONS_ENDPOINT_PATH` | Incidents endpoints |
| `VITE_LANDING_PAGE_URL` | Public URL of the AgroFlet landing page (footer link) |
| `VITE_PRIME_UI_LICENSE_KEY` | PrimeUI license key (see below) |

**PrimeUI license key.** PrimeVue 5 is distributed under the PrimeUI License: students and academic projects qualify
for the free Community License (<https://primeui.dev/licenses/community>). Paste the key in `VITE_PRIME_UI_LICENSE_KEY`;
without it PrimeVue shows an "Invalid PrimeUI License" notice, but every feature keeps working.

**Production API.** `.env.production` sets `VITE_AGROFLET_PLATFORM_API_URL=/api/v1`: the deployed application calls the
Fake API served by the Vercel Function on its own domain, so no CORS configuration is needed. The GitHub Pages build
replaces it with the full URL of that Fake API (see [GitHub Pages](#github-pages)). When the RESTful API (ASP.NET Core)
is deployed, replace both with the public URL of that API.

## Routes
| Path | View | Access |
|:--|:--|:--|
| `/iam/sign-in`, `/iam/sign-up` | Sign in / sign up (optional `?segment=dispatcher\|buyer`) | Guests |
| `/iam/password-recovery`, `/iam/reset-password?token=` | Password recovery and reset | Guests |
| `/dashboard` | Shipment dashboard (dispatcher) or incoming shipments (buyer) | Signed in |
| `/shipments` | Shipment history with filters and search | Signed in |
| `/shipments/new` | Register shipment | Dispatcher |
| `/shipments/:id` | Shipment detail | Participants of the shipment |
| `/fleet/vehicles`, `/fleet/vehicles/new`, `/fleet/vehicles/:id/edit` | Vehicles | Dispatcher |
| `/fleet/drivers`, `/fleet/drivers/new` | Drivers | Dispatcher |
| `/notifications` | Notifications | Signed in |
| `/iam/profile` | Profile, language and password | Signed in |
| `/about`, `/terms` | About us, terms of service | Public |

The global guard (`authenticationGuard`) restores the session, redirects anonymous users to sign-in (keeping the
`redirect` query), keeps signed-in users away from guest pages and checks `meta.roles`.

## Fake API (`json-server`)
- Data lives in `server/db.json`: users, locations, vehicles, drivers, shipments, status-changes, positions, incidents,
  notifications, password-reset-requests and contact-messages. Seeded positions are flagged with `isDemo: true` and are
  labelled as demonstrative data in the UI.
- `npm run dev` and `npm run preview` serve the Fake API at `/api/v1` from the Vite server (`vite.config.js`). It loads
  `server/db.json` when the server starts and keeps every change in memory, so restarting the server restores the demo
  data and the file never changes. The application and its Fake API share one origin, as in the deployed version.
- `npm run server` runs the same Fake API alone at `http://localhost:3000/api/v1` and persists every write in
  `server/db.json`; to restore the seed data run `git checkout server/db.json`. To point the application at it, set
  `VITE_AGROFLET_PLATFORM_API_URL=http://localhost:3000/api/v1` in a `.env.development.local` file (ignored by Git).
- Seed dates are fixed (September and October 2026). A last position older than 180 minutes is shown as outdated, which
  is the expected behavior (US17); register a new position on an in-transit shipment to see a current one.
- `npm run server` runs **without `--watch`**: in `json-server` 0.17 the watch mode restarts the HTTP server whenever
  the file differs from memory, which happens between the consecutive writes of a use case (for example, registering a
  shipment also reserves its vehicle and driver) and drops requests.
- Authentication is emulated over the `users` collection until the RESTful API (technical stories TS01/TS02) is
  available: the Fake API is for demonstration only and must never hold real credentials.
- Password recovery has no e-mail service yet; in development builds (`npm run dev`) the one-time reset link is shown on
  screen. Production builds never show it, so the reset step can only be demonstrated locally.
- **Deployed Fake API.** `api/index.js` copies `server/db.json` to the temporary directory of the Vercel Function
  when an instance starts. Changes last while that instance is alive and the data returns to the seed when a new
  instance starts. It also answers requests from other origins (`json-server` enables CORS by default), which the
  copy on GitHub Pages relies on. The deployed Fake API is public, so the sign-up form asks visitors not to use a real
  password or personal data.

## Deployment
The application is deployed on **Vercel** at <https://agroflet-frontend-application.vercel.app>, together with its Fake
API, and published on **GitHub Pages** at <https://agroflet.github.io/Agroflet-frontend-application/>, which uses the
Fake API on Vercel.

### Vercel
`vercel.json` builds the application with `npm run build`, publishes `dist/`, sends `/api/v1/*` to the Vercel Function
in `api/index.js` (the Fake API: `json-server` over a copy of `server/db.json`, with the routes of `server/routes.json`)
and rewrites every other route to `index.html` (history mode). The application and its Fake API share one domain, so
production builds call `/api/v1`.

To deploy a new version, use one of these options:
- **Git integration (recommended):** connect the GitHub repository to the Vercel project (Project Settings > Git). Each
  push to `main` then deploys to production and each pull request gets a preview URL.
- **Vercel CLI:**
  ```bash
  npm install -g vercel
  vercel login
  vercel link        # select the agroflet-frontend-application project
  vercel --prod
  ```

To remove the PrimeUI license notice in production, add `VITE_PRIME_UI_LICENSE_KEY` in Project Settings > Environment
Variables (Production) and redeploy: variables defined in Vercel take precedence over the empty value in
`.env.production`.

### GitHub Pages
`.github/workflows/deploy-github-pages.yml` publishes the application on every push to `main` (for example, when a
release pull request is merged) and on demand from the *Actions* tab (*Run workflow*). The workflow:
- runs `npm ci` and `npm run build -- --base "/Agroflet-frontend-application/"`, because a project site is served under
  the repository name; the router and the asset URLs use that base path (`import.meta.env.BASE_URL`);
- sets `VITE_AGROFLET_PLATFORM_API_URL` to the Fake API on Vercel, since GitHub Pages only serves static files;
- copies `index.html` to `404.html`, so a reloaded or shared internal route (history mode) still opens the application.
  GitHub Pages answers those routes with HTTP status 404, but the page works;
- uploads `dist/` and deploys it with the official Pages actions.

Before the first run, enable Pages once in the repository: *Settings > Pages > Build and deployment > Source: GitHub
Actions*. If a run failed because Pages was not enabled yet, open it in the *Actions* tab and choose *Re-run all jobs*.
Optional repository variables (*Settings > Secrets and variables > Actions > Variables*): `AGROFLET_PLATFORM_API_URL`
replaces the API URL and `PRIME_UI_LICENSE_KEY` sets the PrimeUI license key.

Pushing a change to `.github/workflows/` requires a GitHub token with the `workflow` scope. If GitHub rejects the push
for that reason, sign in again through the browser (in WebStorm, *Settings > Version Control > GitHub*) or use a
personal access token that includes `workflow`.

## Internationalization and Accessibility
- English (`en-US`) is the default language and Latin American Spanish (`es-419`) is available from the header or the
  profile. The preference is stored per account and in the browser, and `<html lang>` follows the selected language.
  Content written by users is never translated automatically.
- Every status is shown with icon, text and color; forms use visible labels (`for`/`input-id`, `aria-labelledby` for
  selects), validation messages are announced (`role="alert"`), icon-only buttons have `aria-label`, there is a
  skip link, focus is visible and animations respect `prefers-reduced-motion`.

## Documentation
- `docs/user-stories.md`: user stories in scope and Requirement Traceability Matrix (RTM).
- `docs/adrs.md`: Architecture Decision Records.
- `docs/class-diagram.puml`: domain model per bounded context (PlantUML).
- `docs/fake-api.openapi.yaml`: OpenAPI 3 description of the Fake API endpoints, with the technical story each one
  emulates (open it in Swagger Editor or WebStorm to try the requests against the local server).
- `docs/sprint-2-report.md`: Chapter V updates and section 5.2.2 (Sprint 2) of the project report, in Spanish.
- `CHANGELOG.md`: release notes.

## Recommended Development Practices
- Keep each feature inside its bounded context; move code to `shared` only when it is truly cross-context.
- Preserve layer boundaries: presentation calls stores, stores call API clients, API clients extend `BaseApi`.
- Use English names in code, Conventional Commits, GitFlow (`feature/*` → `develop` → `release/*` → `main`) and
  Semantic Versioning.
- Add every user-facing text to both `src/locales/en.json` and `src/locales/es.json`.

## Team
AgroFlet Development Team (NexaWeb) · Software Engineering · UPC · 1ASI0730 Aplicaciones Web.

## License
See `LICENSE.md`.
