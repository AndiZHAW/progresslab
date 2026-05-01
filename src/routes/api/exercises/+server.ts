import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { Exercise, EXERCISE_CATEGORIES } from '$lib/server/models/Exercise';
import { listExercisesWithRecommendation } from '$lib/server/exercise-service';
import { toExerciseDTO } from '$lib/server/dto';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	const data = await listExercisesWithRecommendation(locals.user.id);
	return json(data);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	if (locals.user.role !== 'admin') throw error(403, 'Nur Admins dürfen Übungen anlegen');

	const body = await request.json().catch(() => null);
	if (!body) throw error(400, 'Body erforderlich');

	const { name, category, muscleGroup, isBodyweight, defaultRepTarget, defaultRpeTarget } = body;
	if (typeof name !== 'string' || name.trim().length === 0)
		throw error(400, 'Name erforderlich');
	if (!EXERCISE_CATEGORIES.includes(category))
		throw error(400, 'Kategorie muss push, pull oder legs sein');

	await connectDB();
	try {
		const doc = await Exercise.create({
			name: name.trim(),
			category,
			muscleGroup: typeof muscleGroup === 'string' ? muscleGroup.trim() : '',
			isBodyweight: !!isBodyweight,
			defaultRepTarget: Number(defaultRepTarget) || 5,
			defaultRpeTarget: Number(defaultRpeTarget) || 7
		});
		return json(toExerciseDTO(doc as unknown as Parameters<typeof toExerciseDTO>[0]), {
			status: 201
		});
	} catch (e) {
		const err = e as { code?: number; message?: string };
		if (err.code === 11000) throw error(409, 'Übung mit diesem Namen existiert bereits');
		throw error(400, err.message ?? 'Fehler beim Speichern');
	}
};
