import type { Recommendation, Trend } from './server/recommendation';

export type ExerciseDTO = {
	id: string;
	name: string;
	category: 'push' | 'pull' | 'legs';
	muscleGroup: string;
	isBodyweight: boolean;
	defaultRepTarget: number;
	defaultRpeTarget: number;
};

export type SetDTO = { weight: number; reps: number; rpe: number };

export type SessionDTO = {
	id: string;
	exerciseId: string;
	exerciseName?: string;
	date: string;
	sets: SetDTO[];
	note: string;
};

export type ExerciseWithRecDTO = ExerciseDTO & {
	recommendation: Recommendation;
	lastSession: SessionDTO | null;
	sparkline: number[];
};

export type { Recommendation, Trend };
