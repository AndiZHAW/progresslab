import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { Template } from '$lib/server/models/Template';
import { listTemplates } from '$lib/server/template-service';
import { assertExercisesExist, parseExerciseIds } from '$lib/server/validation';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	const templates = await listTemplates(locals.user.id);
	return json(templates);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');

	const body = await request.json().catch(() => null);
	if (!body) throw error(400, 'Body erforderlich');

	const { name, description, exerciseIds } = body;
	if (typeof name !== 'string' || name.trim().length === 0) throw error(400, 'Name erforderlich');
	const cleanExerciseIds = parseExerciseIds(exerciseIds);

	await connectDB();
	await assertExercisesExist(cleanExerciseIds);
	try {
		const doc = await Template.create({
			userId: locals.user.id,
			name: name.trim(),
			description: typeof description === 'string' ? description.trim().slice(0, 300) : '',
			exerciseIds: cleanExerciseIds
		});
		return json({ id: String(doc._id) }, { status: 201 });
	} catch (e) {
		const err = e as { code?: number; message?: string };
		if (err.code === 11000) throw error(409, 'Template mit diesem Namen existiert bereits');
		throw error(400, err.message ?? 'Fehler beim Speichern');
	}
};
