/**
 * Geographic point used as shipment origin (collection center) or destination (wholesale market).
 *
 * @class Location
 */
export class Location {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Location identifier.
     * @param {string} params.name - Place name.
     * @param {string} params.city - City or district.
     * @param {string} params.region - Region.
     * @param {number} params.latitude - Latitude.
     * @param {number} params.longitude - Longitude.
     * @param {string} params.kind - origin | destination.
     */
    constructor({id, name = '', city = '', region = '', latitude = null, longitude = null, kind = 'origin'}) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.region = region;
        this.latitude = latitude;
        this.longitude = longitude;
        this.kind = kind;
    }

    /** @returns {string} Label used in selectors and listings. */
    get label() {
        return `${this.city} · ${this.name}`;
    }

    /** @returns {boolean} True when it has valid coordinates (needed for the planned route). */
    get isGeoreferenced() {
        return Number.isFinite(this.latitude) && Number.isFinite(this.longitude);
    }
}
