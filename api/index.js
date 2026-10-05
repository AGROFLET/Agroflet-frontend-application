import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {fileURLToPath} from "node:url";
import jsonServer from "json-server";

/**
 * Vercel Function that serves the AgroFlet Fake API (json-server) for the deployed application.
 *
 * Vercel may answer consecutive requests with different instances of this function and stops idle ones, so the data
 * is kept in an Upstash Redis database shared by every instance (connected to the project from the Vercel
 * Marketplace). Each request loads the data from Redis and json-server answers it in memory. A request that changes
 * data holds a short Redis lock while it loads, applies and saves the change, so parallel writes (for example, the
 * vehicle and driver of a new shipment) never overwrite each other. Until a request saves a change, Redis holds no
 * data and the seed (server/db.json) is served. Without a Redis database the function keeps a copy of the seed in the
 * temporary directory of each instance, which returns to the seed when a new instance starts. Routes follow
 * server/routes.json (/api/v1/* to the json-server resources), the same mapping used by `npm run server`.
 */
const serverDirectory = fileURLToPath(new URL('../server/', import.meta.url));
const seedFile = path.join(serverDirectory, 'db.json');
const routes = JSON.parse(fs.readFileSync(path.join(serverDirectory, 'routes.json'), 'utf8'));

const DATABASE_KEY = 'agroflet-fake-api:db';
const LOCK_KEY = 'agroflet-fake-api:lock';
const LOCK_EXPIRATION_MS = 5000;
const LOCK_RETRY_MS = 50;
const REDIS_TIMEOUT_MS = 5000;
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
// Deletes the lock only while it still belongs to the request that took it.
const UNLOCK_SCRIPT = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end return 0";

/**
 * Finds the REST URL and token that the Upstash integration adds to the project: KV_REST_API_URL and
 * KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN, also with a custom prefix
 * (for example, STORAGE_REST_API_URL).
 * @returns {?{url: string, token: string}} Credentials, or null when no Redis database is connected.
 */
function findRedisCredentials() {
    const urlVariable = Object.keys(process.env).find(name => /(^|_)(REST_API|REDIS_REST)_URL$/.test(name));
    const token = urlVariable && process.env[urlVariable.replace(/_URL$/, '_TOKEN')];
    return urlVariable && token ? {url: process.env[urlVariable], token} : null;
}

const redisCredentials = findRedisCredentials();

/**
 * Runs a Redis command through the Upstash REST API.
 * @param {(string|number)[]} command - Command and arguments, for example ['GET', DATABASE_KEY].
 * @returns {Promise<*>} Result of the command.
 */
async function redis(command) {
    const response = await fetch(redisCredentials.url, {
        method: 'POST',
        headers: {Authorization: `Bearer ${redisCredentials.token}`, 'Content-Type': 'application/json'},
        body: JSON.stringify(command),
        signal: AbortSignal.timeout(REDIS_TIMEOUT_MS)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.error) throw new Error(`Redis ${command[0]} failed: ${body.error ?? response.status}`);
    return body.result;
}

/**
 * Waits for the lock that lets one request at a time change the data. The lock expires on its own, so a request that
 * stops halfway never blocks the others for longer than LOCK_EXPIRATION_MS.
 * @returns {Promise<function(): Promise<void>>} Function that releases the lock; calling it again does nothing.
 */
async function acquireLock() {
    const owner = randomUUID();
    const deadline = Date.now() + LOCK_EXPIRATION_MS + 1000;
    while (await redis(['SET', LOCK_KEY, owner, 'NX', 'PX', LOCK_EXPIRATION_MS]) !== 'OK') {
        if (Date.now() > deadline) throw new Error('Timed out waiting for the Fake API lock');
        await new Promise(resolve => setTimeout(resolve, LOCK_RETRY_MS));
    }
    let released = false;
    return async () => {
        if (released) return;
        released = true;
        await redis(['EVAL', UNLOCK_SCRIPT, 1, LOCK_KEY, owner]).catch(error => console.error(error));
    };
}

/**
 * @returns {Promise<Object>} Data saved in Redis, or the seed while nothing has been saved yet.
 */
async function loadDatabase() {
    const saved = await redis(['GET', DATABASE_KEY]);
    return JSON.parse(saved ?? fs.readFileSync(seedFile, 'utf8'));
}

/**
 * Answers with 503 when Redis cannot be reached, instead of serving data that may be out of date.
 * @param {import('express').Response} res - Response.
 * @param {Error} error - Cause, written to the function logs.
 */
function storageUnavailable(res, error) {
    console.error(error);
    if (!res.headersSent) res.status(503).jsonp({message: 'The Fake API storage is not available. Try again.'});
}

/**
 * Answers a request with json-server over the data saved in Redis and saves the data again when the request changed it.
 * @type {import('express').RequestHandler}
 */
async function redisBackedRouter(req, res, next) {
    let releaseLock = async () => {};
    try {
        const changesData = !READ_METHODS.has(req.method);
        if (changesData) releaseLock = await acquireLock();
        res.on('close', releaseLock);
        const database = await loadDatabase();
        const original = JSON.stringify(database);
        const router = jsonServer.router(database);
        router.render = async (request, response) => {
            try {
                const current = router.db.getState();
                if (changesData && JSON.stringify(current) !== original) {
                    await redis(['SET', DATABASE_KEY, JSON.stringify(current)]);
                }
                await releaseLock();
                response.jsonp(response.locals.data);
            } catch (error) {
                await releaseLock();
                storageUnavailable(response, error);
            }
        };
        router(req, res, next);
    } catch (error) {
        await releaseLock();
        storageUnavailable(res, error);
    }
}

const server = jsonServer.create();

server.use(jsonServer.defaults({logger: false, noGzip: true}));
server.use(jsonServer.rewriter(routes));

if (redisCredentials) {
    server.use(redisBackedRouter);
} else {
    const databaseFile = path.join(os.tmpdir(), 'agroflet-fake-api-db.json');
    if (!fs.existsSync(databaseFile)) fs.copyFileSync(seedFile, databaseFile);
    server.use(jsonServer.router(databaseFile));
}

export default server;
