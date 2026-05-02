import { connectDB } from './db';
import { Exercise } from './models/Exercise';
import { Session } from './models/Session';
import { computePR } from './recommendation';
import { toExerciseDTO } from './dto';
import type { ExerciseDTO, PR } from '../types';

export type RecordEntry = {
	exercise: ExerciseDTO;
	pr: PR;
	sessionCount: number;
};

export async function listRecords(userId: string): Promise<RecordEntry[]> {
	await connectDB();
	const [exercises, sessions] = await Promise.all([
		Exercise.find().sort({ name: 1 }).lean(),
		Session.find({ userId }).sort({ date: -1 }).lean()
	]);

	const sessionsByExercise = new Map<string, typeof sessions>();
	for (const s of sessions) {
		const k = String(s.exerciseId);
		const arr = sessionsByExercise.get(k) ?? [];
		arr.push(s);
		sessionsByExercise.set(k, arr);
	}

	return exercises
		.map((ex) => {
			const exSessions = sessionsByExercise.get(String(ex._id)) ?? [];
			const pr = computePR(exSessions, !!ex.isBodyweight);
			return {
				exercise: toExerciseDTO(ex as unknown as Parameters<typeof toExerciseDTO>[0]),
				pr,
				sessionCount: exSessions.length
			};
		})
		.filter((r) => r.sessionCount > 0);
}
