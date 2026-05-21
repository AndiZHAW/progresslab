import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generatePlanTemplates } from '$lib/server/profile-service';
import { checkRateLimit } from '$lib/server/rate-limit';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');

	const limit = checkRateLimit(`plan:${locals.user.id}`, 5, 60_000);
	if (!limit.ok) {
		throw error(429, `Zu viele Plan-Generierungen. Bitte ${limit.retryAfter}s warten.`);
	}

	const plan = await generatePlanTemplates(locals.user.id);
	return json(plan, { status: 201 });
};
