import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import jsonServer from "json-server";

/**
 * Vercel Function that serves the AgroFlet Fake API (json-server) for the deployed application.
 *
 * The deployment file system is read-only, so the seed database (server/db.json) is copied to the
 * temporary directory when a function instance starts. Changes last while that instance is alive and
 * the data returns to the seed when a new instance starts. Routes follow server/routes.json
 * (/api/v1/* to the json-server resources), the same mapping used by `npm run server`.
 */
const serverDirectory = fileURLToPath(new URL('../server/', import.meta.url));
const databaseFile = path.join(os.tmpdir(), 'agroflet-fake-api-db.json');

if (!fs.existsSync(databaseFile)) {
    fs.copyFileSync(path.join(serverDirectory, 'db.json'), databaseFile);
}

const routes = JSON.parse(fs.readFileSync(path.join(serverDirectory, 'routes.json'), 'utf8'));
const server = jsonServer.create();

server.use(jsonServer.defaults({logger: false, noGzip: true}));
server.use(jsonServer.rewriter(routes));
server.use(jsonServer.router(databaseFile));

export default server;
