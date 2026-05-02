import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listExercisesWithRecommendation } from '$lib/server/exercise-service';
import { listTemplates } from '$lib/server/template-service';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	const [exercises, templates] = await Promise.all([
		listExercisesWithRecommendation(locals.user.id),
		listTemplates(locals.user.id)
	]);
	return { exercises, templates };
};
