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
	const exerciseIds = template.exercises.map((e) => e.id);
	const [recentSessions, templateSessions] = await Promise.all([
		Session.find({
			userId: locals.user.id,
			exerciseId: { $in: exerciseIds },
			date: { $gte: fourHoursAgo }
		})
			.sort({ date: -1 })
			.lean(),
		Session.find({
			userId: locals.user.id,
			exerciseId: { $in: exerciseIds }
		})
			.sort({ date: -1 })
			.lean()
	]);

	const loggedNow = new Set(recentSessions.map((s) => String(s.exerciseId)));
	const sessionsByExercise = new Map<string, typeof templateSessions>();
	for (const session of templateSessions) {
		const key = String(session.exerciseId);
		const sessions = sessionsByExercise.get(key) ?? [];
		sessions.push(session);
		sessionsByExercise.set(key, sessions);
	}

	const exercisesWithRec = template.exercises.map((ex) => {
		const allSessions = sessionsByExercise.get(ex.id) ?? [];
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
	});

	return {
		template,
		exercisesWithStatus: exercisesWithRec
	};
};
