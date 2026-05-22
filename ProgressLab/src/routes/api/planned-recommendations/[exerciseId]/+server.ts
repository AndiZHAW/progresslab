import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deletePlannedRecommendation } from '$lib/server/planned-recommendation-service';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	const deleted = await deletePlannedRecommendation(locals.user.id, params.exerciseId);
	if (!deleted) throw error(404, 'Geplante Empfehlung nicht gefunden');
	return json({ ok: true });
};
