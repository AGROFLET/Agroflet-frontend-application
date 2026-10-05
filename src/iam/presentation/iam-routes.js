// Lazy-loaded components
const signInForm = () => import('./views/sign-in-form.vue');
const signUpForm = () => import('./views/sign-up-form.vue');
const passwordRecovery = () => import('./views/password-recovery.vue');
const resetPassword = () => import('./views/reset-password.vue');
const profileSettings = () => import('./views/profile-settings.vue');

const iamRoutes = [
    {path: 'sign-in', name: 'iam-sign-in', component: signInForm, meta: {title: 'sign-in', public: true, guestOnly: true}},
    {path: 'sign-up', name: 'iam-sign-up', component: signUpForm, meta: {title: 'sign-up', public: true, guestOnly: true}},
    {path: 'password-recovery', name: 'iam-password-recovery', component: passwordRecovery, meta: {title: 'password-recovery', public: true, guestOnly: true}},
    {path: 'reset-password', name: 'iam-reset-password', component: resetPassword, meta: {title: 'reset-password', public: true, guestOnly: true}},
    {path: 'profile', name: 'iam-profile', component: profileSettings, meta: {title: 'settings'}}
];

export default iamRoutes;
