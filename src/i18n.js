import {createI18n} from "vue-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

/** Key used to persist the preferred language in the browser. */
export const LOCALE_STORAGE_KEY = 'agroflet.locale';
/** Supported locales: English (en_US, default) and Latin American Spanish (es_419). */
export const SUPPORTED_LOCALES = ['en', 'es'];

/**
 * Reads the stored language preference; English is the default when none exists (US23, scenario 1).
 * @returns {string} Locale code.
 */
function getInitialLocale() {
    try {
        const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
        return SUPPORTED_LOCALES.includes(stored) ? stored : 'en';
    } catch {
        return 'en';
    }
}

const i18n = createI18n({
    legacy: false,
    locale: getInitialLocale(),
    fallbackLocale: 'en',
    messages: {en, es}
});

/**
 * Changes the active locale, persists it and updates the document language attribute.
 * Content written by users is never translated automatically.
 * @param {string} locale - Locale code (en | es).
 */
export function setLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) return;
    i18n.global.locale.value = locale;
    try {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
        // Storage may be unavailable (private mode); the change still applies to this session.
    }
    document.documentElement.setAttribute('lang', locale === 'es' ? 'es-419' : 'en-US');
}

export default i18n;
