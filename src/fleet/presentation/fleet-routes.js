// Lazy-loaded components
const vehicleList = () => import('./views/vehicle-list.vue');
const vehicleForm = () => import('./views/vehicle-form.vue');
const driverList = () => import('./views/driver-list.vue');
const driverForm = () => import('./views/driver-form.vue');

/** Fleet management is restricted to dispatchers (a buyer cannot manage a fleet, TS09). */
const dispatcherOnly = ['dispatcher'];

const fleetRoutes = [
    {path: 'vehicles', name: 'fleet-vehicles', component: vehicleList, meta: {title: 'vehicles', roles: dispatcherOnly}},
    {path: 'vehicles/new', name: 'fleet-vehicle-new', component: vehicleForm, meta: {title: 'new-vehicle', roles: dispatcherOnly}},
    {path: 'vehicles/:id/edit', name: 'fleet-vehicle-edit', component: vehicleForm, meta: {title: 'edit-vehicle', roles: dispatcherOnly}},
    {path: 'drivers', name: 'fleet-drivers', component: driverList, meta: {title: 'drivers', roles: dispatcherOnly}},
    {path: 'drivers/new', name: 'fleet-driver-new', component: driverForm, meta: {title: 'new-driver', roles: dispatcherOnly}}
];

export default fleetRoutes;
