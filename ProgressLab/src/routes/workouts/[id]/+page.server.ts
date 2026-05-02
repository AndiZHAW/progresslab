import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTemplate } from '$lib/server/template-service';
import { connectDB } from '$lib/server/db';
import { Session } from '$lib/server/models/Session';
import { buildRecommendation } from '$lib/server/recommendation';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) throw redirect(303, '/login');

	const template = await getTemplate(locals.user.id, params.id);
	if (!template) throw error(404, 'Routine nicht gefunden');

	await connectDB();
	const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
	const recentSessions = await Session.find({
		userId: locals.user.id,
		exerciseId: { $in: template.exercises.map((e) => e.id) },
		date: { $gte: fourHoursAgo }
	})
		.sort({ date: -1 })
		.lean();

	const loggedNow = new Set(recentSessions.map((s) => String(s.exerciseId)));

	const exercisesWithRec = await Promise.all(
		template.exercises.map(async (ex) => {
			const allSessions = await Session.find({
				userId: locals.user!.id,
				exerciseId: ex.id
			})
				.sort({ date: -1 })
				.lean();
			const recommendation = buildRecommendation(allSessions, {
				isBodyweight: ex.isBodyweight,
				defaultRepTarget: ex.defaultRepTarget,
				defaultRpeTarget: ex.defaultRpeTarget
			});
			return {
				...ex,
				recommendation,
				doneNow: loggedNow.has(ex.id)
			};
		})
	);

	return {
		template,
		exercisesWithStatus: exercisesWithRec
	};
};
