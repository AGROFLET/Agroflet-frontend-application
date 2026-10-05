/** A reported position older than this threshold is shown as stale (US17, scenario 2). */
export const STALE_POSITION_MINUTES = 180;

/** Sources accepted for a reported position. The office location is never attributed to the truck. */
export const POSITION_SOURCES = ['driver_call', 'whatsapp_message', 'gps_device', 'checkpoint'];

/**
 * Reported position of a shipment (Real-Time Tracking & Route Telemetry bounded context).
 * It is a reference received at a given moment, not continuous GPS tracking.
 *
 * @class ReportedPosition
 */
export class ReportedPosition {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Identifier.
     * @param {?number} [params.shipmentId=null] - Related shipment.
     * @param {?number} [params.latitude=null] - Latitude (-90..90).
     * @param {?number} [params.longitude=null] - Longitude (-180..180).
     * @param {?string} [params.reportedAt=null] - When the position was reported by the source (ISO).
     * @param {?string} [params.recordedAt=null] - When it was recorded in AgroFlet (ISO).
     * @param {string} [params.source=''] - Data source.
     * @param {?number} [params.recordedBy=null] - Author user identifier.
     * @param {boolean} [params.isDemo=false] - True for demonstration data.
     * @param {string} [params.note=''] - Optional reference (town, checkpoint).
     */
    constructor({id = null, shipmentId = null, latitude = null, longitude = null, reportedAt = null, recordedAt = null,
                    source = '', recordedBy = null, isDemo = false, note = ''}) {
        this.id = id;
        this.shipmentId = shipmentId;
        this.latitude = latitude === null || latitude === '' ? null : Number(latitude);
        this.longitude = longitude === null || longitude === '' ? null : Number(longitude);
        this.reportedAt = reportedAt;
        this.recordedAt = recordedAt;
        this.source = source;
        this.recordedBy = recordedBy;
        this.isDemo = isDemo;
        this.note = note;
    }

    /**
     * @param {Date} [now=new Date()] - Reference moment.
     * @returns {boolean} True when the position is older than the stale threshold.
     */
    isStale(now = new Date()) {
        if (!this.reportedAt) return true;
        return (now.getTime() - new Date(this.reportedAt).getTime()) / 60000 > STALE_POSITION_MINUTES;
    }

    /**
     * Validates coordinates, date and source (US32, TS26).
     * @returns {string[]} Error codes; empty when valid.
     */
    validate() {
        const errors = [];
        if (!Number.isFinite(this.latitude) || this.latitude < -90 || this.latitude > 90) errors.push('latitude-range');
        if (!Number.isFinite(this.longitude) || this.longitude < -180 || this.longitude > 180) errors.push('longitude-range');
        if (!POSITION_SOURCES.includes(this.source)) errors.push('source-required');
        if (!this.reportedAt) errors.push('reported-at-required');
        else if (new Date(this.reportedAt).getTime() > Date.now() + 60000) errors.push('reported-at-future');
        return errors;
    }
}
