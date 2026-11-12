import { loadConfig } from './config.js';
import { createTravelProvider } from './providers.js';
import { TravelService } from './service.js';
import { createApp } from './app.js';

const config = loadConfig();
const service = new TravelService(createTravelProvider(config));
const { server } = createApp({ service, maxBodyBytes: config.maxBodyBytes });
server.listen(config.port, '0.0.0.0', () => {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level: 'info', event: 'server_started', port: config.port, provider: config.provider }));
});
