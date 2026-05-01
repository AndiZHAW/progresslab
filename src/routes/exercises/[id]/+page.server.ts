import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import mongoose from 'mongoose';
import { getExerciseDetail } from '$lib/server/exercise-service';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	if (!mongoose.isValidObjectId(params.id)) throw error(400, 'Ungültige ID');

	const detail = await getExerciseDetail(locals.user.id, params.id);
	if (!detail) throw error(404, 'Übung nicht gefunden');
	return detail;
};
