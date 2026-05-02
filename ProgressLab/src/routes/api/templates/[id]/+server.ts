import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import mongoose from 'mongoose';
import { connectDB } from '$lib/server/db';
import { Template } from '$lib/server/models/Template';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	if (!mongoose.isValidObjectId(params.id)) throw error(400, 'Ungültige ID');

	const body = await request.json().catch(() => null);
	if (!body) throw error(400, 'Body erforderlich');

	const update: Record<string, unknown> = {};
	if (typeof body.name === 'string') update.name = body.name.trim();
	if (typeof body.description === 'string') update.description = body.description.trim().slice(0, 300);
	if (Array.isArray(body.exerciseIds)) {
		if (!body.exerciseIds.every((id: unknown) => typeof id === 'string' && mongoose.isValidObjectId(id)))
			throw error(400, 'Ungültige Übungs-IDs');
		if (body.exerciseIds.length === 0) throw error(400, 'Mindestens eine Übung erforderlich');
		update.exerciseIds = body.exerciseIds;
	}

	await connectDB();
	const doc = await Template.findOneAndUpdate(
		{ _id: params.id, userId: locals.user.id },
		update,
		{ new: true, runValidators: true }
	);
	if (!doc) throw error(404, 'Template nicht gefunden');
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	if (!mongoose.isValidObjectId(params.id)) throw error(400, 'Ungültige ID');

	await connectDB();
	const result = await Template.deleteOne({ _id: params.id, userId: locals.user.id });
	if (result.deletedCount === 0) throw error(404, 'Template nicht gefunden');
	return json({ ok: true });
};
