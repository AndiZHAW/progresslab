import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generatePlanTemplates } from '$lib/server/profile-service';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');
	const plan = await generatePlanTemplates(locals.user.id);
	return json(plan, { status: 201 });
};
