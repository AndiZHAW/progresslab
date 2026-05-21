import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAthleteProfile } from '$lib/server/profile-service';
import { listTemplates } from '$lib/server/template-service';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	const [profile, templates] = await Promise.all([
		getAthleteProfile(locals.user.id),
		listTemplates(locals.user.id)
	]);
	return {
		profile,
		generatedCount: templates.filter((template) => template.source === 'generated').length
	};
};
