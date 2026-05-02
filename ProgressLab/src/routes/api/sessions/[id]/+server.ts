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
	return json(
		toSessionDTO(doc as unknown as Parameters<typeof toSessionDTO>[0], exercise?.name)
	);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	if (!mongoose.isValidObjectId(params.id)) throw error(400, 'Ungültige ID');

	await connectDB();
	const result = await Session.deleteOne({ _id: params.id, userId: locals.user.id });
	if (result.deletedCount === 0) throw error(404, 'Session nicht gefunden');
	return json({ ok: true });
};
