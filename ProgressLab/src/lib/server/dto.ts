import type { ExerciseDoc } from './models/Exercise';
import type { PlannedRecommendationDoc } from './models/PlannedRecommendation';
import type { SessionDoc } from './models/Session';
import type { ExerciseDTO, PlannedRecommendationDTO, SessionDTO } from '../types';

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

export function toPlannedRecommendationDTO(
	doc: PlannedRecommendationDoc & {
		_id: unknown;
		exerciseId: unknown;
		createdAt?: unknown;
		updatedAt?: unknown;
	}
): PlannedRecommendationDTO {
	return {
		id: String(doc._id),
		exerciseId: String(doc.exerciseId),
		weight: typeof doc.weight === 'number' ? doc.weight : null,
		reps: doc.reps,
		rpeTarget: doc.rpeTarget,
		reason: doc.reason,
		source: doc.source === 'manual' ? 'manual' : 'coach',
		createdAt: new Date(doc.createdAt ?? Date.now()).toISOString(),
		updatedAt: new Date(doc.updatedAt ?? Date.now()).toISOString()
	};
}
