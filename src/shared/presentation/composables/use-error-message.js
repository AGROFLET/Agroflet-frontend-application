import {useI18n} from "vue-i18n";

/**
 * Translates stable error codes from the application layer into user messages
 * that describe the problem first and then the solution.
 * @returns {{errorMessage: function(?string): string}}
 */
export function useErrorMessage() {
    const {t, te} = useI18n();

    /**
     * @param {?string} code - Error code.
     * @returns {string} Translated message.
     */
    function errorMessage(code) {
        const key = `errors.${code}`;
        return te(key) ? t(key) : t('errors.unexpected');
    }

    return {errorMessage};
}
