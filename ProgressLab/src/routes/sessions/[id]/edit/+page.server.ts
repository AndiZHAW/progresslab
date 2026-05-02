import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import mongoose from 'mongoose';
import { connectDB } from '$lib/server/db';
import { Session } from '$lib/server/models/Session';
import { Exercise } from '$lib/server/models/Exercise';
import { toSessionDTO, toExerciseDTO } from '$lib/server/dto';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	if (!mongoose.isValidObjectId(params.id)) throw error(400, 'Ungültige ID');

	await connectDB();
	const session = await Session.findOne({ _id: params.id, userId: locals.user.id }).lean();
	if (!session) throw error(404, 'Session nicht gefunden');

	const exercise = await Exercise.findById(session.exerciseId).lean();
	if (!exercise) throw error(404, 'Übung nicht gefunden');

	return {
		session: toSessionDTO(
			session as unknown as Parameters<typeof toSessionDTO>[0],
			exercise.name
		),
		exercise: toExerciseDTO(exercise as unknown as Parameters<typeof toExerciseDTO>[0])
	};
};
