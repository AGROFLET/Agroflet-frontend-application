import axios from "axios";
import {iamInterceptor} from "../../iam/infrastructure/iam.interceptor.js";

const platformApi = import.meta.env.VITE_AGROFLET_PLATFORM_API_URL;

/**
 * Shared infrastructure base class that configures the HTTP client
 * used by every bounded context to reach the AgroFlet Platform API.
 *
 * @class BaseApi
 */
export class BaseApi {
    /**
     * @private
     * Axios HTTP client instance
     * @type {import('axios').AxiosInstance}
     */
    #http;

    /**
     * Initializes the Axios HTTP client with the base URL from environment variables
     * and registers the IAM interceptor that attaches the bearer token.
     */
    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
            timeout: 10000,
            // Repeated keys (id=1&id=2) instead of id[]=1, as expected by json-server and ASP.NET Core.
            paramsSerializer: {indexes: null},
            headers: {
                'Content-Type': 'application/json'
            },
        });
        this.#http.interceptors.request.use(iamInterceptor);
    }

    /**
     * Returns the configured Axios HTTP client.
     * @returns {import('axios').AxiosInstance}
     */
    get http() {
        return this.#http;
    }
}
