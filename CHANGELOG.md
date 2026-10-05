# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-10-05

### Fixed
- **Deployed Fake API:** data registered in the deployed application no longer disappears when Vercel answers the next
  request with another function instance (for example, a new driver now appears among the available drivers when
  registering a shipment). `api/index.js` keeps the data in an Upstash Redis database shared by every instance and
  serializes writes with a Redis lock; without a connected database it keeps the previous per-instance copy of the
  seed. See ADR-014 and the one-time setup in `README.md`.

## [1.0.0] - 2026-10-05

First version of the AgroFlet Frontend Web Application (Sprint 2, TB1).

### Added
- **Project setup:** Vue 3 + Vite 8 application with Pinia 4, Vue Router 5, Vue I18n 11, PrimeVue 5 (Material preset
  customized with the AgroFlet palette), PrimeFlex 4, PrimeIcons 8, Axios and Leaflet; environment variables typed in
  `vite-env.d.ts`.
- **Deployment:** Vercel configuration (`vercel.json`) that builds the application, serves it as a single-page
  application and routes `/api/v1/*` to a Vercel Function (`api/index.js`) running the Fake API over a copy of the seed
  data. Live at <https://agroflet-frontend-application.vercel.app>. A GitHub Actions workflow
  (`.github/workflows/deploy-github-pages.yml`) also publishes the application on GitHub Pages on every push to `main`,
  at <https://agroflet.github.io/Agroflet-frontend-application/>, using the Fake API on Vercel.
- **Fake API:** `json-server` database (`server/db.json`) with users of both roles, origins and destinations,
  vehicles, drivers, shipments in every status, status history, demonstrative positions, incidents and notifications;
  `/api/v1/*` routes, served in memory by the Vite server in `npm run dev` and `npm run preview`, and on its own by the
  `npm run server` script.
- **Shared context:** `BaseApi` (Axios instance, IAM interceptor, `paramsSerializer` compatible with json-server),
  `BaseEndpoint`, responsive layout with role-based navigation and mobile drawer, skip link, language switcher,
  footer with terms, about and landing links, page header, empty state, about, terms of service and not found views.
- **IAM context:** sign-up with role (US01), sign-in with generic error (US02), sign-out clearing every cached context
  (US03), password recovery with one-time link that expires in 30 minutes (US04), profile edition (US21), password
  change that closes the session (US22), preferred language per account (US23), segment access from the landing page
  (US34), an authentication guard with role checks and a sign-up notice that the public demo must not receive real
  passwords or personal data.
- **Fleet context:** vehicle registration with plate, capacity and body type validation (US05), vehicle list and edition
  with status locked while a shipment holds it (US06), driver registration with DNI, license and phone validation (US07)
  and availability of resources for dispatch (US08).
- **Shipments context:** shipment registration that reserves vehicle and driver and rolls back on failure (US09),
  dashboard with KPIs and active operations (US10), shipment detail with tabs (US11), delivery and cancellation with
  reason that release resources (US12), history with combined filters and inverted range validation (US15), search by
  code or plate (US16), start of transport with actual departure (US31) and status history.
- **Tracking context:** Leaflet map with planned routes and reported positions, date, source, demo flag and stale
  position warning (US17), planned route with straight-line distance (US18) and position registration with coordinate
  validation (US32).
- **Incidents context:** incident registration with idempotency key and one-time ETA recalculation (US13), incident
  history (US14), incident alerts (US19) and status change alerts (US20) per participant without duplicates, and a
  notifications view with read state.
- **Internationalization:** English (`en-US`, default) and Latin American Spanish (`es-419`) for every view, message,
  validation and page title.
- **Documentation:** `README.md`, `docs/user-stories.md` (RTM), `docs/adrs.md`, `docs/class-diagram.puml`,
  `docs/fake-api.openapi.yaml` (OpenAPI 3 description of the Fake API) and `docs/sprint-2-report.md`.
