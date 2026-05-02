import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listRecords } from '$lib/server/records-service';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	const records = await listRecords(locals.user.id);
	return { records };
};
