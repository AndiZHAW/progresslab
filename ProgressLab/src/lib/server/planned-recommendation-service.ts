import { error } from '@sveltejs/kit';
import mongoose from 'mongoose';
import { connectDB } from './db';
import { Exercise } from './models/Exercise';
import {
	PlannedRecommendation,
	type PlannedRecommendationSource
} from './models/PlannedRecommendation';
import { toPlannedRecommendationDTO } from './dto';
import type { PlannedRecommendationDTO, Recommendation } from '$lib/types';

type PlannedRecommendationInput = {
	exerciseId: unknown;
	weight: unknown;
	reps: unknown;
	rpeTarget: unknown;
	reason: unknown;
	source?: unknown;
};

function cleanNumber(
	value: unknown,
	field: string,
	min: number,
	max: number,
	nullable = false
): number | null {
	if ((value === null || value === '') && nullable) return null;
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
		throw error(400, `${field} muss zwischen ${min} und ${max} liegen.`);
	}
	return Math.round(parsed * 10) / 10;
}

function cleanInteger(value: unknown, field: string, min: number, max: number): number {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
		throw error(400, `${field} muss eine ganze Zahl zwischen ${min} und ${max} sein.`);
	}
	return parsed;
}

function cleanSource(value: unknown): PlannedRecommendationSource {
	return value === 'manual' ? 'manual' : 'coach';
}

export function applyPlannedRecommendation(
	recommendation: Recommendation,
	planned: PlannedRecommendationDTO | null
): Recommendation {
	if (!planned) return recommendation;
	return {
		...recommendation,
		weight: planned.weight,
		reps: planned.reps,
		rpeTarget: planned.rpeTarget,
		reason:
			planned.source === 'manual'
				? `Manuell geplant - ${planned.reason}`
				: `Geplant - ${planned.reason}`
	};
}

export async function getPlannedRecommendation(
	userId: string,
	exerciseId: string
): Promise<PlannedRecommendationDTO | null> {
	if (!mongoose.isValidObjectId(exerciseId)) return null;
	await connectDB();
	const doc = await PlannedRecommendation.findOne({
		userId,
		exerciseId,
		status: 'planned'
	}).lean();
	return doc
		? toPlannedRecommendationDTO(doc as unknown as Parameters<typeof toPlannedRecommendationDTO>[0])
		: null;
}

export async function savePlannedRecommendation(
	userId: string,
	input: PlannedRecommendationInput
): Promise<PlannedRecommendationDTO> {
	const exerciseId = String(input.exerciseId);
	if (!mongoose.isValidObjectId(exerciseId)) throw error(400, 'Ungueltige Uebungs-ID');

	await connectDB();
	const exercise = await Exercise.findById(exerciseId).lean();
	if (!exercise) throw error(404, 'Uebung nicht gefunden');

	const weight = cleanNumber(input.weight, 'Gewicht', 0, 1000, !!exercise.isBodyweight);
	const reps = cleanInteger(input.reps, 'Reps', 1, 100);
	const rpeTarget = cleanNumber(input.rpeTarget, 'RPE-Ziel', 1, 10) ?? 7;
	const reason =
		typeof input.reason === 'string' && input.reason.trim()
			? input.reason.trim().slice(0, 180)
			: 'Fuer die naechste Session geplant';

	const filter = {
		userId,
		exerciseId,
		status: 'planned'
	} as const;
	const update = {
		$set: {
			weight,
			reps,
			rpeTarget,
			reason,
			source: cleanSource(input.source),
			status: 'planned'
		}
	} as const;

	const doc = await PlannedRecommendation.findOneAndUpdate(filter, update, {
		upsert: true,
		returnDocument: 'after',
		runValidators: true
	}).lean();

	return toPlannedRecommendationDTO(
		doc as unknown as Parameters<typeof toPlannedRecommendationDTO>[0]
	);
}

export async function completePlannedRecommendation(
	userId: string,
	exerciseId: string
): Promise<void> {
	if (!mongoose.isValidObjectId(exerciseId)) return;
	await connectDB();
	await PlannedRecommendation.updateOne(
		{ userId, exerciseId, status: 'planned' },
		{ $set: { status: 'completed' } }
	);
}

export async function deletePlannedRecommendation(
	userId: string,
	exerciseId: string
): Promise<boolean> {
	if (!mongoose.isValidObjectId(exerciseId)) throw error(400, 'Ungueltige Uebungs-ID');
	await connectDB();
	const result = await PlannedRecommendation.deleteOne({ userId, exerciseId, status: 'planned' });
	return result.deletedCount > 0;
}
