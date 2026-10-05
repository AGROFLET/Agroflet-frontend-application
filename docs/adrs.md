# Architecture Decision Records (ADRs)

## Overview
This document records the key architectural decisions made for the AgroFlet Frontend Web Application. Each record
follows standard Architecture Decision Record practices (Michael Nygard and MADR conventions): context, decision and
consequences.

---

## Table of Contents
- [ADR-001: DDD layered architecture with five bounded contexts](#adr-001-ddd-layered-architecture-with-five-bounded-contexts)
- [ADR-002: Vue 3 with Composition API and Vite](#adr-002-vue-3-with-composition-api-and-vite)
- [ADR-003: Pinia setup stores as application services](#adr-003-pinia-setup-stores-as-application-services)
- [ADR-004: PrimeVue Material preset customized with the AgroFlet palette](#adr-004-primevue-material-preset-customized-with-the-agroflet-palette)
- [ADR-005: Centralized HTTP client, endpoint abstraction and assemblers](#adr-005-centralized-http-client-endpoint-abstraction-and-assemblers)
- [ADR-006: Fake API with json-server and emulated authentication during Sprint 2](#adr-006-fake-api-with-json-server-and-emulated-authentication-during-sprint-2)
- [ADR-007: Route protection by session and role](#adr-007-route-protection-by-session-and-role)
- [ADR-008: Internationalization with Vue I18n and per-account preferred language](#adr-008-internationalization-with-vue-i18n-and-per-account-preferred-language)
- [ADR-009: Shipment lifecycle and resource reservation as domain rules](#adr-009-shipment-lifecycle-and-resource-reservation-as-domain-rules)
- [ADR-010: Map with Leaflet and OpenStreetMap, separating planned route from reported positions](#adr-010-map-with-leaflet-and-openstreetmap-separating-planned-route-from-reported-positions)
- [ADR-011: Idempotent incidents and deduplicated notifications](#adr-011-idempotent-incidents-and-deduplicated-notifications)
- [ADR-012: Vercel hosting with the Fake API as a Vercel Function](#adr-012-vercel-hosting-with-the-fake-api-as-a-vercel-function)
- [ADR-013: GitHub Pages publication with GitHub Actions, using the Fake API on Vercel](#adr-013-github-pages-publication-with-github-actions-using-the-fake-api-on-vercel)

---

## ADR-001: DDD layered architecture with five bounded contexts

### Status
Accepted

### Context
AgroFlet coordinates the land transport of food between dispatchers and wholesale buyers. The domain model defined in
the project report separates identity and access, fleet resources, shipments (core domain), geographic tracking and
incidents with notifications. A structure by technical type (`components`, `views`, `services`) would mix those
concepts and leak business rules into views.

### Decision
Organize `src/` by bounded context (`iam`, `fleet`, `shipments`, `tracking`, `incidents`, plus `shared`), each one with
the four layers of the reference project:
1. **Domain**: entities, value objects and commands in plain JavaScript (`Shipment`, `Vehicle`, `ReportedPosition`).
2. **Application**: Pinia stores that orchestrate use cases (`useShipmentsStore.createShipment`).
3. **Infrastructure**: API clients, assemblers, session storage, guard and interceptor.
4. **Presentation**: views, components and route modules.

Contexts collaborate through application services (for example, the shipments store asks the fleet store to reserve
resources); presentation never calls HTTP clients directly.

### Consequences
- **Positive:** the ubiquitous language of the report (planned, in transit, reported position, incident) is visible in
  the code; each context can evolve independently and maps one-to-one to the future RESTful API controllers.
- **Negative:** more files (assemblers, commands) than a direct API-to-template approach; developers must respect the
  layer boundaries.

---

## ADR-002: Vue 3 with Composition API and Vite

### Status
Accepted

### Context
The course requires Vue for the Frontend Web Applications, and the team uses the `learning-center` reference project as
the baseline for structure and tooling.

### Decision
Use Vue 3.5 with `<script setup>` and the Composition API, built with Vite 8, as in the reference project. Views are
lazy-loaded from the route modules to keep the initial bundle small.

### Consequences
- **Positive:** fast development server, small production chunks per view and the same conventions as the reference.
- **Negative:** requires Node.js `^20.19.0` or `>=22.12.0`.

---

## ADR-003: Pinia setup stores as application services

### Status
Accepted

### Context
Use cases such as registering a shipment touch several aggregates: the shipment, its vehicle and driver, the status
history and the notifications of each participant. Putting that logic in views would duplicate it and make it hard to
explain and test.

### Decision
Each bounded context exposes one or more Pinia setup stores (`useIamStore`, `useFleetStore`, `useShipmentsStore`,
`useTrackingStore`, `useIncidentsStore`, `useNotificationsStore`). Actions return `{ok, errorCode}` results instead of
throwing, so views translate `errorCode` with the `errors.*` messages of the locale files. Every store has a `reset()`
that the sign-out use case calls to clear cached data.

### Consequences
- **Positive:** use cases live in one place, are reusable by several views, and errors are consistent and translatable.
- **Negative:** stores of different contexts depend on each other through actions, which must stay acyclic at module
  load time (stores are resolved inside the setup function).

---

## ADR-004: PrimeVue Material preset customized with the AgroFlet palette

### Status
Accepted

### Context
The course defines Material Design as the design language and PrimeVue as the component library. The AgroFlet style
guide defines Inter, Primary Green `#27AE60`, Action Green `#176B3A`, Navy `#0B3B60`, Accent Orange `#F39C12`, a 4 px
spacing grid and statuses that always combine icon, text and color.

### Decision
Use PrimeVue 5 with the Material preset extended through `definePreset`, setting the primary scale to Action Green
(`#176B3A`, accessible with white text) and the text of warning messages to the darker amber of the style guide
(`#B45309`, 4.9:1 on the message background, while the preset amber reaches only 2.6:1). Global design tokens
(`--agf-*`), typography and utility classes live in `src/style.css`; PrimeFlex provides the responsive grid. The
PrimeUI license key is read from `VITE_PRIME_UI_LICENSE_KEY`, as in the reference project.

### Consequences
- **Positive:** consistent look with the landing page, accessible contrast and fewer custom components.
- **Negative:** PrimeVue 5 shows a license notice until the team sets its free Community License key.

---

## ADR-005: Centralized HTTP client, endpoint abstraction and assemblers

### Status
Accepted

### Context
Every context consumes REST resources with the same base URL and authentication header, and the shape of the resources
must not leak into the domain.

### Decision
`BaseApi` creates the Axios instance from `VITE_AGROFLET_PLATFORM_API_URL`, registers `iamInterceptor` (Bearer token
from the stored session) and serializes arrays as repeated parameters (`id=1&id=2`), which json-server understands.
`BaseEndpoint` provides `getAll`, `getById`, `create`, `update`, `patch` and `delete`. Assemblers convert resources into
entities and entities into resources (for example, `UserAssembler` never keeps the password).

### Consequences
- **Positive:** replacing the Fake API by the ASP.NET Core API only requires changing environment variables and, where
  the contract differs, the API clients and assemblers.
- **Negative:** one more mapping layer to maintain.

---

## ADR-006: Fake API with json-server and emulated authentication during Sprint 2

### Status
Accepted (temporary until the RESTful API is deployed)

### Context
The first version of the web application must be deployed in Sprint 2, while the ASP.NET Core RESTful API (technical
stories TS01–TS26) is scheduled for the next sprint.

### Decision
Serve a Fake API with `json-server` 0.17 (`server/db.json`, `/api/v1/*` routes). Sign-in and sign-up are emulated over the
`users` collection and produce a client-side session (`agroflet.session` in `localStorage`, 8 hours). Password recovery
stores one-time tokens in `password-reset-requests`; since there is no e-mail service, the link is shown only in
development builds. `npm run dev` and `npm run preview` serve it at `/api/v1` from the Vite server (`vite.config.js`)
over an in-memory copy of `server/db.json`, so the application runs locally with one command and calls the same
relative base URL as in production. `npm run server` runs it alone at `http://localhost:3000/api/v1`, without
`--watch`, because the watch mode restarts the HTTP server between the consecutive writes of a use case.

### Consequences
- **Positive:** every user story of the sprint can be demonstrated end to end, and a local run needs no second
  terminal or port of its own.
- **Negative:** the Fake API is not secure (it returns stored passwords to the client) and must only contain demo data;
  it will be replaced by the RESTful API, which issues real tokens and never returns passwords. Data written through
  `npm run dev` returns to the seed when that server restarts, and in the deployed application whenever a new function
  instance starts (see ADR-012).

---

## ADR-007: Route protection by session and role

### Status
Accepted

### Context
Buyers must not access fleet management or shipment registration, anonymous users must not reach private views, and a
buyer must not learn that someone else's shipment exists.

### Decision
Route modules declare `meta.public`, `meta.guestOnly` and `meta.roles`. The global `authenticationGuard` restores the
session, redirects anonymous users to sign-in with a `redirect` query, keeps signed-in users away from guest pages and
sends users without the required role to the dashboard. Data access is scoped in the stores: shipments are requested by
`dispatcherId` or `buyerId`, and a shipment that does not belong to the user is shown as "not available" without
revealing whether it exists.

### Consequences
- **Positive:** navigation and data rules are enforced in one place each.
- **Negative:** client-side checks only protect the experience; the RESTful API must enforce the same rules.

---

## ADR-008: Internationalization with Vue I18n and per-account preferred language

### Status
Accepted

### Context
The course requires `en_US` (default) and `es_419` in every product; US23 requires that the preference is kept and that
content written by users is never translated automatically.

### Decision
Use Vue I18n 11 in Composition API mode with `en.json` and `es.json`. The active locale is stored in `localStorage`
(`agroflet.locale`) and in the user's `preferredLanguage`, applied on sign-in and changed from the header or the profile.
`<html lang>` is set to `en-US` or `es-419`, and page titles are translated. Notifications store a type and a payload
(codes, minutes, statuses) so that their texts are rendered in the reader's language.

### Consequences
- **Positive:** the same data is readable in both languages and screen readers use the right language.
- **Negative:** every new text needs both translations; characters such as `@` must be escaped as `{'@'}` in messages.

---

## ADR-009: Shipment lifecycle and resource reservation as domain rules

### Status
Accepted

### Context
The core domain defines the lifecycle `planned → in_transit → delivered`, cancellation from `planned` or `in_transit`
with a reason, and the reservation of the vehicle and driver when a shipment is registered.

### Decision
`Shipment` exposes intention-revealing methods (`startTransit`, `markAsDelivered`, `cancel`, `applyDelay`) that throw a
`ShipmentTransitionError` for invalid transitions; `validateForCreation(vehicle)` returns validation codes, including a
weight that exceeds the vehicle capacity. The shipments store reserves resources after creating the shipment, marks them
`in_route` when transport starts, releases them on delivery or cancellation and deletes the shipment if the reservation
fails, so no partial records remain. A vehicle held by a shipment cannot change its status or capacity.

### Consequences
- **Positive:** the rules from the acceptance criteria (US09, US12, US31, US06) are explicit and reusable.
- **Negative:** without server transactions the Fake API cannot guarantee atomicity under real concurrency; the RESTful
  API must implement the reservation in a single transaction (TS04).

---

## ADR-010: Map with Leaflet and OpenStreetMap, separating planned route from reported positions

### Status
Accepted

### Context
The course requires the use of an external third-party service, and the report requires that the map never presents an
invented or office location as the current truck position (US17, US18, US32).

### Decision
Use Leaflet with OpenStreetMap tiles as the external service. The planned route is drawn as a dashed line between the
georeferenced origin and destination and is labelled as planned (with its straight-line distance); reported positions
are dots with date, source and a demo-data label, the last one highlighted, and it is shown as outdated after
180 minutes. Positions are only registered by the dispatcher with the coordinates received from the driver; the browser
geolocation is never used.

### Consequences
- **Positive:** no API key is needed and the map communicates the limits of the data honestly.
- **Negative:** OpenStreetMap tiles depend on an external server and its usage policy; a production deployment should
  evaluate a tile provider with an SLA.

---

## ADR-011: Idempotent incidents and deduplicated notifications

### Status
Accepted

### Context
US13 requires that a repeated incident request does not duplicate the incident nor add the delay again, and US19/US20
require that each participant receives one notification per event.

### Decision
The incident dialog generates an idempotency key when it opens; `registerIncident` looks for an incident with the same
key before creating one, and only a new incident applies the delay to the estimated arrival. Notifications carry an
`eventKey` (`incident-{id}`, `status-change-{id}`) and `publish` skips recipients that already have that event.

### Consequences
- **Positive:** double clicks or retries do not change the ETA twice nor spam participants.
- **Negative:** the deduplication query adds one request per event in the Fake API; the RESTful API should enforce it
  with unique constraints.

---

## ADR-012: Vercel hosting with the Fake API as a Vercel Function

### Status
Accepted (the Fake API part is temporary until the RESTful API is deployed)

### Context
Sprint 2 requires the web application to be published at a public URL and working against its API. During the sprint
that API is the `json-server` Fake API (ADR-006), so it must be reachable from the deployed application too. The
single-page application uses history mode, so every internal route must return `index.html`.

### Decision
Host the application on Vercel (project `agroflet-frontend-application`,
<https://agroflet-frontend-application.vercel.app>). `vercel.json` runs `npm run build`, publishes `dist/`, routes
`/api/v1/*` to the Vercel Function in `api/index.js` and rewrites every other path to `index.html`. The function runs
`json-server` with the routes of `server/routes.json` over a copy of `server/db.json` in the temporary directory,
because the deployment file system is read-only. Production builds use the relative base URL `/api/v1`
(`.env.production`), so the application and its API share one origin.

Alternatives considered: Firebase Hosting for the application plus a Node.js web service (for example Render) for the
Fake API, which needs two platforms, CORS and a free tier that sleeps; and GitHub Pages, which cannot run the Fake API
and needs a workaround for history routes.

### Consequences
- **Positive:** one public HTTPS URL for the application and its Fake API, no CORS configuration, history routes that
  survive a reload, and preview deployments per pull request once the repository is connected to the project.
- **Negative:** data written to the deployed Fake API lasts only while a function instance is alive and is not shared
  between instances; the deployed Fake API is public, so the sign-up form warns visitors not to use a real password or
  personal data; and, as in every production build, the password reset link is not shown on screen. The RESTful API
  replaces the function in the next sprint by changing `VITE_AGROFLET_PLATFORM_API_URL`.

---

## ADR-013: GitHub Pages publication with GitHub Actions, using the Fake API on Vercel

### Status
Accepted (complements ADR-012)

### Context
The team also wants the application published from its own GitHub repository, so that every release merged into
`main` is visible at a GitHub URL without depending on a personal account in another platform. GitHub Pages serves a
repository as a project site under `https://agroflet.github.io/Agroflet-frontend-application/`, only serves static
files and answers unknown paths with `404.html`, which is why ADR-012 did not choose it as the only host.

### Decision
Add a GitHub Actions workflow (`.github/workflows/deploy-github-pages.yml`) that runs on every push to `main` and on
demand. It builds the application with the repository name as base path (`--base "/Agroflet-frontend-application/"`),
sets `VITE_AGROFLET_PLATFORM_API_URL` to the Fake API deployed on Vercel (ADR-012), copies `index.html` to `404.html`
so that history routes open the application after a reload, and deploys `dist/` with the official
`actions/upload-pages-artifact` and `actions/deploy-pages` actions. The repository uses *Settings > Pages > Source:
GitHub Actions*. The router (`createWebHistory(import.meta.env.BASE_URL)`) and the asset URLs follow the base path, so
the same code runs at the root of a domain (Vercel, local) and under a subpath (GitHub Pages).

Alternatives considered: publishing the `dist/` folder from a `gh-pages` branch, which mixes build output with the
source history and needs a token to push it; and hash routes (`createWebHashHistory`), which avoid the 404 page but
change every URL of the application, including the segment links used by the landing page.

### Consequences
- **Positive:** each release merged into `main` is published automatically, the run and its URL appear in the
  repository (*Actions*, *Environments*), and no other account or secret is needed.
- **Negative:** GitHub Pages answers reloaded internal routes with HTTP status 404 although the page works, the
  application depends on the Vercel deployment for its data (two origins, so the Fake API must keep answering
  cross-origin requests, which `json-server` does by default), and data written from either URL goes to the same Fake
  API. When the RESTful API is deployed, the repository variable `AGROFLET_PLATFORM_API_URL` points the build to it.
