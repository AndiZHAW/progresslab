import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import mongoose from 'mongoose';
import { connectDB } from '$lib/server/db';
import { Session } from '$lib/server/models/Session';
import { Exercise } from '$lib/server/models/Exercise';
import { toSessionDTO } from '$lib/server/dto';

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
	if (!Array.isArray(sets) || sets.length === 0)
		throw error(400, 'Mindestens ein Satz erforderlich');

	const cleanSets = sets.map((s, i) => {
		const weight = Number(s.weight);
		const reps = Number(s.reps);
		const rpe = Number(s.rpe);
		if (!Number.isFinite(weight) || weight < 0 || weight > 1000)
			throw error(400, `Satz ${i + 1}: Gewicht muss zwischen 0 und 1000 kg liegen`);
		if (!Number.isInteger(reps) || reps < 1 || reps > 100)
			throw error(400, `Satz ${i + 1}: Reps müssen 1–100 sein`);
		if (!Number.isFinite(rpe) || rpe < 1 || rpe > 10)
			throw error(400, `Satz ${i + 1}: RPE muss 1–10 sein`);
		return { weight, reps, rpe };
	});

	const update: Record<string, unknown> = { sets: cleanSets };
	if (date) {
		const d = new Date(date);
		if (isNaN(d.getTime())) throw error(400, 'Ungültiges Datum');
		update.date = d;
	}
	if (typeof note === 'string') update.note = note.slice(0, 500);

	await connectDB();
	const doc = await Session.findOneAndUpdate(
		{ _id: params.id, userId: locals.user.id },
		update,
		{ new: true, runValidators: true }
	).lean();
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
