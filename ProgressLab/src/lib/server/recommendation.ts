import type { SessionDoc } from './models/Session';

export type Trend = 'up' | 'flat' | 'down';

export type Recommendation = {
	weight: number | null;
	reps: number;
	rpeTarget: number;
	reason: string;
	trend: Trend;
	isBodyweight: boolean;
	deload: boolean;
	estimated1RM: number | null;
};

export type PR = {
	topWeight: { weight: number; reps: number; date: string } | null;
	topReps: { weight: number; reps: number; date: string } | null;
	estimated1RM: { value: number; weight: number; reps: number; date: string } | null;
	bestVolume: { value: number; date: string } | null;
};

type SessionLite = Pick<SessionDoc, 'sets' | 'date'>;

type RecommendationOptions = {
	isBodyweight: boolean;
	defaultRepTarget: number;
	defaultRpeTarget: number;
	name?: string;
	muscleGroup?: string;
	category?: 'push' | 'pull' | 'legs';
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

function isSmallStepExercise(opts: RecommendationOptions): boolean {
	const text = `${opts.name ?? ''} ${opts.muscleGroup ?? ''}`.toLowerCase();
	return [
		'raise',
		'curl',
		'pushdown',
		'face pull',
		'lateral',
		'hammer',
		'triceps',
		'biceps',
		'waden',
		'calf',
		'leg curl',
		'leg extension',
		'seitheben',
		'flies'
	].some((marker) => text.includes(marker));
}

function progressionForWeightedExercise(
	opts: RecommendationOptions,
	lastTopWeight: number,
	lastTopReps: number,
	lastAvgRpe: number
): Pick<Recommendation, 'weight' | 'reps' | 'reason'> {
	if (!isSmallStepExercise(opts)) {
		return {
			weight: +(lastTopWeight + 2.5).toFixed(1),
			reps: lastTopReps,
			reason: `RPE ${lastAvgRpe.toFixed(1)} – +2.5 kg`
		};
	}

	if (lastTopReps < opts.defaultRepTarget + 3) {
		return {
			weight: lastTopWeight,
			reps: lastTopReps + 1,
			reason: `RPE ${lastAvgRpe.toFixed(1)} – +1 Rep (kleine Übung)`
		};
	}

	return {
		weight: +(lastTopWeight + 1).toFixed(1),
		reps: opts.defaultRepTarget,
		reason: `RPE ${lastAvgRpe.toFixed(1)} – +1 kg (kleine Übung)`
	};
}

export function epley1RM(weight: number, reps: number): number {
	if (reps <= 0 || weight <= 0) return 0;
	if (reps === 1) return weight;
	return +(weight * (1 + reps / 30)).toFixed(1);
}

export function buildRecommendation(
	sessions: SessionLite[],
	opts: RecommendationOptions
): Recommendation {
	if (sessions.length === 0) {
		return {
			weight: opts.isBodyweight ? null : 0,
			reps: opts.defaultRepTarget,
			rpeTarget: opts.defaultRpeTarget,
			reason: 'Erste Session – Startwerte erfassen',
			trend: 'flat',
			isBodyweight: opts.isBodyweight,
			deload: false,
			estimated1RM: null
		};
	}

	const sorted = [...sessions].sort((a, b) => +new Date(b.date) - +new Date(a.date));
	const last = sorted[0];
	const lastTopWeight = Math.max(...last.sets.map((s) => s.weight));
	const lastTopReps = Math.max(...last.sets.map((s) => s.reps));
	const lastAvgRpe = avg(last.sets.map((s) => s.rpe));

	const e1rm = opts.isBodyweight ? null : epley1RM(lastTopWeight, lastTopReps);

	const recent = sorted.slice(0, 3);
	const trend: Trend =
		recent.length < 2
			? 'flat'
			: (() => {
					const top = recent.map((s) => Math.max(...s.sets.map((x) => x.weight)));
					if (top[0] > top[top.length - 1]) return 'up';
					if (top[0] < top[top.length - 1]) return 'down';
					return 'flat';
				})();

	if (lastAvgRpe >= 9) {
		const newWeight = opts.isBodyweight ? null : Math.max(0, +(lastTopWeight * 0.9).toFixed(1));
		return {
			weight: newWeight,
			reps: lastTopReps,
			rpeTarget: opts.defaultRpeTarget,
			reason: `RPE ${lastAvgRpe.toFixed(1)} → Deload −10 %`,
			trend: 'down',
			isBodyweight: opts.isBodyweight,
			deload: true,
			estimated1RM: e1rm
		};
	}

	if (lastAvgRpe <= 7) {
		if (opts.isBodyweight) {
			return {
				weight: null,
				reps: lastTopReps + 1,
				rpeTarget: opts.defaultRpeTarget,
				reason: `RPE ${lastAvgRpe.toFixed(1)} – +1 Rep`,
				trend,
				isBodyweight: true,
				deload: false,
				estimated1RM: null
			};
		}
		const progression = progressionForWeightedExercise(
			opts,
			lastTopWeight,
			lastTopReps,
			lastAvgRpe
		);
		return {
			weight: progression.weight,
			reps: progression.reps,
			rpeTarget: opts.defaultRpeTarget,
			reason: progression.reason,
			trend,
			isBodyweight: false,
			deload: false,
			estimated1RM: e1rm
		};
	}

	return {
		weight: opts.isBodyweight ? null : lastTopWeight,
		reps: lastTopReps,
		rpeTarget: opts.defaultRpeTarget,
		reason: `RPE ${lastAvgRpe.toFixed(1)} – Gewicht halten`,
		trend,
		isBodyweight: opts.isBodyweight,
		deload: false,
		estimated1RM: e1rm
	};
}

export function formatRecommendation(rec: Recommendation): string {
	const reps = `${rec.reps} Reps`;
	if (rec.isBodyweight || rec.weight === null) return `BW × ${reps}`;
	return `${rec.weight} kg × ${reps}`;
}

export function computePR(sessions: SessionLite[], isBodyweight: boolean): PR {
	if (sessions.length === 0) {
		return { topWeight: null, topReps: null, estimated1RM: null, bestVolume: null };
	}

	let topWeight: PR['topWeight'] = null;
	let topReps: PR['topReps'] = null;
	let bestE1RM: PR['estimated1RM'] = null;
	let bestVolume: PR['bestVolume'] = null;

	for (const session of sessions) {
		const dateStr = new Date(session.date).toISOString();
		let volume = 0;
		for (const set of session.sets) {
			volume += set.weight * set.reps;
			if (!topWeight || set.weight > topWeight.weight) {
				topWeight = { weight: set.weight, reps: set.reps, date: dateStr };
			}
			if (!topReps || set.reps > topReps.reps) {
				topReps = { weight: set.weight, reps: set.reps, date: dateStr };
			}
			if (!isBodyweight) {
				const value = epley1RM(set.weight, set.reps);
				if (!bestE1RM || value > bestE1RM.value) {
					bestE1RM = { value, weight: set.weight, reps: set.reps, date: dateStr };
				}
			}
		}
		if (!bestVolume || volume > bestVolume.value) {
			bestVolume = { value: +volume.toFixed(1), date: dateStr };
		}
	}

	return { topWeight, topReps, estimated1RM: bestE1RM, bestVolume };
}

export function isPRSession(
	session: SessionLite,
	history: SessionLite[],
	isBodyweight: boolean
): boolean {
	const prior = history.filter((s) => +new Date(s.date) < +new Date(session.date));
	const priorPR = computePR(prior, isBodyweight);
	for (const set of session.sets) {
		if (!priorPR.topWeight || set.weight > priorPR.topWeight.weight) return true;
		if (!isBodyweight) {
			const e = epley1RM(set.weight, set.reps);
			if (!priorPR.estimated1RM || e > priorPR.estimated1RM.value) return true;
		}
	}
	return false;
}
