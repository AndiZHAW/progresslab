import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getStats } from '$lib/server/stats-service';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	const stats = await getStats(locals.user.id);
	return { stats };
};
