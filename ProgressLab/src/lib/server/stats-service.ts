import { connectDB } from './db';
import { Exercise } from './models/Exercise';
import { Session } from './models/Session';

export type StatsSummary = {
	totalSessions: number;
	totalSets: number;
	totalVolume: number;
	totalReps: number;
	avgSessionsPerWeek: number;
	currentStreakDays: number;
	longestStreakDays: number;
	uniqueExercises: number;
	firstSessionDate: string | null;
	lastSessionDate: string | null;
	categoryVolume: Record<'push' | 'pull' | 'legs', number>;
	weeklyVolume: { weekStart: string; volume: number; sessions: number }[];
	weeklySessions: { weekStart: string; sessions: number }[];
	topExercisesByVolume: { exerciseId: string; name: string; volume: number; sessions: number }[];
};

function startOfWeek(d: Date): Date {
	const date = new Date(d);
	date.setHours(0, 0, 0, 0);
	const day = date.getDay();
	const diff = (day === 0 ? -6 : 1) - day;
	date.setDate(date.getDate() + diff);
	return date;
}

function startOfDay(d: Date): Date {
	const date = new Date(d);
	date.setHours(0, 0, 0, 0);
	return date;
}

function computeStreak(sessionDates: Date[]): { current: number; longest: number } {
	if (sessionDates.length === 0) return { current: 0, longest: 0 };

	const days = new Set(sessionDates.map((d) => +startOfDay(d)));
	const sortedDays = [...days].sort((a, b) => a - b);

	let longest = 1;
	let run = 1;
	const dayMs = 86400000;
	for (let i = 1; i < sortedDays.length; i++) {
		const gap = (sortedDays[i] - sortedDays[i - 1]) / dayMs;
		if (gap === 1) {
			run += 1;
			longest = Math.max(longest, run);
		} else if (gap > 1) {
			run = 1;
		}
	}

	const today = +startOfDay(new Date());
	const yesterday = today - dayMs;
	let current = 0;
	if (days.has(today) || days.has(yesterday)) {
		let cursor = days.has(today) ? today : yesterday;
		while (days.has(cursor)) {
			current += 1;
			cursor -= dayMs;
		}
	}

	return { current, longest };
}

export async function getStats(userId: string): Promise<StatsSummary> {
	await connectDB();
	const sessions = await Session.find({ userId }).sort({ date: 1 }).lean();
	const exercises = await Exercise.find().select('name category').lean();
	const exMap = new Map(exercises.map((e) => [String(e._id), e]));

	if (sessions.length === 0) {
		return {
			totalSessions: 0,
			totalSets: 0,
			totalVolume: 0,
			totalReps: 0,
			avgSessionsPerWeek: 0,
			currentStreakDays: 0,
			longestStreakDays: 0,
			uniqueExercises: 0,
			firstSessionDate: null,
			lastSessionDate: null,
			categoryVolume: { push: 0, pull: 0, legs: 0 },
			weeklyVolume: [],
			weeklySessions: [],
			topExercisesByVolume: []
		};
	}

	let totalSets = 0;
	let totalVolume = 0;
	let totalReps = 0;
	const categoryVolume: Record<'push' | 'pull' | 'legs', number> = { push: 0, pull: 0, legs: 0 };
	const exerciseStats = new Map<string, { name: string; volume: number; sessions: number }>();
	const weekly = new Map<string, { volume: number; sessions: number }>();
	const sessionDates: Date[] = [];
	const uniqueIds = new Set<string>();

	for (const s of sessions) {
		const exId = String(s.exerciseId);
		const ex = exMap.get(exId);
		const sessionVolume = s.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
		const sessionReps = s.sets.reduce((sum, set) => sum + set.reps, 0);
		totalSets += s.sets.length;
		totalVolume += sessionVolume;
		totalReps += sessionReps;
		uniqueIds.add(exId);
		sessionDates.push(new Date(s.date));

		if (ex) {
			const category = ex.category as 'push' | 'pull' | 'legs';
			if (categoryVolume[category] !== undefined) categoryVolume[category] += sessionVolume;
			const existing = exerciseStats.get(exId) ?? { name: ex.name, volume: 0, sessions: 0 };
			existing.volume += sessionVolume;
			existing.sessions += 1;
			exerciseStats.set(exId, existing);
		}

		const weekStart = startOfWeek(new Date(s.date)).toISOString();
		const w = weekly.get(weekStart) ?? { volume: 0, sessions: 0 };
		w.volume += sessionVolume;
		w.sessions += 1;
		weekly.set(weekStart, w);
	}

	const firstDate = sessions[0].date as Date;
	const lastDate = sessions[sessions.length - 1].date as Date;
	const totalDays = Math.max(1, (+new Date(lastDate) - +new Date(firstDate)) / 86400000);
	const totalWeeks = Math.max(1, totalDays / 7);
	const streak = computeStreak(sessionDates);

	const weeklyEntries = [...weekly.entries()]
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([weekStart, v]) => ({ weekStart, volume: +v.volume.toFixed(1), sessions: v.sessions }));

	const topExercises = [...exerciseStats.entries()]
		.map(([exerciseId, v]) => ({ exerciseId, ...v, volume: +v.volume.toFixed(1) }))
		.sort((a, b) => b.volume - a.volume)
		.slice(0, 6);

	return {
		totalSessions: sessions.length,
		totalSets,
		totalVolume: +totalVolume.toFixed(1),
		totalReps,
		avgSessionsPerWeek: +(sessions.length / totalWeeks).toFixed(2),
		currentStreakDays: streak.current,
		longestStreakDays: streak.longest,
		uniqueExercises: uniqueIds.size,
		firstSessionDate: new Date(firstDate).toISOString(),
		lastSessionDate: new Date(lastDate).toISOString(),
		categoryVolume: {
			push: +categoryVolume.push.toFixed(1),
			pull: +categoryVolume.pull.toFixed(1),
			legs: +categoryVolume.legs.toFixed(1)
		},
		weeklyVolume: weeklyEntries.map((w) => ({
			weekStart: w.weekStart,
			volume: w.volume,
			sessions: w.sessions
		})),
		weeklySessions: weeklyEntries.map((w) => ({ weekStart: w.weekStart, sessions: w.sessions })),
		topExercisesByVolume: topExercises
	};
}
