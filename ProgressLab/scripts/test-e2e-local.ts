import { spawnSync } from 'node:child_process';
import { Socket } from 'node:net';

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/progresslab_e2e';
const mongoUri = process.env.MONGODB_URI ?? DEFAULT_LOCAL_URI;
const localMongo = /^mongodb:\/\/(?:127\.0\.0\.1|localhost|\[::1\])(?::|\/)/.test(mongoUri);
const playwrightArgs = process.argv.slice(2);

if (!localMongo) {
	console.error('');
	console.error('Abbruch: test:e2e:local erlaubt nur lokale MongoDB-URIs.');
	console.error(
		'Aktuelle MONGODB_URI wirkt nicht lokal. Atlas/Produktiv-DB wird bewusst blockiert.'
	);
	console.error(`Beispiel: MONGODB_URI=${DEFAULT_LOCAL_URI} npm run test:e2e:local`);
	console.error('');
	process.exit(2);
}

function getMongoAddress(uri: string): { host: string; port: number } {
	const parsed = new URL(uri);
	return {
		host: parsed.hostname.replace(/^\[|\]$/g, ''),
		port: Number(parsed.port || 27017)
	};
}

async function canConnectToMongo(uri: string): Promise<boolean> {
	const { host, port } = getMongoAddress(uri);
	return new Promise((resolve) => {
		const socket = new Socket();
		const close = (result: boolean) => {
			socket.destroy();
			resolve(result);
		};
		socket.setTimeout(1500);
		socket.once('connect', () => close(true));
		socket.once('error', () => close(false));
		socket.once('timeout', () => close(false));
		socket.connect(port, host);
	});
}

const env = {
	...process.env,
	MONGODB_URI: mongoUri,
	SESSION_SECRET: process.env.SESSION_SECRET ?? 'progresslab-local-e2e-secret',
	NODE_ENV: 'test',
	PL_SEED_CONFIRM: '1'
};

function run(command: string, args: string[]): void {
	const result = spawnSync(command, args, {
		stdio: 'inherit',
		env
	});
	if (result.error) {
		console.error(result.error);
		process.exit(1);
	}
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

console.log(`E2E nutzt lokale Test-DB: ${mongoUri}`);
if (!(await canConnectToMongo(mongoUri))) {
	const { host, port } = getMongoAddress(mongoUri);
	console.error('');
	console.error(`Abbruch: keine lokale MongoDB unter ${host}:${port} erreichbar.`);
	console.error('Starte lokal MongoDB oder Docker, dann erneut `npm run test:e2e` ausführen.');
	console.error('Es wurde keine Remote-Datenbank beschrieben.');
	console.error('');
	process.exit(2);
}
run('node', ['--import', 'tsx', 'scripts/seed.ts']);
run('node', ['node_modules/@playwright/test/cli.js', 'test', ...playwrightArgs]);
