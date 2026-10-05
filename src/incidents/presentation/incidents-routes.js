// Lazy-loaded components
const notificationList = () => import('./views/notification-list.vue');

const incidentsRoutes = [
    {path: '', name: 'notifications', component: notificationList, meta: {title: 'notifications'}}
];

export default incidentsRoutes;
