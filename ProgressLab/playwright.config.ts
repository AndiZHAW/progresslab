import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

const PORT = 5180;
const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/progresslab_e2e';

loadEnv();

const mongoUri = process.env.MONGODB_URI ?? DEFAULT_LOCAL_URI;
const localMongo = /^mongodb:\/\/(?:127\.0\.0\.1|localhost|\[::1\])(?::|\/)/.test(mongoUri);

if (!localMongo && process.env.PL_ALLOW_REMOTE_E2E !== '1') {
	throw new Error(
		[
			'E2E blockiert: MONGODB_URI zeigt nicht auf eine lokale MongoDB.',
			'Nutze npm run test:e2e mit mongodb://127.0.0.1:27017/progresslab_e2e',
			'oder setze PL_ALLOW_REMOTE_E2E=1 nur fuer eine bewusst konfigurierte Test-DB.'
		].join(' ')
	);
}

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 30_000,
	expect: { timeout: 5_000 },
	fullyParallel: false,
	retries: 0,
	workers: 1,
	reporter: [['list']],
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'retain-on-failure',
		viewport: { width: 1280, height: 800 }
	},
	webServer: {
		command: `npm run dev -- --port ${PORT}`,
		port: PORT,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
