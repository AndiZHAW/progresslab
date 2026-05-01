import type { ExerciseDoc } from './models/Exercise';
import type { SessionDoc } from './models/Session';
import type { ExerciseDTO, SessionDTO } from '../types';

export function toExerciseDTO(doc: ExerciseDoc & { _id: unknown }): ExerciseDTO {
	return {
		id: String(doc._id),
		name: doc.name,
		category: doc.category as ExerciseDTO['category'],
		muscleGroup: doc.muscleGroup ?? '',
		isBodyweight: !!doc.isBodyweight,
		defaultRepTarget: doc.defaultRepTarget ?? 5,
		defaultRpeTarget: doc.defaultRpeTarget ?? 7
	};
}

export function toSessionDTO(
	doc: SessionDoc & { _id: unknown; exerciseId: unknown },
	exerciseName?: string
): SessionDTO {
	return {
		id: String(doc._id),
		exerciseId: String(doc.exerciseId),
		exerciseName,
		date: new Date(doc.date).toISOString(),
		sets: doc.sets.map((s) => ({ weight: s.weight, reps: s.reps, rpe: s.rpe })),
		note: doc.note ?? ''
	};
}
