import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import mongoose from 'mongoose';
import { connectDB } from '$lib/server/db';
import { Exercise, EXERCISE_CATEGORIES } from '$lib/server/models/Exercise';
import { Session } from '$lib/server/models/Session';
import { getExerciseDetail } from '$lib/server/exercise-service';
import { toExerciseDTO } from '$lib/server/dto';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	if (!mongoose.isValidObjectId(params.id)) throw error(400, 'Ungültige ID');
	const data = await getExerciseDetail(locals.user.id, params.id);
	if (!data) throw error(404, 'Übung nicht gefunden');
	return json(data);
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	if (locals.user.role !== 'admin') throw error(403, 'Nur Admins dürfen Übungen ändern');
	if (!mongoose.isValidObjectId(params.id)) throw error(400, 'Ungültige ID');

	const body = await request.json().catch(() => null);
	if (!body) throw error(400, 'Body erforderlich');

	const update: Record<string, unknown> = {};
	if (typeof body.name === 'string') update.name = body.name.trim();
	if (EXERCISE_CATEGORIES.includes(body.category)) update.category = body.category;
	if (typeof body.muscleGroup === 'string') update.muscleGroup = body.muscleGroup.trim();
	if (typeof body.isBodyweight === 'boolean') update.isBodyweight = body.isBodyweight;
	if (typeof body.defaultRepTarget === 'number') update.defaultRepTarget = body.defaultRepTarget;
	if (typeof body.defaultRpeTarget === 'number') update.defaultRpeTarget = body.defaultRpeTarget;

	await connectDB();
	const doc = await Exercise.findByIdAndUpdate(params.id, update, {
		new: true,
		runValidators: true
	});
	if (!doc) throw error(404, 'Übung nicht gefunden');
	return json(toExerciseDTO(doc as unknown as Parameters<typeof toExerciseDTO>[0]));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	if (locals.user.role !== 'admin') throw error(403, 'Nur Admins dürfen Übungen löschen');
	if (!mongoose.isValidObjectId(params.id)) throw error(400, 'Ungültige ID');

	await connectDB();
	const sessionsLinked = await Session.countDocuments({ exerciseId: params.id });
	if (sessionsLinked > 0) {
		throw error(409, `Übung hat ${sessionsLinked} verknüpfte Session(s) – Löschen abgelehnt`);
	}
	const doc = await Exercise.findByIdAndDelete(params.id);
	if (!doc) throw error(404, 'Übung nicht gefunden');
	return json({ ok: true });
};
