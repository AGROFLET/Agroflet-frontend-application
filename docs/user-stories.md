# User Stories

## Overview
This document contains the user stories implemented by the AgroFlet Frontend Web Application in Sprint 2 (TB1) and
their requirement traceability. The stories, their identifiers and their acceptance criteria come from the Product
Backlog of the AgroFlet project report (Chapter III, section 3.1); they are presented here in English, the language of
the codebase.

Scope of this repository: the user stories of the web application (US01–US23, US31, US32 and US34) and US33, whose
terms of service are also available inside the application. The landing page stories (US24–US30) belong to the
landing page repository. Technical stories (TS01–TS27) describe the RESTful API contract; during Sprint 2 the
application consumes an equivalent Fake API (see `server/` and the Sprint 2 report).

## Requirement Traceability Matrix (RTM)

| User Story | Bounded Context | Implemented Elements | Technical Stories |
|:--|:--|:--|:--|
| **US01: Account registration** | IAM | `SignUpForm`, `IamStore.signUp`, `IamApi.signUp`, `SignUpCommand`, `UserAssembler`, `password-policy` | TS01 |
| **US02: Sign in** | IAM | `SignInForm`, `IamStore.signIn`, `IamApi.signIn`, `SignInCommand`, `SignInResource`, `session.storage`, `User` | TS02 |
| **US03: Sign out** | IAM | `AuthenticationSection`, `useSignOut`, `IamStore.signOut`, `session.storage`, `authenticationGuard`, `reset()` of every store | TS21 |
| **US04: Password recovery** | IAM | `PasswordRecovery`, `ResetPassword`, `IamStore.requestPasswordReset`, `IamStore.resetPassword`, `IamApi` | TS22, TS23 |
| **US05: Vehicle registration** | Fleet & Resource Management | `VehicleForm`, `FleetStore.addVehicle`, `FleetApi.createVehicle`, `VehicleAssembler`, `Vehicle.validate` | TS09, TS10 |
| **US06: Vehicle query and edition** | Fleet & Resource Management | `VehicleList`, `VehicleForm`, `FleetStore.updateVehicle`, `Vehicle.canChangeStatusTo`, `Vehicle.isLockedByShipment`, `ResourceStatusTag` | TS19, TS25 |
| **US07: Driver registration** | Fleet & Resource Management | `DriverList`, `DriverForm`, `FleetStore.addDriver`, `FleetApi.createDriver`, `DriverAssembler`, `Driver.validate` | TS11, TS12 |
| **US08: Resource selection for the dispatch** | Fleet & Resource Management | `ShipmentForm`, `FleetStore.availableVehicles`, `FleetStore.availableDrivers`, `FleetStore.checkAvailability` | TS09, TS11 |
| **US09: Planned operation registration** | Shipment & Dispatch Operations | `ShipmentForm`, `ShipmentsStore.createShipment`, `Shipment.validateForCreation`, `FleetStore.reserveResources`, `ShipmentsApi`, `ShipmentAssembler` | TS04 |
| **US10: Active operations query** | Shipment & Dispatch Operations | `ShipmentDashboard`, `ShipmentsStore.fetchShipments`, `ShipmentsStore.activeShipments`, `ShipmentsStore.countByStatus`, `ShipmentMap` | TS03 |
| **US11: Operation detail** | Shipment & Dispatch Operations | `ShipmentDetail`, `ShipmentsStore.fetchShipmentById`, `ShipmentsStore.fetchStatusChanges`, `StatusChange`, `IncidentList`, `PositionList` | TS05, TS20 |
| **US12: Operation closing** | Shipment & Dispatch Operations | `ShipmentDetail`, `CancelShipmentDialog`, `ShipmentsStore.markAsDelivered`, `ShipmentsStore.cancelShipment`, `Shipment.markAsDelivered`, `Shipment.cancel`, `FleetStore.releaseResources` | TS06 |
| **US13: Incident registration** | Incident, Alert & Audit Management | `IncidentFormDialog`, `IncidentsStore.registerIncident`, `Incident`, `createIdempotencyKey`, `ShipmentsStore.applyIncidentDelay`, `Shipment.applyDelay` | TS07 |
| **US14: Incident history** | Incident, Alert & Audit Management | `IncidentList`, `IncidentsStore.fetchIncidents`, `IncidentsApi.getIncidents`, `IncidentAssembler` | TS08 |
| **US15: History with filters** | Shipment & Dispatch Operations | `ShipmentList`, `ShipmentFilter`, `ShipmentsStore.setFilter`, `ShipmentsStore.filteredShipments` | TS13 |
| **US16: Search by code or plate** | Shipment & Dispatch Operations | `ShipmentList`, `ShipmentFilter.matches`, `ShipmentsStore.vehiclePlates` | TS13 |
| **US17: Positions on the map** | Real-Time Tracking & Route Telemetry | `ShipmentMap`, `PositionList`, `TrackingStore.fetchPositions`, `TrackingStore.getLastPosition`, `ReportedPosition.isStale`, `TrackingApi` | TS14 |
| **US18: Planned route** | Real-Time Tracking & Route Telemetry | `ShipmentMap`, `TrackingStore.getPlannedRoute`, `PlannedRoute`, `Location.isGeoreferenced` | TS05 |
| **US19: Incident alerts** | Incident, Alert & Audit Management | `NotificationsStore.publish`, `NotificationList`, `Notification`, `Layout` (unread badge) | TS15, TS16 |
| **US20: Status change alerts** | Incident, Alert & Audit Management | `ShipmentsStore` (status timeline), `NotificationsStore.publish`, `NotificationList`, `Notification` | TS15, TS16 |
| **US21: Profile edition** | IAM | `ProfileSettings`, `IamStore.updateProfile`, `UpdateProfileCommand`, `IamApi.updateProfile` | TS17, TS18 |
| **US22: Password change** | IAM | `ProfileSettings`, `IamStore.changePassword`, `ChangePasswordCommand`, `IamApi.changePassword`, `useSignOut` | TS24 |
| **US23: Application language** | Shared / IAM | `LanguageSwitcher`, `i18n`, `IamStore.savePreferredLanguage`, `ProfileSettings`, `en.json`, `es.json` | TS17, TS18 |
| **US31: Start of the transfer** | Shipment & Dispatch Operations | `ShipmentDetail`, `ShipmentsStore.startTransit`, `Shipment.startTransit`, `FleetStore.lockResourcesInRoute` | TS06 |
| **US32: Reported position registration** | Real-Time Tracking & Route Telemetry | `RegisterPositionDialog`, `TrackingStore.registerPosition`, `ReportedPosition.validate`, `TrackingApi.createPosition` | TS26 |
| **US33: Terms of service** | Shared | `TermsOfService`, `FooterContent` | — |
| **US34: Segment access from the landing page** | IAM | `SignInForm`, `SignUpForm` (`?segment=dispatcher` or `?segment=buyer`), `authenticationGuard` | — |

## US01: Account registration

**Description:** As a visitor, I want to register my data so that I have an account according to my role.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given valid data and a new email,  
When the visitor requests the registration,  
Then the account is created and the next access step is reported.

#### Scenario 2: Validation or alternative case
Given a duplicated email or invalid data,  
When the visitor requests the registration,  
Then no other account is created and the error is reported.

## US02: Sign in

**Description:** As a registered user, I want to authenticate so that I can access my operations.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given valid credentials,  
When the user requests access,  
Then the user obtains a session with their role.

#### Scenario 2: Validation or alternative case
Given incorrect credentials,  
When the user requests access,  
Then the user receives a generic error that does not reveal whether the account exists.

## US03: Sign out

**Description:** As an authenticated user, I want to end my session so that I protect my account.

### Acceptance Criteria

#### Scenario 1: Validation or alternative case
Given a current session,  
When the user requests to close it,  
Then the session is invalidated.

#### Scenario 2: Complementary behavior
Given a closed session,  
When a protected resource is requested,  
Then access is rejected.

## US04: Password recovery

**Description:** As a registered user, I want to reset my password so that I recover access.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given a recovery request,  
When the system processes it,  
Then it returns a generic confirmation and sends instructions only if the account exists.

#### Scenario 2: Validation or alternative case
Given an expired or used link,  
When the user tries to reset the password,  
Then the change is rejected.

## US05: Vehicle registration

**Description:** As a dispatcher, I want to register an owned or contracted vehicle so that I can assign it to my
dispatches.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given a plate, valid data and a positive capacity,  
When the dispatcher registers the vehicle,  
Then the vehicle is available in their management scope.

#### Scenario 2: Validation or alternative case
Given a plate already registered in their scope or a capacity that is not positive,  
When the dispatcher registers the vehicle,  
Then the registration is rejected without duplicating the vehicle.

## US06: Vehicle query and edition

**Description:** As a dispatcher, I want to maintain the data of my vehicles so that I coordinate the right resources.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given a vehicle of their own scope,  
When the dispatcher updates it with valid data,  
Then the changes are kept.

#### Scenario 2: Complementary behavior
Given a reserved or in-route vehicle,  
When the dispatcher tries to mark it as available or under maintenance,  
Then a change that is incompatible with the operation is prevented.

## US07: Driver registration

**Description:** As a dispatcher, I want to register drivers so that I can assign the people responsible for the
transfer.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given valid identity, license and contact data,  
When the dispatcher registers the driver,  
Then the driver is available.

#### Scenario 2: Complementary behavior
Given an identity (DNI) already registered in their scope,  
When the dispatcher tries to create another record,  
Then the duplication is rejected.

## US08: Resource selection for the dispatch

**Description:** As a dispatcher, I want to select a vehicle and a driver so that I prepare a consistent operation.

### Acceptance Criteria

#### Scenario 1: Validation or alternative case
Given available resources,  
When the dispatcher prepares the dispatch,  
Then the provisional selection is kept without reserving the resources yet.

#### Scenario 2: Validation or alternative case
Given a resource that is not available,  
When the dispatcher tries to select it,  
Then its unavailability is communicated.

## US09: Planned operation registration

**Description:** As a dispatcher, I want to register the cargo, route, buyer and resources so that I coordinate a new
transfer.

### Acceptance Criteria

#### Scenario 1: Validation or alternative case
Given a positive weight that does not exceed the vehicle capacity, a valid buyer and available resources,  
When the dispatcher registers the operation,  
Then the operation is `planned` and both resources are reserved in the same transaction.

#### Scenario 2: Validation or alternative case
Given two concurrent requests for the same resource,  
When they are confirmed,  
Then only one reservation succeeds and no partial records remain.

## US10: Active operations query

**Description:** As a dispatcher or buyer, I want to check my operations so that I identify the shipments that need
attention.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given authorized operations,  
When the user checks the activity,  
Then the user obtains the status, cargo, expected arrival and last update of each one.

#### Scenario 2: Validation or alternative case
Given that there are no authorized operations,  
When the user checks the activity,  
Then the user receives an empty result; a buyer does not obtain creation permissions.

## US11: Operation detail

**Description:** As an authorized participant, I want to check the data of a shipment so that I understand the
situation of the operation.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given an associated operation,  
When the participant requests its detail,  
Then the participant obtains its data, incidents and allowed history.

#### Scenario 2: Validation or alternative case
Given an operation that belongs to someone else or does not exist,  
When the participant requests its detail,  
Then the participant obtains neither data nor information about its existence.

## US12: Operation closing

**Description:** As a dispatcher, I want to register the delivery or the cancellation so that I close the transfer and
release the resources.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given an `in_transit` operation,  
When the dispatcher registers the delivery,  
Then it becomes `delivered` with author, date and history, and the resources are released.

#### Scenario 2: Validation or alternative case
Given a `planned` or `in_transit` operation and a valid reason,  
When the dispatcher cancels it,  
Then it becomes `cancelled` and the resources are released; a terminal operation cannot be reopened through this flow.

## US13: Incident registration

**Description:** As a dispatcher, I want to register an incident and its impact so that I report changes in the
arrival.

### Acceptance Criteria

#### Scenario 1: Validation or alternative case
Given an `in_transit` operation and a delay that is not negative,  
When the dispatcher registers the incident,  
Then the incident is associated with the operation and the estimated arrival is recalculated once.

#### Scenario 2: Validation or alternative case
Given a repeated request with the same idempotency key,  
When it is sent again,  
Then the incident is not duplicated and the delay is not added again.

## US14: Incident history

**Description:** As an authorized participant, I want to check the events of the trip so that I understand the
variations of the operation.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given registered incidents,  
When the participant checks the history,  
Then the participant obtains them by date with type, description and impact.

#### Scenario 2: Validation or alternative case
Given an operation without incidents,  
When the participant checks the history,  
Then the participant obtains an empty list.

## US15: History with filters

**Description:** As an authorized participant, I want to filter operations so that I review previous records.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given valid filters of dates, status, cargo and destination,  
When the participant runs the query,  
Then the participant receives only the authorized operations that meet every filter.

#### Scenario 2: Complementary behavior
Given an inverted date range,  
When the participant runs the query,  
Then the participant receives a validation error.

## US16: Search by code or plate

**Description:** As an authorized participant, I want to locate operations so that I reduce the search time.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given a matching code or plate,  
When the participant searches,  
Then the participant obtains the corresponding authorized operations.

#### Scenario 2: Validation or alternative case
Given a term without matches,  
When the participant searches,  
Then the participant obtains an empty result.

## US17: Positions on the map

**Description:** As an authorized participant, I want to check the reported positions so that I interpret the
geographic situation.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given available positions,  
When the participant checks the map,  
Then each position identifies its date and source and demonstration data is distinguished.

#### Scenario 2: Validation or alternative case
Given that there is no position or the last one is old,  
When the participant checks the map,  
Then that condition is communicated without presenting an invented position as the current one.

## US18: Planned route

**Description:** As a buyer, I want to check the planned route so that I put the expected shipment in context.

### Acceptance Criteria

#### Scenario 1: Validation or alternative case
Given a georeferenced origin and destination of an associated operation,  
When the buyer checks the route,  
Then the buyer obtains the planned route identified as such.

#### Scenario 2: Validation or alternative case
Given a failure of the route provider,  
When the buyer checks the route,  
Then the shipment data is kept and the buyer is informed that the route is not available.

## US19: Incident alerts

**Description:** As an authorized participant, I want to receive incident alerts so that I learn about the news of the
shipment.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given a saved incident,  
When the event is generated,  
Then a notification exists for each associated participant.

#### Scenario 2: Validation or alternative case
Given that the event is processed again,  
When the notifications are generated,  
Then they are not duplicated for the same recipient and event.

## US20: Status change alerts

**Description:** As a buyer, I want to receive alerts about the status of the shipment so that I adjust the reception.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given a status change in their operation,  
When it is registered,  
Then the buyer receives a notification linked to the shipment.

#### Scenario 2: Validation or alternative case
Given an operation of someone else,  
When it changes its status,  
Then the buyer does not receive its data.

## US21: Profile edition

**Description:** As a user, I want to maintain my contact data so that the platform uses up-to-date information.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given valid editable data,  
When the user updates the profile,  
Then the changes are kept.

#### Scenario 2: Complementary behavior
Given that the user tries to change the role or the identifier through this flow,  
When the changes are sent,  
Then those fields are rejected.

## US22: Password change

**Description:** As a user, I want to change my password so that I protect my access.

### Acceptance Criteria

#### Scenario 1: Validation or alternative case
Given a correct current password and a valid new password,  
When the user confirms the change,  
Then the password is updated and the sessions are invalidated according to the documented policy.

#### Scenario 2: Validation or alternative case
Given an incorrect current password,  
When the user tries to change it,  
Then the previous password is kept.

## US23: Application language

**Description:** As a user, I want to choose English or Latin American Spanish so that I understand the application.

### Acceptance Criteria

#### Scenario 1: Validation or alternative case
Given that there is no preference,  
When the application starts,  
Then it uses `en_US` as the default language.

#### Scenario 2: Validation or alternative case
Given the `es_419` selection,  
When the user saves the preference,  
Then the system texts change and the preference is kept; content written by users is not translated automatically.

## US31: Start of the transfer

**Description:** As a dispatcher, I want to register the effective departure so that I distinguish scheduling from
execution.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given a `planned` operation with reserved resources,  
When the dispatcher confirms the departure,  
Then it becomes `in_transit` and `actualDepartureAt` is registered.

#### Scenario 2: Complementary behavior
Given a `delivered` or `cancelled` operation,  
When the dispatcher tries to start it,  
Then the transition is rejected.

## US32: Reported position registration

**Description:** As a dispatcher, I want to register a received location so that I share my latest reference of the
shipment.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given an `in_transit` operation and valid coordinates with date and source,  
When the dispatcher registers the position,  
Then the position is linked to the operation and traceable.

#### Scenario 2: Validation or alternative case
Given coordinates out of range or without source,  
When the dispatcher registers the position,  
Then it is rejected; the location of the team at the office is never attributed to the truck automatically.

## US33: Terms of service

**Description:** As a visitor or user, I want to check the terms of use so that I know the scope of the service.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given access to the landing page or the application,  
When the visitor or user checks the terms,  
Then they obtain the conditions, scope and contact channel in the selected language.

#### Scenario 2: Validation or alternative case
Given a simulated function,  
When the visitor or user checks its conditions,  
Then they are informed that it is not an operating logistics service.

## US34: Segment access from the landing page

**Description:** As a dispatcher or buyer visitor, I want to access the journey of my segment so that I continue in the
web application.

### Acceptance Criteria

#### Scenario 1: Expected flow
Given that the visitor chooses their segment,  
When the visitor continues from the landing page,  
Then the visitor reaches the corresponding view of the deployed frontend.

#### Scenario 2: Validation or alternative case
Given a segment in the URL,  
When the visitor accesses it,  
Then the selection guides the journey but does not grant authenticated permissions by itself.
