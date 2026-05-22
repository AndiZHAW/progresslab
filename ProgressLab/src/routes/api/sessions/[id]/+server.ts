import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import mongoose from 'mongoose';
import { connectDB } from '$lib/server/db';
import { Session } from '$lib/server/models/Session';
import { Exercise } from '$lib/server/models/Exercise';
import { toSessionDTO } from '$lib/server/dto';
import { parseSessionSets } from '$lib/server/validation';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	if (!mongoose.isValidObjectId(params.id)) throw error(400, 'Ungültige ID');

	await connectDB();
	const doc = await Session.findOne({ _id: params.id, userId: locals.user.id }).lean();
	if (!doc) throw error(404, 'Session nicht gefunden');
	const exercise = await Exercise.findById(doc.exerciseId).select('name').lean();
	return json(toSessionDTO(doc as unknown as Parameters<typeof toSessionDTO>[0], exercise?.name));
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	if (!mongoose.isValidObjectId(params.id)) throw error(400, 'Ungültige ID');

	const body = await request.json().catch(() => null);
	if (!body) throw error(400, 'Body erforderlich');

	const { date, sets, note } = body;
	const cleanSets = parseSessionSets(sets);

	const update: Record<string, unknown> = { sets: cleanSets };
	if (date) {
		const d = new Date(date);
		if (isNaN(d.getTime())) throw error(400, 'Ungültiges Datum');
		update.date = d;
	}
	if (typeof note === 'string') update.note = note.slice(0, 500);

	await connectDB();
	const doc = await Session.findOneAndUpdate({ _id: params.id, userId: locals.user.id }, update, {
		returnDocument: 'after',
		runValidators: true
	}).lean();
	if (!doc) throw error(404, 'Session nicht gefunden');

	const exercise = await Exercise.findById(doc.exerciseId).select('name').lean();
	return json(toSessionDTO(doc as unknown as Parameters<typeof toSessionDTO>[0], exercise?.name));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	if (!mongoose.isValidObjectId(params.id)) throw error(400, 'Ungültige ID');

	await connectDB();
	const result = await Session.deleteOne({ _id: params.id, userId: locals.user.id });
	if (result.deletedCount === 0) throw error(404, 'Session nicht gefunden');
	return json({ ok: true });
};
