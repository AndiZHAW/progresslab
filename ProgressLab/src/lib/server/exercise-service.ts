import type { Types } from 'mongoose';
import { connectDB } from './db';
import { Exercise } from './models/Exercise';
import { Session } from './models/Session';
import { buildRecommendation } from './recommendation';
import { toExerciseDTO, toSessionDTO } from './dto';
import type { ExerciseWithRecDTO } from '../types';

export async function listExercisesWithRecommendation(userId: string): Promise<ExerciseWithRecDTO[]> {
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

	return exercises.map((ex) => {
		const exSessions = sessionsByExercise.get(String(ex._id)) ?? [];
		const rec = buildRecommendation(exSessions, {
			isBodyweight: !!ex.isBodyweight,
			defaultRepTarget: ex.defaultRepTarget ?? 5,
			defaultRpeTarget: ex.defaultRpeTarget ?? 7
		});
		const last = exSessions[0];
		const sparkline = exSessions
			.slice(0, 8)
			.reverse()
			.map((s) => Math.max(...s.sets.map((x) => x.weight)));

		return {
			...toExerciseDTO(ex as unknown as Parameters<typeof toExerciseDTO>[0]),
			recommendation: rec,
			lastSession: last
				? toSessionDTO(last as unknown as Parameters<typeof toSessionDTO>[0])
				: null,
			sparkline
		};
	});
}

export async function getExerciseDetail(userId: string, exerciseId: string) {
	await connectDB();
	const ex = await Exercise.findById(exerciseId).lean();
	if (!ex) return null;

	const sessions = await Session.find({ userId, exerciseId }).sort({ date: -1 }).lean();
	const rec = buildRecommendation(sessions, {
		isBodyweight: !!ex.isBodyweight,
		defaultRepTarget: ex.defaultRepTarget ?? 5,
		defaultRpeTarget: ex.defaultRpeTarget ?? 7
	});
	return {
		exercise: toExerciseDTO(ex as unknown as Parameters<typeof toExerciseDTO>[0]),
		recommendation: rec,
		sessions: sessions.map((s) =>
			toSessionDTO(s as unknown as Parameters<typeof toSessionDTO>[0], ex.name)
		)
	};
}

export async function getRecommendationForExercise(userId: string, exerciseId: string | Types.ObjectId) {
	await connectDB();
	const ex = await Exercise.findById(exerciseId).lean();
	if (!ex) return null;
	const sessions = await Session.find({ userId, exerciseId }).sort({ date: -1 }).lean();
	return buildRecommendation(sessions, {
		isBodyweight: !!ex.isBodyweight,
		defaultRepTarget: ex.defaultRepTarget ?? 5,
		defaultRpeTarget: ex.defaultRpeTarget ?? 7
	});
}
