import type { Recommendation } from './types';

export function formatRecommendation(rec: Recommendation): string {
	const reps = `${rec.reps} Reps`;
	if (rec.isBodyweight || rec.weight === null) return `BW × ${reps}`;
	return `${rec.weight} kg × ${reps}`;
}

export function formatDate(value: string | Date): string {
	const d = typeof value === 'string' ? new Date(value) : value;
	return d.toLocaleDateString('de-CH', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
}

export function formatDateShort(value: string | Date): string {
	const d = typeof value === 'string' ? new Date(value) : value;
	return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
}

export function avgRpe(sets: { rpe: number }[]): number {
	if (sets.length === 0) return 0;
	return sets.reduce((s, x) => s + x.rpe, 0) / sets.length;
}

export function topWeight(sets: { weight: number }[]): number {
	if (sets.length === 0) return 0;
	return Math.max(...sets.map((s) => s.weight));
}

export function topReps(sets: { reps: number }[]): number {
	if (sets.length === 0) return 0;
	return Math.max(...sets.map((s) => s.reps));
}
