import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAthleteProfile, saveAthleteProfile } from '$lib/server/profile-service';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	return json(await getAthleteProfile(locals.user.id));
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	const body = await request.json().catch(() => null);
	const profile = await saveAthleteProfile(locals.user.id, body);
	return json(profile);
};
