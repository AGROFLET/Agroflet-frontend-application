import {useI18n} from "vue-i18n";

/**
 * Formatting helpers that follow the active locale (en-US / es-419).
 * @returns {{formatDateTime: function(?string): string, formatDate: function(?string): string,
 *            formatRelative: function(?string): string, formatTons: function(number): string}}
 */
export function useFormatters() {
    const {locale, t} = useI18n();
    const intlLocale = () => locale.value === 'es' ? 'es-419' : 'en-US';

    /**
     * @param {?string} iso - ISO date.
     * @returns {string} Date and time, or a dash when missing.
     */
    function formatDateTime(iso) {
        if (!iso) return '—';
        return new Intl.DateTimeFormat(intlLocale(), {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(iso));
    }

    /**
     * @param {?string} iso - ISO date.
     * @returns {string} Date only, or a dash when missing.
     */
    function formatDate(iso) {
        if (!iso) return '—';
        return new Intl.DateTimeFormat(intlLocale(), {dateStyle: 'medium'}).format(new Date(iso));
    }

    /**
     * @param {?string} iso - ISO date.
     * @returns {string} Relative time (e.g. "3 hours ago").
     */
    function formatRelative(iso) {
        if (!iso) return '—';
        const diffMinutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
        const formatter = new Intl.RelativeTimeFormat(intlLocale(), {numeric: 'auto'});
        if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute');
        const diffHours = Math.round(diffMinutes / 60);
        if (Math.abs(diffHours) < 48) return formatter.format(diffHours, 'hour');
        return formatter.format(Math.round(diffHours / 24), 'day');
    }

    /**
     * @param {number} value - Weight in tons.
     * @returns {string} Formatted weight.
     */
    function formatTons(value) {
        return t('common.tons', {value: new Intl.NumberFormat(intlLocale(), {maximumFractionDigits: 2}).format(value || 0)});
    }

    return {formatDateTime, formatDate, formatRelative, formatTons};
}
