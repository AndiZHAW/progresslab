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
};

type SessionLite = Pick<SessionDoc, 'sets' | 'date'>;

const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

export function buildRecommendation(
	sessions: SessionLite[],
	opts: { isBodyweight: boolean; defaultRepTarget: number; defaultRpeTarget: number }
): Recommendation {
	if (sessions.length === 0) {
		return {
			weight: opts.isBodyweight ? null : 0,
			reps: opts.defaultRepTarget,
			rpeTarget: opts.defaultRpeTarget,
			reason: 'Erste Session – Startwerte erfassen',
			trend: 'flat',
			isBodyweight: opts.isBodyweight,
			deload: false
		};
	}

	const sorted = [...sessions].sort((a, b) => +new Date(b.date) - +new Date(a.date));
	const last = sorted[0];
	const lastTopWeight = Math.max(...last.sets.map((s) => s.weight));
	const lastTopReps = Math.max(...last.sets.map((s) => s.reps));
	const lastAvgRpe = avg(last.sets.map((s) => s.rpe));

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
			deload: true
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
				deload: false
			};
		}
		return {
			weight: +(lastTopWeight + 2.5).toFixed(1),
			reps: lastTopReps,
			rpeTarget: opts.defaultRpeTarget,
			reason: `RPE ${lastAvgRpe.toFixed(1)} – +2.5 kg`,
			trend,
			isBodyweight: false,
			deload: false
		};
	}

	return {
		weight: opts.isBodyweight ? null : lastTopWeight,
		reps: lastTopReps,
		rpeTarget: opts.defaultRpeTarget,
		reason: `RPE ${lastAvgRpe.toFixed(1)} – Gewicht halten`,
		trend,
		isBodyweight: opts.isBodyweight,
		deload: false
	};
}

export function formatRecommendation(rec: Recommendation): string {
	const reps = `${rec.reps} Reps`;
	if (rec.isBodyweight || rec.weight === null) return `BW × ${reps}`;
	return `${rec.weight} kg × ${reps}`;
}
