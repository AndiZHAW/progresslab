import { error } from '@sveltejs/kit';
import mongoose from 'mongoose';
import { Exercise } from './models/Exercise';

export type CleanSet = {
	weight: number;
	reps: number;
	rpe: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseListLimit(value: string | null, fallback = 50, max = 200): number {
	if (value === null) return fallback;
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) throw error(400, 'limit muss eine Zahl sein');
	return Math.min(Math.max(Math.trunc(parsed), 1), max);
}

export function parseSessionSets(sets: unknown): CleanSet[] {
	if (!Array.isArray(sets) || sets.length === 0) {
		throw error(400, 'Mindestens ein Satz erforderlich');
	}

	return sets.map((set, i) => {
		if (!isRecord(set)) throw error(400, `Satz ${i + 1}: ungültiges Format`);
		const weight = Number(set.weight);
		const reps = Number(set.reps);
		const rpe = Number(set.rpe);

		if (!Number.isFinite(weight) || weight < 0 || weight > 1000) {
			throw error(400, `Satz ${i + 1}: Gewicht muss zwischen 0 und 1000 kg liegen`);
		}
		if (!Number.isInteger(reps) || reps < 1 || reps > 100) {
			throw error(400, `Satz ${i + 1}: Reps müssen 1–100 sein`);
		}
		if (!Number.isFinite(rpe) || rpe < 1 || rpe > 10) {
			throw error(400, `Satz ${i + 1}: RPE muss 1–10 sein`);
		}

		return { weight, reps, rpe };
	});
}

export function parseExerciseIds(value: unknown): string[] {
	if (!Array.isArray(value) || value.length === 0) {
		throw error(400, 'Mindestens eine Übung erforderlich');
	}
	if (!value.every((id: unknown) => typeof id === 'string' && mongoose.isValidObjectId(id))) {
		throw error(400, 'Ungültige Übungs-IDs');
	}

	const ids = value as string[];
	if (new Set(ids).size !== ids.length) {
		throw error(400, 'Jede Übung darf nur einmal in einer Routine vorkommen');
	}
	return ids;
}

export async function assertExercisesExist(exerciseIds: string[]): Promise<void> {
	const existing = await Exercise.countDocuments({ _id: { $in: exerciseIds } });
	if (existing !== exerciseIds.length) {
		throw error(400, 'Eine oder mehrere Übungen existieren nicht');
	}
}
