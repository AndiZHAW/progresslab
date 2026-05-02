import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listExercisesWithRecommendation } from '$lib/server/exercise-service';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	const exercises = await listExercisesWithRecommendation(locals.user.id);
	return { exercises };
};
