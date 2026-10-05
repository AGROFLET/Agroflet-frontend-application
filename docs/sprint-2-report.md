# AgroFlet · Sprint 2 (TB1): contenido para el Project Report

Este documento reúne el contenido del Capítulo V del informe que corresponde a la entrega **TB1 – Stage Review**: la
actualización de la sección 5.1 para la Frontend Web Application y la sección **5.2.2. Sprint 2** con sus ocho
subsecciones, en el orden que exige el enunciado del trabajo final. Está pensado para copiarse al repositorio del
Project Report.

Los textos marcados como `[COMPLETAR: …]` son datos que solo el equipo conoce o produce (fechas de reuniones, capturas,
video, analíticas de GitHub y retroalimentación del docente). Las asignaciones de líderes y responsables son una
**propuesta** basada en los roles del Sprint 1: el equipo debe confirmarlas o ajustarlas antes de la entrega, porque
cada integrante debe poder explicar en la exposición la parte que se le atribuye.

**Aplicación desplegada:** https://agroflet-frontend-application.vercel.app · **Fake API desplegada:**
https://agroflet-frontend-application.vercel.app/api/v1 · **Aplicación en GitHub Pages:**
https://agroflet.github.io/Agroflet-frontend-application/

---

## Registro de Versiones del Informe (fila TB1)

| Versión | Fecha | Autor | Descripción de modificación |
|:--|:--|:--|:--|
| TB1 | `[COMPLETAR: fecha]` | Alca Morán, César Alejandro<br>Centeno León, Adriano Samir<br>Rivas Méndez, Bernie Aarón<br>Rivas Castillo, Christoper Steven<br>Tello Lima, Jose Alejandro | Actualización de 5.1.1 a 5.1.4 con las herramientas, el repositorio, las convenciones y la configuración de despliegue de la Frontend Web Application. Adición de 5.2.2. Sprint 2 (5.2.2.1 a 5.2.2.8). Corrección del usuario de GitHub de Rivas Castillo, Christoper Steven (`CODERT0PH`) en la matriz LACX. `[COMPLETAR: otras correcciones por retroalimentación de AV1]` |

## Project Report Collaboration Insights (TB1)

`[COMPLETAR: explicar cómo se distribuyó la redacción del informe en TB1 y agregar las capturas de Insights > Contributors y del historial de commits del repositorio del informe. Todos los integrantes deben tener commits en el informe.]`

## Student Outcome (TB1)

En el cuadro del Anexo A, agregar en cada celda de "Acciones realizadas" el bloque **TB1** de cada integrante con las
acciones concretas del Sprint 2 (por ejemplo, el aspecto que lideró según la matriz LACX, las tareas del Sprint
Backlog que implementó y las revisiones de Pull Requests que realizó), y ampliar las conclusiones grupales.
`[COMPLETAR por cada integrante]`

---

## 5.1. Software Configuration Management (actualización TB1)

### 5.1.1. Software Development Environment Configuration

Se agregan las herramientas utilizadas en el Sprint 2 para la Frontend Web Application:

| Actividad | Herramienta | Propósito en AgroFlet | Referencia |
|:--|:--|:--|:--|
| Software Development | WebStorm / Visual Studio Code | IDE para el proyecto Vue; el formato se estandariza con `.editorconfig`. | https://www.jetbrains.com/webstorm/ · https://code.visualstudio.com/ |
| Software Development | Node.js (`^20.19.0` o `>=22.12.0`) y npm | Entorno de ejecución, gestión de dependencias (`npm install`) y scripts (`npm run dev`, `npm run build`, `npm run server`). | https://nodejs.org/ |
| Software Development | Vite 8 | Servidor de desarrollo y empaquetado de producción. | https://vite.dev/ |
| Software Development | Vue 3.5 (Composition API) | Framework de la aplicación web, organizado por bounded contexts. | https://vuejs.org/ |
| Software Development | Pinia 4 | Stores que actúan como servicios de aplicación de cada bounded context. | https://pinia.vuejs.org/ |
| Software Development | Vue Router 5 | Rutas por bounded context, carga diferida y guard de autenticación y rol. | https://router.vuejs.org/ |
| Software Development | Vue I18n 11 | Internacionalización `en-US` (predeterminado) y `es-419`. | https://vue-i18n.intlify.dev/ |
| Software Development | PrimeVue 5 (preset Material), PrimeFlex 4 y PrimeIcons 8 | Componentes de interfaz Material Design con la paleta de AgroFlet, grilla responsive e íconos. | https://primevue.org/ |
| Software Development | Axios 1 | Cliente HTTP (`BaseApi`, `BaseEndpoint`). | https://axios-http.com/ |
| Software Development | Leaflet 1.9 y OpenStreetMap | Mapa de rutas planificadas y posiciones reportadas (servicio externo de terceros). | https://leafletjs.com/ · https://www.openstreetmap.org/ |
| Software Development | json-server 0.17 | Fake API del Sprint 2 (`server/db.json`, rutas `/api/v1/*`). | https://github.com/typicode/json-server |
| Software Deployment | Vercel (integración con GitHub o Vercel CLI) | Publicación de la Frontend Web Application y de la Fake API como Vercel Function en un mismo dominio (`vercel.json`, `api/index.js`). | https://vercel.com/docs |
| Software Deployment | Upstash Redis (Marketplace de Vercel, plan gratuito) | Base de datos compartida por las instancias de la Vercel Function, donde la Fake API desplegada guarda sus datos. | https://upstash.com/docs/redis |
| Software Documentation | PlantUML | Diagrama de clases por bounded context (`docs/class-diagram.puml`). | https://plantuml.com/ |
| Software Documentation | OpenAPI 3 / Swagger Editor | Documentación de los endpoints de la Fake API (`docs/fake-api.openapi.yaml`). | https://editor.swagger.io/ |

### 5.1.2. Source Code Management

**Repositorio de la Frontend Web Application:** https://github.com/AGROFLET/Agroflet-frontend-application
(organización: https://github.com/AGROFLET).

**Estructura del repositorio** (basada en el proyecto de referencia `learning-center` del curso):

```text
Agroflet-frontend-application/
├── .github/workflows/       # GitHub Actions: publicación de la aplicación en GitHub Pages
├── api/                     # Vercel Function que sirve la Fake API en la aplicación desplegada
├── docs/                    # adrs.md, class-diagram.puml, user-stories.md, fake-api.openapi.yaml, sprint-2-report.md
├── public/                  # favicon, logo e imágenes del equipo
├── server/                  # Fake API: db.json, routes.json, start.sh
├── src/
│   ├── iam/                 # Identity & Access Management
│   ├── fleet/               # Fleet & Resource Management
│   ├── shipments/           # Shipment & Dispatch Operations (core)
│   ├── tracking/            # Real-Time Tracking & Route Telemetry
│   ├── incidents/           # Incident, Alert & Audit Management
│   ├── shared/              # BaseApi, BaseEndpoint, layout y vistas compartidas
│   ├── locales/             # en.json, es.json
│   └── app.vue, main.js, router.js, pinia.js, i18n.js, style.css
├── .env.development, .env.production, vite-env.d.ts
├── vercel.json, vite.config.js, package.json, package-lock.json
└── README.md, CHANGELOG.md, LICENSE.md
```

Cada bounded context mantiene las capas `domain/model`, `application`, `infrastructure` y `presentation`.

**GitFlow.** Se aplican las mismas ramas definidas en el Sprint 1: `main` (producción), `develop` (integración),
`feature/*`, `release/*` y `hotfix/*`. En este repositorio:

1. Crear `develop` a partir de `main` (el repositorio inició con un único commit en `main`).
2. Rivas Castillo, Christoper Steven crea las ramas `feature/*` desde `develop`. Cada integrante sube los commits de su
   parte del Sprint 2 desde su propia cuenta, y cada rama llega a `develop` por un Pull Request que revisa otro
   integrante. Las ramas siguen las tareas del Sprint Backlog (5.2.2.3):
   - `feature/project-setup` y `feature/iam-incidents-and-deployment`: Rivas Castillo, Christoper Steven.
   - `feature/fake-api-and-fleet`: Tello Lima, Jose Alejandro.
   - `feature/shared-ui-and-tracking`: Rivas Méndez, Bernie Aarón.
   - `feature/shipment-operations`: Alca Morán, César Alejandro.
   - `feature/i18n-profile-and-docs`: Centeno León, Adriano Samir.
3. `feature/project-setup` se integra primero y `feature/iam-incidents-and-deployment` al final, porque conecta los
   bounded contexts en `main.js` y `router.js`. Los Pull Requests se fusionan con **merge commit** (no *squash*) para
   conservar los commits individuales que se citan en 5.2.2.4.
4. Crear `release/v1.0.0` desde `develop`, validar `npm run build`, completar la tabla de 5.2.2.4, fusionar en `main` y
   en `develop`, y etiquetar `v1.0.0`.
5. Para los siguientes Sprints, cada integrante trabaja en ramas `feature/<bounded-context>-<funcionalidad>` (por
   ejemplo `feature/shipments-history-filters`).

**Semantic Versioning 2.0.0.** `v1.0.0` es la primera versión de la Frontend Web Application (Sprint 2); el detalle está
en `CHANGELOG.md` (formato Keep a Changelog).

**Conventional Commits.** Mensajes en inglés con el bounded context como *scope*, por ejemplo:
`feat(shipments): add shipment lifecycle with resource reservation`, `feat(i18n): add English and Latin American
Spanish translations`, `docs: add user stories, ADRs and class diagram`.

### 5.1.3. Source Code Style Guide & Conventions

Se mantienen los principios del Sprint 1 (nombres en inglés, DRY, KISS, `.editorconfig`) y se agregan las
convenciones de la aplicación Vue:

- **Guías:** Vue.js Style Guide (reglas esenciales y fuertemente recomendadas), Google JavaScript Style Guide y
  JSDoc para documentar clases, stores y servicios.
- **Archivos:** `kebab-case` con sufijo de rol, como en el proyecto de referencia: `shipment.entity.js`,
  `shipment.assembler.js`, `shipments-api.js`, `shipments.store.js`, `sign-in.command.js`, `shipment-detail.vue`,
  `shipments-routes.js`.
- **Nombres:** `PascalCase` para clases (`Shipment`, `ReportedPosition`), `camelCase` para funciones y variables
  (`startTransit`, `applyIncidentDelay`), `UPPER_SNAKE_CASE` para constantes (`STALE_POSITION_MINUTES`) y `use…Store`
  para los stores (`useShipmentsStore`).
- **Capas:** las vistas solo llaman a stores; los stores orquestan entidades y clientes de API; los clientes extienden
  `BaseApi` y usan `BaseEndpoint`; las reglas de negocio viven en las entidades.
- **Vue:** `<script setup>`, componentes con prefijo `pv-` para PrimeVue, estilos `scoped` y tokens globales `--agf-*`.
- **Indentación:** 2 espacios en `.vue`, `.json`, `.css` y `.html`; 4 espacios en módulos `.js` (como la referencia).
- **i18n:** ningún texto visible queda en el código; las claves en `kebab-case` se agregan a `en.json` y `es.json`.
- **Accesibilidad:** etiquetas visibles asociadas a cada control (`for`/`input-id`, `aria-labelledby`), mensajes de
  error con `role="alert"`, `aria-label` en botones de solo ícono, enlace para saltar al contenido, foco visible y
  estados con ícono, texto y color.

### 5.1.4. Software Deployment Configuration

**Frontend Web Application y Fake API (Vercel).** Ambas se publican en el proyecto de Vercel
`agroflet-frontend-application`, con la URL de producción https://agroflet-frontend-application.vercel.app
(decisión registrada en `docs/adrs.md`, ADR-012).

- `vercel.json` ejecuta `npm run build`, publica la carpeta `dist/`, envía `/api/v1/*` a la Vercel Function
  `api/index.js` y reescribe las demás rutas a `index.html` (modo *history* de Vue Router).
- La Vercel Function ejecuta json-server con las rutas de `server/routes.json` y guarda los datos en una base Upstash
  Redis conectada al proyecto (decisión registrada en `docs/adrs.md`, ADR-014). Vercel puede atender peticiones
  seguidas con instancias distintas de la función y detiene las que no se usan, así que una copia de `server/db.json`
  por instancia perdía los registros: un conductor recién registrado no aparecía al registrar una operación. Cada
  petición carga los datos desde Redis y la que los modifica toma un bloqueo breve en Redis hasta guardar el cambio, de
  modo que todas las instancias ven los mismos datos y las escrituras en paralelo no se pisan. Mientras no se guarde
  ningún cambio se sirven los datos de `server/db.json`; para volver a ellos se borra la clave `agroflet-fake-api:db` de
  la base. Sin la base conectada, la función vuelve a usar una copia de los datos por instancia.
- Configuración única de la base: en el proyecto de Vercel, *Storage* → crear una base Upstash (Redis, plan gratuito,
  en una región del este de EE. UU., cerca de la región `iad1` de la función) → conectarla al proyecto. La integración
  agrega `KV_REST_API_URL` y `KV_REST_API_TOKEN`, que la función lee sin dependencias adicionales; después se vuelve a
  desplegar.
- `.env.production` define `VITE_AGROFLET_PLATFORM_API_URL=/api/v1`: la aplicación y su Fake API comparten el dominio,
  por lo que no se configura CORS.
- La clave de licencia de PrimeUI (`VITE_PRIME_UI_LICENSE_KEY`, licencia Community gratuita para estudiantes:
  https://primeui.dev/licenses/community) se registra como variable de entorno del proyecto en Vercel (Production) y no
  en el repositorio; las variables de Vercel tienen prioridad sobre el valor vacío de `.env.production`.
- Procedimiento: conectar el repositorio de GitHub al proyecto de Vercel (*Settings > Git*), de modo que cada push a
  `main` despliegue a producción y cada Pull Request genere una URL de vista previa; o bien, con Vercel CLI:
  `npm install -g vercel` → `vercel login` → `vercel link` → `vercel --prod`.
- La Fake API desplegada es pública y sus datos los comparten todos los visitantes: el formulario de registro advierte
  que no se usen contraseñas reales ni datos personales, y el enlace de restablecimiento de contraseña solo se muestra
  en construcciones de desarrollo.

**Frontend Web Application en GitHub Pages (GitHub Actions).** La misma aplicación se publica desde el repositorio en
https://agroflet.github.io/Agroflet-frontend-application/ (decisión registrada en `docs/adrs.md`, ADR-013).

- El workflow `.github/workflows/deploy-github-pages.yml` se ejecuta en cada push a `main` (por ejemplo, al fusionar el
  Pull Request del release) y a pedido desde la pestaña *Actions* (*Run workflow*).
- Ejecuta `npm ci` y `npm run build -- --base "/Agroflet-frontend-application/"`, porque GitHub Pages sirve el sitio del
  proyecto bajo el nombre del repositorio; el router y las rutas de las imágenes usan esa base
  (`import.meta.env.BASE_URL`).
- GitHub Pages solo sirve archivos estáticos, así que la construcción define `VITE_AGROFLET_PLATFORM_API_URL` con la
  URL de la Fake API de Vercel, que acepta solicitudes de otros dominios (json-server habilita CORS por defecto).
- Copia `index.html` como `404.html`: GitHub Pages responde las rutas internas recargadas con ese archivo, de modo que
  la aplicación abre la ruta correcta aunque el estado HTTP sea 404.
- Publica `dist/` con las acciones oficiales `actions/upload-pages-artifact` y `actions/deploy-pages`.
- Configuración única del repositorio: *Settings > Pages > Build and deployment > Source: GitHub Actions*. Variables
  opcionales del repositorio (*Settings > Secrets and variables > Actions > Variables*): `AGROFLET_PLATFORM_API_URL`
  (otra URL del API) y `PRIME_UI_LICENSE_KEY` (clave de PrimeUI).

**Web Services (RESTful API).** Sin cambios respecto del Sprint 1: se implementarán con ASP.NET Core en el siguiente
Sprint; entonces solo se actualiza `VITE_AGROFLET_PLATFORM_API_URL` (y, donde el contrato difiera, los clientes de API y
assemblers).

---

## 5.2.2. Sprint 2

Durante el Sprint 2 el equipo implementó la primera versión (v1.0.0) de la Frontend Web Application de AgroFlet con Vue
3, Vite, Pinia, Vue Router, Vue I18n, PrimeVue y Axios, organizada por los bounded contexts definidos en el Capítulo IV
y conectada a una Fake API con json-server. La aplicación cubre las User Stories de la aplicación web del Product
Backlog: autenticación y cuenta, flota y conductores, ciclo de vida de las operaciones, historial y búsqueda, mapa con
ruta planificada y posiciones reportadas, incidencias con recálculo de llegada, notificaciones, perfil e idioma.

### 5.2.2.1. Sprint Planning 2

La reunión de planificación definió el objetivo del Sprint a partir del resultado del Sprint 1 (Landing Page v1.0.0) y
seleccionó las User Stories de la aplicación web, junto con la US28 reprogramada desde el Sprint 1.

| Sprint # | Sprint 2 |
|:--|:--|
| **Sprint Planning Background** | |
| Date | `[COMPLETAR: YYYY-MM-DD]` |
| Time | `[COMPLETAR: HH:MM AM/PM]` |
| Location | `[COMPLETAR: p. ej. Google Meet (reunión virtual)]` |
| Prepared By | `[COMPLETAR: Apellidos, Nombres]` |
| Attendees (to planning meeting) | Alca Morán, César Alejandro / Centeno León, Adriano Samir / Rivas Méndez, Bernie Aarón / Rivas Castillo, Christoper Steven / Tello Lima, Jose Alejandro |
| Sprint 1 Review Summary | En el Sprint 1 se publicó la versión v1.0.0 de la Landing Page en GitHub Pages (https://agroflet.github.io/Agroflet-landing-page/) con la propuesta de valor, las funcionalidades proyectadas, los planes, los testimonios, el equipo, los videos, los términos y condiciones, la internacionalización español/inglés y el diseño responsive. La US28 (Contacto) quedó en proceso y se reprograma para este Sprint. `[COMPLETAR: retroalimentación del docente / Product Owner sobre AV1]` |
| Sprint 1 Retrospective Summary | El equipo valoró el trabajo en ramas `feature/*` con Pull Requests y revisión cruzada, que redujo los conflictos en archivos compartidos. Como oportunidades de mejora identificó mantener la coherencia entre lo descrito en el informe y lo implementado y afinar la estimación de los Story Points. `[COMPLETAR/AJUSTAR con las opiniones del equipo]` |
| **Sprint Goal & User Stories** | |
| Sprint 2 Goal | **Our focus is on** publicar la primera versión de la Frontend Web Application de AgroFlet, en la que el despachador registra su flota, programa operaciones de transporte, inicia el traslado, reporta incidencias y posiciones y cierra cada operación, mientras el comprador mayorista sigue los envíos dirigidos a él con su ruta planificada, sus posiciones reportadas y alertas, en inglés y en español latinoamericano.<br>**We believe it delivers** visibilidad y control del ciclo de vida de cada flete a los despachadores (acopiadores y productores) y anticipación para coordinar la recepción a los compradores mayoristas, sin depender de llamadas y mensajes dispersos.<br>**This will be confirmed when** un despachador, desde la URL pública de la aplicación, registra una operación con un vehículo y un conductor disponibles y la lleva de `planned` a `delivered` registrando al menos una incidencia, y el comprador asociado ve el cambio de estado, la nueva llegada estimada y las notificaciones correspondientes, tanto en escritorio como en un dispositivo móvil. |
| Sprint 2 Velocity | 84 Story Points `[AJUSTAR si el equipo acordó otro valor]` |
| Sum of Story Points | 84 (81 de las 27 User Stories de la aplicación web + 3 de la US28 reprogramada) |

User Stories incluidas: US01, US02, US03, US04, US05, US06, US07, US08, US09, US10, US11, US12, US13, US14, US15, US16,
US17, US18, US19, US20, US21, US22, US23, US31, US32, US33, US34 y US28.

### 5.2.2.2. Aspect Leaders and Collaborators

En este Sprint los aspectos corresponden a los bounded contexts de la aplicación web y a tres aspectos transversales:
la interfaz compartida y su accesibilidad, la internacionalización con la documentación, y la Fake API con el
despliegue. La matriz es una **propuesta** que continúa los roles del Sprint 1 (Bernie Rivas en UI/UX, Adriano Centeno
en documentación, Jose Tello en despliegue, César Alca en el desarrollo principal); el equipo debe confirmarla.

| Team Member (Last Name, First Name) | GitHub Username | IAM | Fleet & Resource Management | Shipment & Dispatch Operations | Real-Time Tracking & Route Telemetry | Incident, Alert & Audit Management | Shared UI/UX & Accessibility | i18n & Documentation | Fake API & Deployment |
|:--|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Alca Morán, César Alejandro | almocesar-cell | C | C | **L** | C | C | C | C | C |
| Centeno León, Adriano Samir | Adri11-dk | C | C | C | C | C | C | **L** | C |
| Rivas Méndez, Bernie Aarón | ARivas3008 | C | C | C | **L** | C | **L** | C | C |
| Rivas Castillo, Christoper Steven | CODERT0PH | **L** | C | C | C | **L** | C | C | C |
| Tello Lima, Jose Alejandro | j4ndrow | C | **L** | C | C | C | C | C | **L** |

L: Leader. C: Collaborator. La selección de tareas del Sprint Backlog sigue esta distribución.

### 5.2.2.3. Sprint Backlog 2

El objetivo del Sprint 2 es publicar la primera versión de la Frontend Web Application integrada con la Fake API. Las
User Stories se descompusieron en tareas por bounded context, más las tareas transversales de configuración,
interfaz, internacionalización, documentación y despliegue.

`[COMPLETAR: captura del board del Sprint 2 en Jira]`

URL pública del board: `[COMPLETAR]`

Los estados reflejan el trabajo integrado en los Pull Requests del Sprint 2; las tareas que dependen de acciones del
equipo fuera de este repositorio (Landing Page) figuran como *To-do* hasta completarse.

| Sprint # | Sprint 2 | | | | | | |
|:--|:--|:--|:--|:--|:--:|:--|:--|
| **Story Id** | **Story Title** | **Task Id** | **Task Title** | **Task Description** | **Estimation (Hours)** | **Assigned To** | **Status** |
| — | Tareas transversales | T01 | Configuración del proyecto | Proyecto Vue 3 + Vite con la estructura por bounded contexts del proyecto de referencia, dependencias, variables de entorno tipadas y `.editorconfig`. | 4 | Rivas Castillo, Christoper Steven | Done |
| — | Tareas transversales | T02 | Fake API con json-server | Datos de demostración (`db.json`) de usuarios, ubicaciones, flota, operaciones, historial, posiciones, incidencias y notificaciones; rutas `/api/v1/*` y script `npm run server`. | 4 | Tello Lima, Jose Alejandro | Done |
| — | Tareas transversales | T03 | Infraestructura HTTP compartida | `BaseApi` con interceptor Bearer y serialización de parámetros, `BaseEndpoint` y utilitarios de respuesta. | 3 | Rivas Castillo, Christoper Steven | Done |
| — | Tareas transversales | T04 | Layout y vistas compartidas | Cabecera, navegación por rol, menú móvil, pie de página, vistas Nosotros y Página no encontrada. | 5 | Rivas Méndez, Bernie Aarón | Done |
| — | Tareas transversales | T05 | Tema visual Material | Preset de PrimeVue con la paleta de AgroFlet, tipografía Inter, tokens `--agf-*` y estados con ícono, texto y color. | 3 | Rivas Méndez, Bernie Aarón | Done |
| — | Tareas transversales | T06 | Internacionalización | Diccionarios `en.json` y `es.json`, títulos de página traducidos y atributo `lang` del documento. | 5 | Centeno León, Adriano Samir | Done |
| — | Tareas transversales | T07 | Documentación técnica | README, CHANGELOG, ADRs, User Stories con RTM, diagrama de clases y OpenAPI de la Fake API. | 6 | Centeno León, Adriano Samir | Done |
| — | Tareas transversales | T08 | Despliegue de la aplicación y de la Fake API | Configuración de Vercel (`vercel.json`), Fake API como Vercel Function (`api/index.js`) con los datos en Upstash Redis, `.env.production` con `/api/v1` y despliegue en https://agroflet-frontend-application.vercel.app; publicación en GitHub Pages con GitHub Actions. | 4 | Rivas Castillo, Christoper Steven | Done |
| US01 | Registro de cuenta | T09 | Vista de registro | Formulario con rol, datos de contacto, idioma y validaciones de correo, contraseña y teléfono. | 3 | Rivas Castillo, Christoper Steven | Done |
| US01 | Registro de cuenta | T10 | Caso de uso de registro | Rechazo de correo duplicado e indicación del siguiente paso (iniciar sesión). | 2 | Rivas Castillo, Christoper Steven | Done |
| US02 | Inicio de sesión | T11 | Vista de inicio de sesión | Formulario con error genérico que no revela la existencia de la cuenta. | 2 | Rivas Castillo, Christoper Steven | Done |
| US02 | Inicio de sesión | T12 | Sesión e interceptor | Sesión de 8 horas en `localStorage`, aplicación del idioma preferido y cabecera `Authorization: Bearer`. | 2 | Rivas Castillo, Christoper Steven | Done |
| US03 | Cierre de sesión | T13 | Cierre de sesión | Confirmación, invalidación de la sesión y limpieza de los datos de todos los stores. | 2 | Rivas Castillo, Christoper Steven | Done |
| US03 | Cierre de sesión | T14 | Guard de rutas | Redirección de usuarios anónimos al inicio de sesión y control de acceso por rol. | 3 | Rivas Castillo, Christoper Steven | Done |
| US04 | Recuperación de contraseña | T15 | Solicitud de recuperación | Respuesta genérica y token de un solo uso con vencimiento de 30 minutos. | 3 | Rivas Castillo, Christoper Steven | Done |
| US04 | Recuperación de contraseña | T16 | Restablecimiento de contraseña | Validación de token vencido o usado y cambio de contraseña. | 3 | Rivas Castillo, Christoper Steven | Done |
| US05 | Registro de vehículo | T17 | Formulario de vehículo | Placa con formato peruano, marca, modelo, año, capacidad positiva y tipo de carrocería. | 3 | Tello Lima, Jose Alejandro | Done |
| US05 | Registro de vehículo | T18 | Placa única por despachador | Rechazo de placas duplicadas en el ámbito del despachador. | 1 | Tello Lima, Jose Alejandro | Done |
| US06 | Consulta y edición de vehículos | T19 | Listado de vehículos | Tabla con estado operativo, capacidad y acceso a edición. | 2 | Tello Lima, Jose Alejandro | Done |
| US06 | Consulta y edición de vehículos | T20 | Edición con bloqueo por operación | Estado y capacidad bloqueados mientras el vehículo está reservado o en ruta. | 3 | Tello Lima, Jose Alejandro | Done |
| US07 | Registro de conductor | T21 | Conductores | Listado y formulario con DNI, licencia, categoría y teléfono validados. | 3 | Tello Lima, Jose Alejandro | Done |
| US07 | Registro de conductor | T22 | DNI único por despachador | Rechazo de DNI duplicado en el ámbito del despachador. | 1 | Tello Lima, Jose Alejandro | Done |
| US08 | Selección de recursos para el despacho | T23 | Selección de recursos | Vehículos y conductores disponibles primero; los no disponibles se muestran deshabilitados con su estado. | 2 | Tello Lima, Jose Alejandro | Done |
| US09 | Registro de operación programada | T24 | Formulario de operación | Carga, peso, origen, destino, comprador, vehículo, conductor, salida y llegada estimada. | 4 | Alca Morán, César Alejandro | Done |
| US09 | Registro de operación programada | T25 | Registro con reserva | Validación de capacidad, reserva de vehículo y conductor, historial, notificación y reversión ante fallos. | 4 | Alca Morán, César Alejandro | Done |
| US10 | Consulta de operaciones activas | T26 | Dashboard | Indicadores por estado y operaciones activas con carga, llegada estimada y última actualización. | 4 | Alca Morán, César Alejandro | Done |
| US10 | Consulta de operaciones activas | T27 | Mapa del dashboard | Mapa de las operaciones activas con selección sincronizada. | 3 | Rivas Méndez, Bernie Aarón | Done |
| US11 | Detalle de operación | T28 | Detalle con pestañas | Resumen, ruta planificada, posiciones, incidencias e historial de estados. | 4 | Alca Morán, César Alejandro | Done |
| US11 | Detalle de operación | T29 | Acceso de participantes | Operación ajena o inexistente sin revelar su existencia; el comprador no ve DNI ni teléfono del conductor. | 2 | Alca Morán, César Alejandro | Done |
| US12 | Cierre de operación | T30 | Entrega | Paso a `delivered` con fecha, historial y liberación de recursos. | 2 | Alca Morán, César Alejandro | Done |
| US12 | Cierre de operación | T31 | Cancelación con motivo | Motivo obligatorio, paso a `cancelled` y liberación de recursos; las operaciones terminales no se reabren. | 2 | Alca Morán, César Alejandro | Done |
| US13 | Registro de incidencia | T32 | Diálogo de incidencia | Tipo, descripción, retraso no negativo y fecha, con clave de idempotencia generada al abrir el diálogo. | 3 | Rivas Castillo, Christoper Steven | Done |
| US13 | Registro de incidencia | T33 | Recálculo de llegada | El retraso se suma una sola vez; un reintento con la misma clave no duplica la incidencia. | 2 | Rivas Castillo, Christoper Steven | Done |
| US14 | Historial de incidencias | T34 | Historial de incidencias | Lista por fecha con tipo, descripción e impacto, y estado vacío. | 2 | Rivas Castillo, Christoper Steven | Done |
| US15 | Historial con filtros | T35 | Filtros combinados | Fechas, estado, carga y destino, con chips de filtros activos y error de rango invertido. | 4 | Alca Morán, César Alejandro | Done |
| US16 | Búsqueda por código o placa | T36 | Búsqueda | Búsqueda por código de operación o placa con resultado vacío explícito. | 2 | Alca Morán, César Alejandro | Done |
| US17 | Posiciones en mapa | T37 | Mapa de posiciones | Leaflet con OpenStreetMap, fecha, fuente, etiqueta de dato demostrativo y aviso de posición desactualizada. | 5 | Rivas Méndez, Bernie Aarón | Done |
| US18 | Ruta planificada | T38 | Ruta planificada | Línea de referencia entre origen y destino con distancia en línea recta y aviso de ruta no disponible. | 3 | Rivas Méndez, Bernie Aarón | Done |
| US19 | Alertas por incidencia | T39 | Notificaciones de incidencia | Una notificación por participante y evento, sin duplicados. | 3 | Rivas Castillo, Christoper Steven | Done |
| US20 | Alertas por cambio de estado | T40 | Notificaciones de estado | Notificación por cambio de estado y vista de notificaciones con lectura individual y masiva. | 3 | Rivas Castillo, Christoper Steven | Done |
| US21 | Edición de perfil | T41 | Perfil | Edición de nombre, teléfono y empresa; rol y correo de solo lectura. | 2 | Centeno León, Adriano Samir | Done |
| US22 | Cambio de contraseña | T42 | Cambio de contraseña | Validación de la contraseña actual y cierre de sesión tras el cambio. | 2 | Centeno León, Adriano Samir | Done |
| US23 | Idioma de la aplicación | T43 | Idioma preferido | Selector en cabecera y perfil, preferencia por cuenta e inglés por defecto. | 2 | Centeno León, Adriano Samir | Done |
| US31 | Inicio del traslado | T44 | Inicio del traslado | Paso de `planned` a `in_transit` con fecha de salida efectiva y recursos en ruta. | 2 | Alca Morán, César Alejandro | Done |
| US32 | Registro de posición reportada | T45 | Registro de posición | Coordenadas en rango, fecha y fuente obligatoria; nunca se usa la ubicación del navegador. | 3 | Rivas Méndez, Bernie Aarón | Done |
| US33 | Términos del servicio | T46 | Términos del servicio | Alcance, contacto, aviso de simulación, privacidad (Ley N.° 29733), accesibilidad y ética profesional. | 2 | Centeno León, Adriano Samir | Done |
| US34 | Acceso por segmento desde landing | T47 | Acceso por segmento | Inicio de sesión y registro con `?segment=dispatcher` o `?segment=buyer`, sin otorgar permisos. | 1 | Rivas Castillo, Christoper Steven | Done |
| US34 | Acceso por segmento desde landing | T48 | CTAs del Landing Page | Actualizar los botones de cada segmento del Landing Page hacia la aplicación desplegada (repositorio del Landing Page). | 1 | Tello Lima, Jose Alejandro | To-do `[ACTUALIZAR]` |
| US28 | Contacto | T49 | Formulario de contacto | Envío con confirmación solo tras la recepción efectiva y mensaje de error ante fallos (repositorio del Landing Page). | 3 | Rivas Méndez, Bernie Aarón | To-do `[ACTUALIZAR]` |

### 5.2.2.4. Development Evidence for Sprint Review

En el Sprint 2 se implementó la Frontend Web Application v1.0.0: los cinco bounded contexts con sus capas de dominio,
aplicación, infraestructura y presentación; la Fake API; la internacionalización completa en inglés y español
latinoamericano; el diseño responsive con PrimeVue (Material); el despliegue en Vercel de la aplicación y de la Fake
API; la publicación en GitHub Pages con GitHub Actions, y la documentación técnica del repositorio. La construcción
de producción (`npm run build`) se ejecuta sin errores ni advertencias.

Commits del repositorio de la Frontend Web Application. Los identificadores y las fechas se completan desde el
historial de Git al preparar `release/v1.0.0`, después de fusionar los Pull Requests de las cinco partes:

<!-- development-evidence:start -->
| Repository | Branch | Commit Id | Commit Message | Commit Message Body | Commited on (Date) |
|---|---|---|---|---|---|
| AGROFLET/Agroflet-frontend-application | main | `8070a98` | Initial commit | — | 03/09/2026 |
| AGROFLET/Agroflet-frontend-application | feature/project-setup | `a5b9b77` | chore: set up Vue 3 and Vite project with DDD structure and tooling | Add Vue 3.5, Vite 8, Pinia 4, Vue Router 5, Vue I18n 11, PrimeVue 5, PrimeFlex, PrimeIcons, Axios, Leaflet and json-server, the development and production environment files typed in vite-env.d.ts, editorconfig, gitignore, license and the AgroFlet logo. The application calls the Fake API at /api/v1 on its own domain: the Vite server serves it in memory during npm run dev and npm run preview, so a local run needs a single command. | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/project-setup | `f296f1c` | feat(shared): add base API client and endpoint helpers | Add BaseApi, which creates the Axios client from VITE_AGROFLET_PLATFORM_API_URL, registers the IAM bearer interceptor and serializes repeated query parameters as json-server and ASP.NET Core expect, BaseEndpoint with the CRUD calls of a resource, and helpers that read plain or wrapped collections from API responses. | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/i18n-profile-and-docs | `d9c9e0c` | feat(i18n): add English and Latin American Spanish translations | Set up Vue I18n with en (default) and es messages for every view, validation, error, status and page title, and add the language switcher. The locale is kept per browser and per account, and html lang follows en-US or es-419 (US23). | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/i18n-profile-and-docs | `447ee00` | feat(iam): add profile settings with password change and preferred language | Add the profile view to edit name, phone and company with role and email read-only, change the password after checking the current one and closing the session, and choose the preferred language of the account (US21-US23). | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/i18n-profile-and-docs | `d4f558a` | feat(shared): add terms of service view | Add the terms of service with service scope, accounts and roles, geographic information, personal data under Law 29733, availability, accessibility and professional ethics, and a notice that tracking data is simulated (US33). | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/i18n-profile-and-docs | `5af5e78` | docs: add README, changelog, ADRs, user stories, class diagram and OpenAPI | Document setup, structure, bounded contexts, demo accounts, environment variables and the Vercel and GitHub Pages deployments, record the architecture decisions, and add the requirement traceability matrix with acceptance criteria, the PlantUML class diagram and the OpenAPI description of the Fake API. | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/i18n-profile-and-docs | `dc76c63` | docs(sprint-2): add Sprint 2 report for the project report | Add the Spanish content for chapter V of the project report: the TB1 updates of sections 5.1.1 to 5.1.4 and section 5.2.2 (Sprint planning, aspect leaders, sprint backlog, development, execution, services documentation and deployment evidence, and collaboration insights). Data only the team knows stays marked as [COMPLETAR]. | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/shipment-operations | `bbc662d` | feat(shipments): add shipment aggregate, lifecycle rules and API client | Add the Shipment aggregate with planned, in_transit, delivered and cancelled transitions, locations, status changes and the history filter, the ShipmentsApi client and the shipments store, which reserves vehicle and driver on registration, rolls back when the reservation fails and records every status change (US09, US12, US31). | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/shipment-operations | `58f0b1b` | feat(shipments): add dashboard and shipment registration form | Add the dashboard with KPIs by status, the map of active operations and their last update, and the registration form that lists available resources first, disables the unavailable ones and reports the capacity error (US08-US10). | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/shipment-operations | `dba1f5b` | feat(shipments): add shipment history, search and detail views | Add the history with combined filters, active filter chips, inverted range validation and search by code or plate, and the detail with summary, route, positions, incidents and status timeline, start of transport, delivery and cancellation with reason (US11, US12, US15, US16, US31). | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/fake-api-and-fleet | `842082e` | feat(fleet): add vehicle and driver registration, list and edit views | — | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/shared-ui-and-tracking | `5209d0b` | feat(fleet): add vehicle and driver registration, list and edit views | — | 04/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/iam-incidents-and-deployment | `3092f92` | feat(iam): add sign-up, sign-in, sign-out and password recovery | Add the User entity, commands and password policy, IamApi emulating authentication over the users collection, an 8-hour session with a Bearer interceptor, the authentication guard with role checks, sign-out that clears every bounded context, password recovery with a one-time link that expires in 30 minutes and segment access from the landing page (US01-US04, US34). The sign-up form warns that the public demo must not receive real passwords or personal data. | 05/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/iam-incidents-and-deployment | `c92022d` | feat(incidents): add idempotent incidents and participant notifications | Register incidents with an idempotency key and a one-time ETA recalculation, show the incident history, publish one notification per participant deduplicated by event key and add the notifications view with read state (US13, US14, US19, US20). | 05/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/iam-incidents-and-deployment | `7ee48f2` | feat(app): wire router, Pinia, I18n and PrimeVue into the application | Register the bounded context routes with lazy loading and the global authentication guard, translated page titles, Pinia, Vue I18n, the PrimeVue Material preset with the AgroFlet palette and the accessible amber of warning messages, and the toast and confirmation services. | 05/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/iam-incidents-and-deployment | `966a995` | build: deploy the application and the Fake API on Vercel | Add vercel.json to build the Vite application, serve it as a single-page application and route /api/v1/* to a Vercel Function that runs json-server over a copy of the seed database, so the deployed application and its Fake API share one domain. | 05/10/2026 |
| AGROFLET/Agroflet-frontend-application | feature/iam-incidents-and-deployment | `0a064c5` | ci: publish the application on GitHub Pages | Add a GitHub Actions workflow that runs on every push to main and on demand: it builds the application under the repository path, points it to the Fake API deployed on Vercel, copies index.html to 404.html so history routes open after a reload, and deploys dist/ to GitHub Pages. | 05/10/2026 |
<!-- development-evidence:end -->

`[COMPLETAR: capturas del código por bounded context y del Pull Request del Sprint 2]`

### 5.2.2.5. Execution Evidence for Sprint Review

La aplicación permite al despachador gestionar su flota y el ciclo completo de sus operaciones, y al comprador seguir
los envíos dirigidos a él, en escritorio y en móvil, en inglés o en español. Las capturas se toman desde la versión
desplegada (https://agroflet-frontend-application.vercel.app) con las cuentas de demostración (contraseña
`Agroflet2026`): `dispatcher@agroflet.pe` y `buyer@agroflet.pe`.

- Los datos registrados en la versión desplegada se guardan en Upstash Redis y son los mismos en la URL de Vercel y en
  la de GitHub Pages, por lo que una secuencia de capturas puede tomarse en varios momentos.
- La captura 3 se toma en local (`npm run dev`): sin servicio de correo en el Sprint 2, el enlace de
  restablecimiento de un solo uso solo se muestra en construcciones de desarrollo y nunca en la versión desplegada.

| # | Vista | Ruta | User Stories | Captura |
|:--:|:--|:--|:--|:--|
| 1 | Inicio de sesión por segmento | `/iam/sign-in?segment=dispatcher` | US02, US34 | `[COMPLETAR]` |
| 2 | Registro de cuenta con validaciones y aviso de demo pública | `/iam/sign-up?segment=buyer` | US01, US34 | `[COMPLETAR]` |
| 3 | Recuperación y restablecimiento de contraseña (en local) | `/iam/password-recovery`, `/iam/reset-password` | US04 | `[COMPLETAR]` |
| 4 | Dashboard del despachador con indicadores y mapa | `/dashboard` | US10, US17, US18 | `[COMPLETAR]` |
| 5 | Registro de operación (incluye error de capacidad) | `/shipments/new` | US08, US09 | `[COMPLETAR]` |
| 6 | Detalle de operación: resumen, ruta, posiciones, incidencias e historial | `/shipments/1` | US11, US14, US17, US18 | `[COMPLETAR]` |
| 7 | Inicio del traslado, entrega y cancelación con motivo | `/shipments/:id` | US12, US31 | `[COMPLETAR]` |
| 8 | Registro de incidencia y nueva llegada estimada | `/shipments/1` | US13 | `[COMPLETAR]` |
| 9 | Registro de posición reportada | `/shipments/1` | US32 | `[COMPLETAR]` |
| 10 | Historial con filtros, búsqueda por placa y rango invertido | `/shipments` | US15, US16 | `[COMPLETAR]` |
| 11 | Vehículos y edición bloqueada de un vehículo en ruta | `/fleet/vehicles` | US05, US06 | `[COMPLETAR]` |
| 12 | Conductores y validaciones | `/fleet/drivers` | US07 | `[COMPLETAR]` |
| 13 | Notificaciones del comprador | `/notifications` | US19, US20 | `[COMPLETAR]` |
| 14 | Dashboard y detalle del comprador (sin acciones ni DNI) | `/dashboard`, `/shipments/1` | US10, US11 | `[COMPLETAR]` |
| 15 | Perfil, idioma y cambio de contraseña | `/iam/profile` | US21, US22, US23 | `[COMPLETAR]` |
| 16 | Términos del servicio en español | `/terms` | US33 | `[COMPLETAR]` |
| 17 | Vista móvil con menú lateral | `/dashboard` | Responsive | `[COMPLETAR]` |

Video de navegación del Sprint 2: `[COMPLETAR: URL del video]`

### 5.2.2.6. Services Documentation Evidence for Sprint Review

En el Sprint 2 la aplicación consume una Fake API servida por json-server, que emula los contratos de las Technical
Stories TS01–TS26 mientras se implementa el RESTful API. Sus endpoints están documentados con OpenAPI 3 en
`docs/fake-api.openapi.yaml` (validado con Swagger CLI y Redocly), que puede abrirse en Swagger Editor
(https://editor.swagger.io) o en WebStorm para probar las llamadas con los datos de muestra contra cualquiera de los dos
servidores que declara. La documentación con Swagger del RESTful API (ASP.NET Core) corresponde al siguiente Sprint.

URL local base: `http://localhost:5173/api/v1`, que `npm run dev` sirve junto con la aplicación, o
`http://localhost:3000/api/v1` con `npm run server`, que levanta la Fake API sola. URL desplegada:
https://agroflet-frontend-application.vercel.app/api/v1 (Vercel Function con los datos en Upstash Redis).

| Endpoint | Verbo | Acción implementada | Sintaxis de llamada | Parámetros | Response | TS emulado |
|:--|:--:|:--|:--|:--|:--|:--|
| `/users` | GET | Buscar cuenta por correo (inicio de sesión, correo duplicado) o listar compradores | `GET /users?email=dispatcher@agroflet.pe` | `email`, `userType` | 200 con arreglo de usuarios (vacío si no hay coincidencias) | TS01, TS02 |
| `/users` | POST | Registrar cuenta | `POST /users` | Body: `firstName`, `lastName`, `email`, `password`, `userType`, `phone`, `companyName`, `preferredLanguage` | 201 con el usuario creado e `id` | TS01 |
| `/users/{id}` | GET | Consultar perfil | `GET /users/1` | `id` | 200 con el usuario; 404 si no existe | TS17 |
| `/users/{id}` | PATCH | Editar perfil, idioma o contraseña | `PATCH /users/1` | Body: campos editables | 200 con el usuario actualizado | TS18, TS23, TS24 |
| `/password-reset-requests` | POST / GET | Crear token de recuperación / validar token | `GET /password-reset-requests?token=…` | Body: `userId`, `token`, `expiresAt`, `used`; query `token` | 201 con la solicitud / 200 con arreglo | TS22, TS23 |
| `/password-reset-requests/{id}` | PATCH | Marcar token como usado | `PATCH /password-reset-requests/1` | Body: `used`, `usedAt` | 200 con la solicitud | TS23 |
| `/vehicles` | GET | Listar vehículos del despachador, validar placa | `GET /vehicles?dispatcherId=1` | `dispatcherId`, `plate`, `id` (repetible) | 200 con arreglo de vehículos | TS09 |
| `/vehicles` | POST | Registrar vehículo | `POST /vehicles` | Body: `plate`, `brand`, `model`, `year`, `capacityTons`, `bodyType`, `status` | 201 con el vehículo `available` | TS10 |
| `/vehicles/{id}` | GET / PATCH | Consultar, editar, cambiar estado, reservar o liberar | `PATCH /vehicles/3` | Body: campos editables o `status` | 200 con el vehículo | TS19, TS25 |
| `/drivers` | GET | Listar conductores, validar DNI | `GET /drivers?dispatcherId=1&dni=45879632` | `dispatcherId`, `dni` | 200 con arreglo de conductores | TS11 |
| `/drivers` | POST | Registrar conductor | `POST /drivers` | Body: `dni`, `licenseNumber`, `licenseCategory`, `phone`… | 201 con el conductor `available` | TS12 |
| `/drivers/{id}` | GET / PATCH | Consultar, asignar o liberar | `PATCH /drivers/3` | Body: `status` | 200 con el conductor | TS04, TS06 |
| `/locations` | GET | Listar orígenes y destinos georreferenciados | `GET /locations` | — | 200 con arreglo de ubicaciones | TS05 |
| `/shipments` | GET | Listar operaciones autorizadas | `GET /shipments?dispatcherId=1&_sort=plannedDepartureAt&_order=desc` | `dispatcherId` o `buyerId`, `_sort`, `_order`, `_limit` | 200 con arreglo de operaciones | TS03, TS13 |
| `/shipments` | POST | Registrar operación `planned` | `POST /shipments` | Body: carga, peso, ruta, comprador, recursos y fechas | 201 con la operación | TS04 |
| `/shipments/{id}` | GET | Consultar detalle | `GET /shipments/1` | `id` | 200 con la operación; 404 si no existe | TS05 |
| `/shipments/{id}` | PATCH | Iniciar, entregar, cancelar o recalcular llegada | `PATCH /shipments/1` | Body: `status` y fechas, `cancellationReason`, `estimatedArrivalAt` | 200 con la operación | TS06, TS07 |
| `/shipments/{id}` | DELETE | Revertir una operación cuya reserva falló | `DELETE /shipments/6` | `id` | 200 con objeto vacío | TS04 |
| `/status-changes` | GET / POST | Consultar y registrar el historial de estados | `GET /status-changes?shipmentId=1&_sort=changedAt&_order=asc` | `shipmentId`; Body: `previousStatus`, `newStatus`, `changedAt`, `changedBy`, `reason` | 200 con arreglo / 201 con el registro | TS20 |
| `/positions` | GET | Consultar posiciones de una o varias operaciones | `GET /positions?shipmentId=1&shipmentId=3&_sort=reportedAt&_order=asc` | `shipmentId` (repetible) | 200 con arreglo de posiciones | TS14 |
| `/positions` | POST | Registrar posición reportada | `POST /positions` | Body: `latitude`, `longitude`, `reportedAt`, `source`, `recordedBy`, `note` | 201 con la posición | TS26 |
| `/incidents` | GET | Historial de incidencias o búsqueda por clave de idempotencia | `GET /incidents?shipmentId=1&_sort=occurredAt&_order=desc` | `shipmentId`, `idempotencyKey` | 200 con arreglo (vacío si no hay) | TS07, TS08 |
| `/incidents` | POST | Registrar incidencia | `POST /incidents` | Body: `type`, `description`, `estimatedDelayMinutes`, `occurredAt`, `idempotencyKey` | 201 con la incidencia | TS07 |
| `/notifications` | GET / POST | Consultar notificaciones del usuario / publicar sin duplicados | `GET /notifications?recipientId=2&_sort=createdAt&_order=desc` | `recipientId`, `eventKey` | 200 con arreglo / 201 con la notificación | TS15 |
| `/notifications/{id}` | PATCH | Marcar como leída | `PATCH /notifications/1` | Body: `isRead`, `readAt` | 200 con la notificación | TS16 |

**Ejemplo de response** (`GET /shipments/1`): la operación AGF-0001 en tránsito, con su ruta (`originId`,
`destinationId`), recursos, fechas planificadas y efectivas, y la llegada estimada recalculada por la incidencia de 90
minutos.

```json
{
  "id": 1,
  "code": "AGF-0001",
  "dispatcherId": 1,
  "buyerId": 2,
  "cargoType": "potato",
  "cargoDescription": "Papa amarilla en sacos de 50 kg",
  "weightTons": 25,
  "originId": 1,
  "destinationId": 7,
  "vehicleId": 1,
  "driverId": 1,
  "status": "in_transit",
  "plannedDepartureAt": "2026-10-03T04:00:00.000Z",
  "estimatedArrivalAt": "2026-10-03T14:30:00.000Z",
  "actualDepartureAt": "2026-10-03T04:20:00.000Z",
  "deliveredAt": null,
  "cancelledAt": null,
  "cancellationReason": null,
  "createdAt": "2026-10-02T15:00:00.000Z",
  "updatedAt": "2026-10-03T11:30:00.000Z"
}
```

**Ejemplo de response** (`GET /notifications?recipientId=2&eventKey=incident-1`): la aplicación consulta el evento antes
de publicar para no duplicar la notificación del mismo destinatario (US19). El `payload` guarda códigos y valores, de
modo que el texto se muestra en el idioma de quien lo lee.

```json
[
  {
    "id": 1,
    "recipientId": 2,
    "shipmentId": 1,
    "shipmentCode": "AGF-0001",
    "type": "incident",
    "eventKey": "incident-1",
    "payload": {"incidentType": "road_block", "estimatedDelayMinutes": 90},
    "createdAt": "2026-10-03T08:12:00.000Z",
    "isRead": false,
    "readAt": null
  }
]
```

`[COMPLETAR: capturas de la interacción con docs/fake-api.openapi.yaml en Swagger Editor usando los datos de muestra]`

Repositorio: https://github.com/AGROFLET/Agroflet-frontend-application · Commits de documentación: ver la tabla de
5.2.2.4 (commits `docs`).

**Servicio externo de terceros.** El mapa consume las teselas de OpenStreetMap mediante Leaflet
(`https://tile.openstreetmap.org/{z}/{x}/{y}.png`), con la atribución exigida por su licencia (ODbL).

### 5.2.2.7. Software Deployment Evidence for Sprint Review

En el Sprint 2 se despliega en Vercel la primera versión de la Frontend Web Application junto con la Fake API que
consume, se publica la misma versión en GitHub Pages desde el repositorio y se publica una nueva versión del Landing
Page con los llamados a la acción hacia la aplicación.

1. **Proyecto de Vercel.** Se creó el proyecto `agroflet-frontend-application` (framework Vite). `vercel.json` define
   el comando de construcción (`npm run build`), la carpeta publicada (`dist/`), la Vercel Function de la Fake API
   (`api/index.js`, que incluye `server/*.json`) y las reescrituras: `/api/v1/*` hacia la función y cualquier otra ruta
   hacia `index.html`. `[COMPLETAR: captura del proyecto en el dashboard de Vercel]`
2. **Variables de producción.** `.env.production` fija `VITE_AGROFLET_PLATFORM_API_URL=/api/v1`, de modo que la
   aplicación llama a la Fake API en su propio dominio. La clave `VITE_PRIME_UI_LICENSE_KEY` (licencia Community) se
   registra en *Settings > Environment Variables* (Production) y no en el repositorio; después de agregarla se vuelve a
   desplegar. `[COMPLETAR: captura sin la clave visible]`
3. **Base de datos de la Fake API.** En *Storage* se crea una base Upstash (Redis, plan gratuito) y se conecta al
   proyecto, que recibe las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`; la Vercel Function guarda allí los datos
   para que todas sus instancias compartan los mismos. Después de conectarla se vuelve a desplegar.
   `[COMPLETAR: captura de la base conectada al proyecto, sin los valores de las variables]`
4. **Despliegue.** La versión de producción se publicó en https://agroflet-frontend-application.vercel.app. Para las
   siguientes versiones, conectar el repositorio de GitHub al proyecto (*Settings > Git*) para que cada push a `main`
   despliegue a producción y cada Pull Request genere una URL de vista previa, o desplegar con Vercel CLI
   (`npm install -g vercel`, `vercel login`, `vercel link`, `vercel --prod`).
   `[COMPLETAR: captura del despliegue en estado Ready]`
5. **Verificación.** En la URL pública se comprobó que la aplicación carga, que una ruta interna recargada (por ejemplo
   `/shipments/1`) devuelve `index.html`, que `GET /api/v1/locations` responde las 10 ubicaciones de muestra y que
   `GET /api/v1/shipments/1` responde la operación AGF-0001. Para la exposición: iniciar sesión con las cuentas de
   demostración, cambiar el idioma y revisar la vista móvil. `[COMPLETAR: capturas]`
6. **GitHub Pages.** En el repositorio se activa *Settings > Pages > Build and deployment > Source: GitHub Actions*. Al
   fusionar `release/v1.0.0` en `main`, el workflow *Deploy to GitHub Pages* construye la aplicación con la base
   `/Agroflet-frontend-application/` y la publica en https://agroflet.github.io/Agroflet-frontend-application/, donde
   consume la Fake API de Vercel. Verificar el inicio de sesión con las cuentas de demostración y que una ruta interna
   recargada abra la aplicación. `[COMPLETAR: captura de la ejecución en Actions y de la aplicación en GitHub Pages]`
7. **Landing Page.** Actualizar los llamados a la acción de cada segmento a
   `https://agroflet-frontend-application.vercel.app/iam/sign-up?segment=dispatcher` y
   `https://agroflet-frontend-application.vercel.app/iam/sign-up?segment=buyer` (o `sign-in`), publicar la nueva
   versión en GitHub Pages y etiquetarla según Semantic Versioning. `[COMPLETAR: captura y versión]`

URL de la Frontend Web Application: https://agroflet-frontend-application.vercel.app · En GitHub Pages:
https://agroflet.github.io/Agroflet-frontend-application/ · URL de la Fake API:
https://agroflet-frontend-application.vercel.app/api/v1 · Landing Page:
https://agroflet.github.io/Agroflet-landing-page/

### 5.2.2.8. Team Collaboration Insights during Sprint

La implementación se organizó por bounded contexts según la matriz LACX: cada líder fue responsable de las tareas de
su aspecto y los colaboradores revisaron los Pull Requests. Cada integrante subió su parte desde su cuenta en su propia
rama `feature/*` (ver 5.1.2); como las partes no comparten archivos, las ramas avanzaron en paralelo sobre `src/iam`,
`src/fleet`, `src/shipments`, `src/tracking` y `src/incidents` sin conflictos, con puntos de integración explícitos
en los stores. `[AJUSTAR a cómo trabajó realmente el equipo]`

`[COMPLETAR: capturas de Insights > Contributors, Insights > Commits y Network del repositorio de la Frontend Web Application, y del repositorio del Landing Page. Todos los integrantes deben tener participación en la implementación.]`

---

## Conclusiones (actualización TB1)

- La organización por bounded contexts del Capítulo IV se trasladó directamente a la estructura del código, lo que
  mantiene el lenguaje ubicuo (operación programada, en tránsito, posición reportada, incidencia) visible en las clases
  y facilita la integración posterior con el RESTful API.
- Las reglas de negocio de los criterios de aceptación (reserva de recursos, transiciones válidas, idempotencia de
  incidencias, notificaciones sin duplicados, honestidad de los datos geográficos) quedaron explícitas en el dominio y
  en los stores, y no dependen de la interfaz.
- Publicar la aplicación y su Fake API en un mismo dominio de Vercel evitó un segundo proveedor y la configuración de
  CORS; a cambio, los datos de demostración se reinician, lo que se resolverá con el RESTful API del siguiente Sprint.

## Bibliografía (referencias agregadas en TB1)

- Conventional Commits. (2019). *Conventional Commits 1.0.0*. https://www.conventionalcommits.org/
- GitHub. (s. f.). *GitHub Pages documentation*. https://docs.github.com/en/pages
- Intlify. (s. f.). *Vue I18n*. https://vue-i18n.intlify.dev/
- Leaflet. (s. f.). *Leaflet API reference*. https://leafletjs.com/reference.html
- OpenStreetMap Foundation. (s. f.). *Tile usage policy*. https://operations.osmfoundation.org/policies/tiles/
- Pinia. (s. f.). *Pinia: The intuitive store for Vue.js*. https://pinia.vuejs.org/
- Preston-Werner, T. (2013). *Semantic Versioning 2.0.0*. https://semver.org/
- PrimeTek. (s. f.). *PrimeVue*. https://primevue.org/
- Schwaber, K. y Sutherland, J. (2020). *The Scrum Guide*. https://scrumguides.org/
- Vercel. (s. f.). *Vercel documentation*. https://vercel.com/docs
- Vue.js. (s. f.). *Vue.js guide*. https://vuejs.org/guide/introduction.html
- W3C. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. https://www.w3.org/TR/WCAG21/

## Anexos (enlaces TB1)

- Repositorio de la Frontend Web Application: https://github.com/AGROFLET/Agroflet-frontend-application
- Frontend Web Application desplegada: https://agroflet-frontend-application.vercel.app
- Frontend Web Application en GitHub Pages: https://agroflet.github.io/Agroflet-frontend-application/
- Fake API desplegada: https://agroflet-frontend-application.vercel.app/api/v1
- Landing Page: https://agroflet.github.io/Agroflet-landing-page/
