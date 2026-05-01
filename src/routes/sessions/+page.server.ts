import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { Session } from '$lib/server/models/Session';
import { Exercise } from '$lib/server/models/Exercise';
import { toSessionDTO } from '$lib/server/dto';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	await connectDB();

	const docs = await Session.find({ userId: locals.user.id }).sort({ date: -1 }).limit(100).lean();
	const exerciseIds = [...new Set(docs.map((d) => String(d.exerciseId)))];
	const exercises = await Exercise.find({ _id: { $in: exerciseIds } })
		.select('name category')
		.lean();
	const map = new Map(exercises.map((e) => [String(e._id), e]));

	const sessions = docs.map((d) => {
		const ex = map.get(String(d.exerciseId));
		return {
			...toSessionDTO(d as unknown as Parameters<typeof toSessionDTO>[0], ex?.name),
			category: ex?.category ?? null
		};
	});
	return { sessions };
};
