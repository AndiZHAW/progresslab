import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { savePlannedRecommendation } from '$lib/server/planned-recommendation-service';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	const body = await request.json().catch(() => null);
	if (!body) throw error(400, 'Body erforderlich');

	const planned = await savePlannedRecommendation(locals.user.id, body);
	return json(planned, { status: 201 });
};
