// Lazy-loaded components
const shipmentList = () => import('./views/shipment-list.vue');
const shipmentForm = () => import('./views/shipment-form.vue');
const shipmentDetail = () => import('./views/shipment-detail.vue');

const shipmentsRoutes = [
    {path: '', name: 'shipments', component: shipmentList, meta: {title: 'shipments'}},
    {path: 'new', name: 'shipment-new', component: shipmentForm, meta: {title: 'new-shipment', roles: ['dispatcher']}},
    {path: ':id(\\d+)', name: 'shipment-detail', component: shipmentDetail, meta: {title: 'shipment-detail'}}
];

export default shipmentsRoutes;
