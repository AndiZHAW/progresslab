import { spawnSync } from 'node:child_process';

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/progresslab_e2e';
const mongoUri = process.env.MONGODB_URI ?? DEFAULT_LOCAL_URI;
const localMongo = /^mongodb:\/\/(?:127\.0\.0\.1|localhost|\[::1\])(?::|\/)/.test(mongoUri);

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

const env = {
	...process.env,
	MONGODB_URI: mongoUri,
	PL_SEED_CONFIRM: '1'
};

function run(command: string, args: string[]): void {
	const executable = process.platform === 'win32' && command === 'npx' ? 'npx.cmd' : command;
	const result = spawnSync(executable, args, { stdio: 'inherit', env });
	if (result.error) {
		console.error(result.error);
		process.exit(1);
	}
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

console.log(`E2E nutzt lokale Test-DB: ${mongoUri}`);
run('node', ['--import', 'tsx', 'scripts/seed.ts']);
run('npx', ['playwright', 'test']);
