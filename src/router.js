import {createRouter, createWebHistory} from "vue-router";
import iamRoutes from "./iam/presentation/iam-routes.js";
import fleetRoutes from "./fleet/presentation/fleet-routes.js";
import shipmentsRoutes from "./shipments/presentation/shipments-routes.js";
import incidentsRoutes from "./incidents/presentation/incidents-routes.js";
import {authenticationGuard} from "./iam/infrastructure/authentication.guard.js";
import i18n from "./i18n.js";

// Lazy-loaded shared views
const shipmentDashboard = () => import('./shipments/presentation/views/shipment-dashboard.vue');
const about = () => import('./shared/presentation/views/about.vue');
const termsOfService = () => import('./shared/presentation/views/terms-of-service.vue');
const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

const routes = [
    {path: '/dashboard', name: 'dashboard', component: shipmentDashboard, meta: {title: 'dashboard'}},
    {path: '/shipments', children: shipmentsRoutes},
    {path: '/fleet', children: fleetRoutes},
    {path: '/notifications', children: incidentsRoutes},
    {path: '/iam', children: iamRoutes},
    {path: '/about', name: 'about', component: about, meta: {title: 'about', public: true}},
    {path: '/terms', name: 'terms', component: termsOfService, meta: {title: 'terms', public: true}},
    {path: '/', redirect: '/dashboard'},
    {path: '/:pathMatch(.*)*', name: 'not-found', component: pageNotFound, meta: {title: 'not-found', public: true}}
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: () => ({top: 0})
});

/**
 * Global navigation guard: delegates authentication/authorization to IAM.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @returns {Promise<{name: string}|boolean>} True to allow navigation or a redirect.
 */
router.beforeEach((to) => authenticationGuard(to));

/**
 * Updates the document title after each navigation using the translated route title.
 */
router.afterEach((to) => {
    const key = `routes.${to.meta['title'] || 'not-found'}`;
    document.title = `${i18n.global.t(key)} | AgroFlet`;
});

export default router;
