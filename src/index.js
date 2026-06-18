import http from 'node:http';
import { createProxy } from './proxy.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const { proxyRequest } = createProxy(config);
const server = http.createServer(proxyRequest);

server.listen(config.port, () => {
  console.log(`OpenCode Proxy running on http://localhost:${config.port}`);
  console.log(`Models: ${config.models.join(', ')}`);
  console.log(`Routing: ${config.routing}`);
  console.log(`Upstream: ${config.upstream}`);
});
