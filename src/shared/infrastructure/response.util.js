/**
 * Extracts a resource collection from an HTTP response.
 * Accepts plain arrays (json-server) and wrapped payloads ({ data: [...] } or { [key]: [...] })
 * so the assemblers keep working when the RESTful API replaces the Fake API.
 *
 * @param {import('axios').AxiosResponse} response - HTTP response.
 * @param {string} key - Collection key for wrapped payloads.
 * @returns {Array<Object>} Resource collection, empty when the response is not successful.
 */
export function extractCollection(response, key) {
    if (response.status !== 200) {
        console.error(`${response.status}, ${response.statusText}`);
        return [];
    }
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data[key])) return data[key];
    return [];
}
