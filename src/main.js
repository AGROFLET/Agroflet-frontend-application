import {createApp} from 'vue'
import './style.css'
import App from './app.vue'
import i18n, {setLocale} from "./i18n.js";
import PrimeVue from 'primevue/config';
import {definePreset} from "@primeuix/themes";
import Material from '@primeuix/themes/material';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import 'leaflet/dist/leaflet.css';
import Tooltip from 'primevue/tooltip';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Checkbox,
    Column,
    ConfirmationService,
    ConfirmDialog,
    DataTable,
    DatePicker,
    Dialog,
    Divider,
    Drawer,
    FloatLabel,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Message,
    Password,
    Select,
    SelectButton,
    Skeleton,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
    Textarea,
    Timeline,
    Toast,
    ToastService,
    Toolbar
} from "primevue";
import router from "./router.js";
import pinia from "./pinia.js";

/**
 * AgroFlet theme: PrimeVue Material preset with the brand Action Green (#176B3A) as primary color,
 * which keeps an accessible contrast with white text on buttons. Warning messages use the darker amber
 * of the style guide (--agf-warning-text, #B45309) because the preset amber does not reach 4.5:1.
 */
const AgroFletPreset = definePreset(Material, {
    semantic: {
        primary: {
            50: '#e8f3ec',
            100: '#c5e1cf',
            200: '#9ecdaf',
            300: '#6fb68b',
            400: '#3f9a66',
            500: '#176b3a',
            600: '#145f34',
            700: '#11512c',
            800: '#0d4224',
            900: '#0a331c',
            950: '#062110'
        }
    },
    components: {
        message: {
            warn: {
                color: '#b45309',
                outlined: {color: '#b45309', borderColor: '#b45309'},
                simple: {color: '#b45309'}
            }
        }
    }
});

const primeUiLicenseKey = import.meta.env.VITE_PRIME_UI_LICENSE_KEY;

setLocale(i18n.global.locale.value);

// noinspection JSCheckFunctionSignatures
createApp(App)
    .use(i18n)
    .use(PrimeVue, {theme: {preset: AgroFletPreset, options: {darkModeSelector: false}}, ripple: true, license: primeUiLicenseKey})
    .use(ConfirmationService)
    .use(ToastService)
    .component('pv-avatar', Avatar)
    .component('pv-badge', Badge)
    .component('pv-button', Button)
    .component('pv-card', Card)
    .component('pv-checkbox', Checkbox)
    .component('pv-column', Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-data-table', DataTable)
    .component('pv-date-picker', DatePicker)
    .component('pv-dialog', Dialog)
    .component('pv-divider', Divider)
    .component('pv-drawer', Drawer)
    .component('pv-float-label', FloatLabel)
    .component('pv-icon-field', IconField)
    .component('pv-input-icon', InputIcon)
    .component('pv-input-number', InputNumber)
    .component('pv-input-text', InputText)
    .component('pv-message', Message)
    .component('pv-password', Password)
    .component('pv-select', Select)
    .component('pv-select-button', SelectButton)
    .component('pv-skeleton', Skeleton)
    .component('pv-tab', Tab)
    .component('pv-tab-list', TabList)
    .component('pv-tab-panel', TabPanel)
    .component('pv-tab-panels', TabPanels)
    .component('pv-tabs', Tabs)
    .component('pv-tag', Tag)
    .component('pv-textarea', Textarea)
    .component('pv-timeline', Timeline)
    .component('pv-toast', Toast)
    .component('pv-toolbar', Toolbar)
    .directive('tooltip', Tooltip)
    .use(pinia)
    .use(router)
    .mount('#app')
