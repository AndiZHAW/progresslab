import { dev } from '$app/environment';
import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { Exercise } from '$lib/server/models/Exercise';
import { toExerciseDTO } from '$lib/server/dto';

export const load: PageServerLoad = async ({ locals }) => {
	await connectDB();
	const docs = await Exercise.find().sort({ name: 1 }).lean();
	const exercises = docs.map((d) =>
		toExerciseDTO(d as unknown as Parameters<typeof toExerciseDTO>[0])
	);
	return {
		exercises,
		readOnlyDemoAdmin: !dev && locals.user?.username === 'admin'
	};
};
