import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listTemplates } from '$lib/server/template-service';
import { connectDB } from '$lib/server/db';
import { Exercise } from '$lib/server/models/Exercise';
import { toExerciseDTO } from '$lib/server/dto';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');

	const [templates] = await Promise.all([listTemplates(locals.user.id)]);
	await connectDB();
	const exDocs = await Exercise.find().sort({ name: 1 }).lean();
	const exercises = exDocs.map((d) =>
		toExerciseDTO(d as unknown as Parameters<typeof toExerciseDTO>[0])
	);

	return { templates, exercises };
};
