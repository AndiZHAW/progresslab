import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import mongoose from 'mongoose';
import { connectDB } from '$lib/server/db';
import { Session } from '$lib/server/models/Session';
import { Exercise } from '$lib/server/models/Exercise';
import { toSessionDTO } from '$lib/server/dto';
import { parseListLimit, parseSessionSets } from '$lib/server/validation';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	const exerciseId = url.searchParams.get('exerciseId');
	const limit = parseListLimit(url.searchParams.get('limit'));

	const query: Record<string, unknown> = { userId: locals.user.id };
	if (exerciseId) {
		if (!mongoose.isValidObjectId(exerciseId)) throw error(400, 'Ungültige exerciseId');
		query.exerciseId = exerciseId;
	}

	await connectDB();
	const docs = await Session.find(query).sort({ date: -1 }).limit(limit).lean();
	const exerciseIds = [...new Set(docs.map((d) => String(d.exerciseId)))];
	const exercises = await Exercise.find({ _id: { $in: exerciseIds } })
		.select('name')
		.lean();
	const nameById = new Map(exercises.map((e) => [String(e._id), e.name]));

	return json(
		docs.map((d) =>
			toSessionDTO(
				d as unknown as Parameters<typeof toSessionDTO>[0],
				nameById.get(String(d.exerciseId))
			)
		)
	);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');

	const body = await request.json().catch(() => null);
	if (!body) throw error(400, 'Body erforderlich');

	const { exerciseId, date, sets, note } = body;
	if (!mongoose.isValidObjectId(exerciseId)) throw error(400, 'Ungültige exerciseId');
	const cleanSets = parseSessionSets(sets);

	await connectDB();
	const exercise = await Exercise.findById(exerciseId);
	if (!exercise) throw error(404, 'Übung nicht gefunden');

	const sessionDate = date ? new Date(date) : new Date();
	if (isNaN(sessionDate.getTime())) throw error(400, 'Ungültiges Datum');

	const doc = await Session.create({
		userId: locals.user.id,
		exerciseId,
		date: sessionDate,
		sets: cleanSets,
		note: typeof note === 'string' ? note.slice(0, 500) : ''
	});

	return json(toSessionDTO(doc as unknown as Parameters<typeof toSessionDTO>[0], exercise.name), {
		status: 201
	});
};
