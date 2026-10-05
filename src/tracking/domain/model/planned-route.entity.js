/**
 * Planned route between the origin and destination of a shipment (US18).
 * It is a reference line, not the path actually travelled.
 *
 * @class PlannedRoute
 */
export class PlannedRoute {
    /**
     * @param {Object} params - Value attributes.
     * @param {?{latitude: number, longitude: number, label: string}} params.origin - Origin point.
     * @param {?{latitude: number, longitude: number, label: string}} params.destination - Destination point.
     */
    constructor({origin, destination}) {
        this.origin = origin;
        this.destination = destination;
    }

    /** @returns {boolean} True when both ends are georeferenced. */
    get isAvailable() {
        const valid = point => point && Number.isFinite(point.latitude) && Number.isFinite(point.longitude);
        return valid(this.origin) && valid(this.destination);
    }

    /** @returns {number} Straight-line distance in kilometres (haversine), 0 when unavailable. */
    get straightDistanceKm() {
        if (!this.isAvailable) return 0;
        const toRad = value => value * Math.PI / 180;
        const dLat = toRad(this.destination.latitude - this.origin.latitude);
        const dLon = toRad(this.destination.longitude - this.origin.longitude);
        const a = Math.sin(dLat / 2) ** 2
            + Math.cos(toRad(this.origin.latitude)) * Math.cos(toRad(this.destination.latitude)) * Math.sin(dLon / 2) ** 2;
        return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
}
