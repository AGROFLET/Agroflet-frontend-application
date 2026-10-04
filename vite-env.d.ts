/**
 * Custom type definitions for the Vite environment variables.
 *
 * @remarks
 * This allows for better type checking and autocompletion when using the environment variables in the code.
 */

/// <reference types="vite/client" />
interface ImportMetaEnv {
  /**
   * # VITE_AGROFLET_PLATFORM_API_URL is the base URL of the AgroFlet Platform API (Fake API or RESTful API).
   */
  readonly VITE_AGROFLET_PLATFORM_API_URL: string;
  /**
   * # VITE_USERS_ENDPOINT_PATH is the path to the users' endpoint (IAM).
   */
  readonly VITE_USERS_ENDPOINT_PATH: string;
  /**
   * # VITE_VEHICLES_ENDPOINT_PATH is the path to the vehicles' endpoint (Fleet).
   */
  readonly VITE_VEHICLES_ENDPOINT_PATH: string;
  /**
   * # VITE_DRIVERS_ENDPOINT_PATH is the path to the drivers' endpoint (Fleet).
   */
  readonly VITE_DRIVERS_ENDPOINT_PATH: string;
  /**
   * # VITE_SHIPMENTS_ENDPOINT_PATH is the path to the shipments' endpoint (Shipments).
   */
  readonly VITE_SHIPMENTS_ENDPOINT_PATH: string;
  /**
   * # VITE_STATUS_CHANGES_ENDPOINT_PATH is the path to the shipment status changes' endpoint (Shipments).
   */
  readonly VITE_STATUS_CHANGES_ENDPOINT_PATH: string;
  /**
   * # VITE_LOCATIONS_ENDPOINT_PATH is the path to the origins and destinations' endpoint (Shipments).
   */
  readonly VITE_LOCATIONS_ENDPOINT_PATH: string;
  /**
   * # VITE_POSITIONS_ENDPOINT_PATH is the path to the reported positions' endpoint (Tracking).
   */
  readonly VITE_POSITIONS_ENDPOINT_PATH: string;
  /**
   * # VITE_INCIDENTS_ENDPOINT_PATH is the path to the incidents' endpoint (Incidents).
   */
  readonly VITE_INCIDENTS_ENDPOINT_PATH: string;
  /**
   * # VITE_NOTIFICATIONS_ENDPOINT_PATH is the path to the notifications' endpoint (Incidents).
   */
  readonly VITE_NOTIFICATIONS_ENDPOINT_PATH: string;
  /**
   * # VITE_PASSWORD_RESET_REQUESTS_ENDPOINT_PATH is the path to the password reset requests' endpoint (IAM).
   */
  readonly VITE_PASSWORD_RESET_REQUESTS_ENDPOINT_PATH: string;
  /**
   * # VITE_LANDING_PAGE_URL is the public URL of the AgroFlet landing page.
   */
  readonly VITE_LANDING_PAGE_URL: string;
  /**
   * # VITE_PRIME_UI_LICENSE_KEY is the license key for the Prime UI library.
   */
  readonly VITE_PRIME_UI_LICENSE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
