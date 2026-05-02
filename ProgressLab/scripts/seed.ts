import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Exercise } from '../src/lib/server/models/Exercise.js';
import { Session } from '../src/lib/server/models/Session.js';
import { User, SessionToken } from '../src/lib/server/models/User.js';
import { Template } from '../src/lib/server/models/Template.js';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
	console.error('MONGODB_URI fehlt in .env');
	process.exit(1);
}

const exerciseSeed = [
	{ name: 'Bench Press', category: 'push', muscleGroup: 'Brust', isBodyweight: false, defaultRepTarget: 5, defaultRpeTarget: 7 },
	{ name: 'Overhead Press', category: 'push', muscleGroup: 'Schulter', isBodyweight: false, defaultRepTarget: 5, defaultRpeTarget: 7 },
	{ name: 'Incline DB Press', category: 'push', muscleGroup: 'Brust', isBodyweight: false, defaultRepTarget: 10, defaultRpeTarget: 8 },
	{ name: 'Back Squat', category: 'legs', muscleGroup: 'Quads', isBodyweight: false, defaultRepTarget: 5, defaultRpeTarget: 7 },
	{ name: 'Romanian Deadlift', category: 'legs', muscleGroup: 'Hamstrings', isBodyweight: false, defaultRepTarget: 8, defaultRpeTarget: 7 },
	{ name: 'Deadlift', category: 'pull', muscleGroup: 'Rücken', isBodyweight: false, defaultRepTarget: 5, defaultRpeTarget: 7 },
	{ name: 'Barbell Row', category: 'pull', muscleGroup: 'Rücken', isBodyweight: false, defaultRepTarget: 8, defaultRpeTarget: 7 },
	{ name: 'Pull-up', category: 'pull', muscleGroup: 'Rücken', isBodyweight: true, defaultRepTarget: 8, defaultRpeTarget: 7 }
];

async function main() {
	await mongoose.connect(MONGODB_URI as string);
	console.log('✓ Verbunden mit MongoDB');

	await Promise.all([
		Exercise.deleteMany({}),
		Session.deleteMany({}),
		User.deleteMany({}),
		SessionToken.deleteMany({}),
		Template.deleteMany({})
	]);
	console.log('✓ Collections geleert');

	const exercises = await Exercise.insertMany(exerciseSeed);
	console.log(`✓ ${exercises.length} Übungen angelegt`);

	const passwordHash = await bcrypt.hash('demo1234', 10);
	const adminHash = await bcrypt.hash('admin1234', 10);
	const [demoUser, adminUser] = await User.create([
		{ username: 'demo', passwordHash, role: 'user' },
		{ username: 'admin', passwordHash: adminHash, role: 'admin' }
	]);
	console.log('✓ Users angelegt: demo / admin');

	const byName = Object.fromEntries(exercises.map((e) => [e.name, e]));
	const today = new Date();
	const daysAgo = (n: number) => new Date(today.getTime() - n * 24 * 60 * 60 * 1000);

	const history = [
		// Bench Press – stetiger Fortschritt
		{ ex: 'Bench Press', sessions: [
			{ d: 35, sets: [{ w: 70, r: 5, rpe: 7 }, { w: 70, r: 5, rpe: 7 }, { w: 70, r: 5, rpe: 8 }] },
			{ d: 28, sets: [{ w: 72.5, r: 5, rpe: 7 }, { w: 72.5, r: 5, rpe: 7 }, { w: 72.5, r: 5, rpe: 8 }] },
			{ d: 21, sets: [{ w: 75, r: 5, rpe: 7 }, { w: 75, r: 5, rpe: 7 }, { w: 75, r: 5, rpe: 8 }] },
			{ d: 14, sets: [{ w: 77.5, r: 5, rpe: 7 }, { w: 77.5, r: 5, rpe: 7 }, { w: 77.5, r: 5, rpe: 7 }] },
			{ d: 7,  sets: [{ w: 80, r: 5, rpe: 7 }, { w: 80, r: 5, rpe: 7 }, { w: 80, r: 5, rpe: 7 }] }
		] },
		// Back Squat – Fortschritt
		{ ex: 'Back Squat', sessions: [
			{ d: 35, sets: [{ w: 90, r: 5, rpe: 7 }, { w: 90, r: 5, rpe: 7 }, { w: 90, r: 5, rpe: 8 }] },
			{ d: 28, sets: [{ w: 92.5, r: 5, rpe: 7 }, { w: 92.5, r: 5, rpe: 7 }, { w: 92.5, r: 5, rpe: 7 }] },
			{ d: 21, sets: [{ w: 95, r: 5, rpe: 7 }, { w: 95, r: 5, rpe: 7 }, { w: 95, r: 5, rpe: 7 }] },
			{ d: 14, sets: [{ w: 97.5, r: 5, rpe: 7 }, { w: 97.5, r: 5, rpe: 7 }, { w: 97.5, r: 5, rpe: 7 }] },
			{ d: 7,  sets: [{ w: 100, r: 5, rpe: 7 }, { w: 100, r: 5, rpe: 7 }, { w: 100, r: 5, rpe: 7 }] }
		] },
		// Deadlift – stagnierend
		{ ex: 'Deadlift', sessions: [
			{ d: 28, sets: [{ w: 130, r: 5, rpe: 8 }, { w: 130, r: 5, rpe: 8 }] },
			{ d: 14, sets: [{ w: 130, r: 5, rpe: 8 }, { w: 130, r: 5, rpe: 8 }] },
			{ d: 4,  sets: [{ w: 130, r: 5, rpe: 8 }, { w: 130, r: 5, rpe: 8 }] }
		] },
		// Overhead Press – Deload nötig
		{ ex: 'Overhead Press', sessions: [
			{ d: 21, sets: [{ w: 50, r: 5, rpe: 8 }, { w: 50, r: 5, rpe: 9 }, { w: 50, r: 4, rpe: 9 }] },
			{ d: 7,  sets: [{ w: 50, r: 5, rpe: 9 }, { w: 50, r: 4, rpe: 9 }, { w: 50, r: 3, rpe: 10 }] }
		] },
		// Barbell Row – Fortschritt
		{ ex: 'Barbell Row', sessions: [
			{ d: 21, sets: [{ w: 60, r: 8, rpe: 7 }, { w: 60, r: 8, rpe: 7 }, { w: 60, r: 8, rpe: 7 }] },
			{ d: 10, sets: [{ w: 62.5, r: 8, rpe: 7 }, { w: 62.5, r: 8, rpe: 7 }, { w: 62.5, r: 8, rpe: 7 }] }
		] },
		// Pull-up – BW Fortschritt
		{ ex: 'Pull-up', sessions: [
			{ d: 18, sets: [{ w: 0, r: 6, rpe: 8 }, { w: 0, r: 5, rpe: 8 }, { w: 0, r: 4, rpe: 9 }] },
			{ d: 9,  sets: [{ w: 0, r: 8, rpe: 7 }, { w: 0, r: 7, rpe: 7 }, { w: 0, r: 6, rpe: 8 }] }
		] }
	];

	let totalSessions = 0;
	for (const block of history) {
		const exercise = byName[block.ex];
		if (!exercise) continue;
		for (const s of block.sessions) {
			await Session.create({
				userId: demoUser._id,
				exerciseId: exercise._id,
				date: daysAgo(s.d),
				sets: s.sets.map((x) => ({ weight: x.w, reps: x.r, rpe: x.rpe })),
				note: ''
			});
			totalSessions++;
		}
	}
	console.log(`✓ ${totalSessions} Demo-Sessions für demo-User erstellt`);

	const templateSeed = [
		{
			name: 'Push Day',
			description: 'Brust + Schulter + Trizeps',
			exerciseNames: ['Bench Press', 'Overhead Press', 'Incline DB Press']
		},
		{
			name: 'Pull Day',
			description: 'Rücken + Bizeps',
			exerciseNames: ['Deadlift', 'Barbell Row', 'Pull-up']
		},
		{
			name: 'Leg Day',
			description: 'Quads + Hamstrings',
			exerciseNames: ['Back Squat', 'Romanian Deadlift']
		}
	];
	const templates = await Promise.all(
		templateSeed.map((t) =>
			Template.create({
				userId: demoUser._id,
				name: t.name,
				description: t.description,
				exerciseIds: t.exerciseNames.map((n) => byName[n]._id).filter(Boolean)
			})
		)
	);
	console.log(`✓ ${templates.length} Routinen für demo-User erstellt`);

	console.log('');
	console.log('Login zum Testen:');
	console.log('  demo  / demo1234   (Rolle: user)');
	console.log('  admin / admin1234  (Rolle: admin)');

	void adminUser;
	await mongoose.disconnect();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
