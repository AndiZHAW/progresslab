import { error } from '@sveltejs/kit';
import { connectDB } from './db';
import { Exercise } from './models/Exercise';
import { Profile } from './models/Profile';
import {
	PROFILE_EQUIPMENT,
	PROFILE_EXPERIENCES,
	PROFILE_GOALS,
	PROFILE_SPLITS,
	type ProfileEquipment,
	type ProfileExperience,
	type ProfileGoal,
	type ProfileSplit
} from './models/Profile';
import { Template } from './models/Template';

export type AthleteProfileDTO = {
	heightCm: number | null;
	bodyWeightKg: number | null;
	experience: ProfileExperience;
	goal: ProfileGoal;
	trainingDays: number;
	splitPreference: ProfileSplit;
	equipment: ProfileEquipment;
	limitations: string;
};

export type PlanBlueprint = {
	key: string;
	name: string;
	description: string;
	exerciseNames: string[];
};

export type GeneratedPlanDTO = {
	profile: AthleteProfileDTO;
	templates: Array<{
		id: string;
		name: string;
		description: string;
		exerciseCount: number;
	}>;
};

const DEFAULT_PROFILE: AthleteProfileDTO = {
	heightCm: null,
	bodyWeightKg: null,
	experience: 'intermediate',
	goal: 'balanced',
	trainingDays: 3,
	splitPreference: 'auto',
	equipment: 'gym',
	limitations: ''
};

const GOAL_LABELS: Record<ProfileGoal, string> = {
	hypertrophy: 'Hypertrophy',
	strength: 'Strength',
	balanced: 'Balanced'
};

const GOAL_HINTS: Record<ProfileGoal, string> = {
	hypertrophy: '8-15 Reps, mehr Volumen, kontrollierte Progression',
	strength: '3-6 Reps bei Grundübungen, längere Pausen, klare Top-Sets',
	balanced: '5-10 Reps, Mischung aus Kraft und Muskelaufbau'
};

const BASE_EXERCISES = {
	upper: [
		'Bench Press',
		'Incline DB Press',
		'Cable Row',
		'Pull-up',
		'Overhead Press',
		'Lateral Raise',
		'Triceps Pushdown',
		'Barbell Curl'
	],
	lower: [
		'Back Squat',
		'Romanian Deadlift',
		'Leg Press',
		'Hip Thrust',
		'Leg Curl',
		'Standing Calf Raise'
	],
	push: [
		'Bench Press',
		'Incline DB Press',
		'Overhead Press',
		'Lateral Raise',
		'Triceps Pushdown',
		'Dips'
	],
	pull: ['Deadlift', 'Pull-up', 'Barbell Row', 'Lat Pulldown', 'Cable Row', 'Barbell Curl'],
	legs: [
		'Back Squat',
		'Romanian Deadlift',
		'Leg Press',
		'Walking Lunge',
		'Leg Curl',
		'Standing Calf Raise'
	],
	fullA: ['Back Squat', 'Bench Press', 'Barbell Row', 'Leg Curl', 'Triceps Pushdown'],
	fullB: ['Deadlift', 'Overhead Press', 'Pull-up', 'Leg Press', 'Barbell Curl'],
	fullC: ['Romanian Deadlift', 'Incline DB Press', 'Cable Row', 'Walking Lunge', 'Face Pull']
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clampInteger(value: unknown, fallback: number, min: number, max: number): number {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return fallback;
	return Math.min(Math.max(Math.trunc(parsed), min), max);
}

function enumValue<T extends readonly string[]>(
	value: unknown,
	allowed: T,
	fallback: T[number]
): T[number] {
	return typeof value === 'string' && allowed.includes(value) ? value : fallback;
}

// --- Strict validators for user input (used in normalizeProfileInput).
// Sie werfen 400er-Errors mit klaren Hinweisen, damit das UI Banner anzeigen kann
// statt dass der User stumm geclamped wird.

function strictOptionalNumber(
	value: unknown,
	field: string,
	min: number,
	max: number
): number | null {
	if (value === '' || value === null || value === undefined) return null;
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) {
		throw error(400, `${field} muss eine Zahl sein.`);
	}
	if (parsed < min || parsed > max) {
		throw error(400, `${field} muss zwischen ${min} und ${max} liegen.`);
	}
	return Math.round(parsed * 10) / 10;
}

function strictInteger(value: unknown, field: string, min: number, max: number): number {
	if (value === '' || value === null || value === undefined) {
		throw error(400, `${field} ist erforderlich.`);
	}
	const parsed = Number(value);
	if (!Number.isInteger(parsed)) {
		throw error(400, `${field} muss eine ganze Zahl sein.`);
	}
	if (parsed < min || parsed > max) {
		throw error(400, `${field} muss zwischen ${min} und ${max} liegen.`);
	}
	return parsed;
}

function strictEnumValue<T extends readonly string[]>(
	value: unknown,
	field: string,
	allowed: T
): T[number] {
	if (typeof value !== 'string' || !allowed.includes(value)) {
		throw error(400, `${field}: erlaubt sind ${allowed.join(', ')}.`);
	}
	return value as T[number];
}

function toProfileDTO(doc: unknown): AthleteProfileDTO {
	if (!isRecord(doc)) return { ...DEFAULT_PROFILE };
	return {
		heightCm: typeof doc.heightCm === 'number' ? doc.heightCm : null,
		bodyWeightKg: typeof doc.bodyWeightKg === 'number' ? doc.bodyWeightKg : null,
		experience: enumValue(doc.experience, PROFILE_EXPERIENCES, DEFAULT_PROFILE.experience),
		goal: enumValue(doc.goal, PROFILE_GOALS, DEFAULT_PROFILE.goal),
		trainingDays: clampInteger(doc.trainingDays, DEFAULT_PROFILE.trainingDays, 2, 6),
		splitPreference: enumValue(
			doc.splitPreference,
			PROFILE_SPLITS,
			DEFAULT_PROFILE.splitPreference
		),
		equipment: enumValue(doc.equipment, PROFILE_EQUIPMENT, DEFAULT_PROFILE.equipment),
		limitations: typeof doc.limitations === 'string' ? doc.limitations : ''
	};
}

export function normalizeProfileInput(input: unknown): AthleteProfileDTO {
	if (!isRecord(input)) throw error(400, 'Profil-Daten erforderlich');
	const limitations =
		input.limitations === '' || input.limitations === null || input.limitations === undefined
			? ''
			: typeof input.limitations === 'string'
				? input.limitations.trim().slice(0, 300)
				: (() => {
						throw error(400, 'Einschränkungen müssen Text sein.');
					})();

	return {
		heightCm: strictOptionalNumber(input.heightCm, 'Körpergrösse (cm)', 120, 230),
		bodyWeightKg: strictOptionalNumber(input.bodyWeightKg, 'Körpergewicht (kg)', 30, 250),
		experience: strictEnumValue(input.experience, 'Erfahrungslevel', PROFILE_EXPERIENCES),
		goal: strictEnumValue(input.goal, 'Trainingsziel', PROFILE_GOALS),
		trainingDays: strictInteger(input.trainingDays, 'Trainingstage/Woche', 2, 6),
		splitPreference: strictEnumValue(input.splitPreference, 'Split-Präferenz', PROFILE_SPLITS),
		equipment: strictEnumValue(input.equipment, 'Equipment', PROFILE_EQUIPMENT),
		limitations
	};
}

export async function getAthleteProfile(userId: string): Promise<AthleteProfileDTO> {
	await connectDB();
	const doc = await Profile.findOne({ userId }).lean();
	return toProfileDTO(doc);
}

export async function saveAthleteProfile(
	userId: string,
	input: unknown
): Promise<AthleteProfileDTO> {
	const clean = normalizeProfileInput(input);
	await connectDB();
	const doc = await Profile.findOneAndUpdate(
		{ userId },
		{ $set: clean },
		{ upsert: true, runValidators: true, returnDocument: 'after' }
	).lean();
	return toProfileDTO(doc);
}

function exerciseLimit(profile: AthleteProfileDTO): number {
	const byExperience = {
		beginner: 4,
		intermediate: 5,
		advanced: 6
	} satisfies Record<ProfileExperience, number>;
	const goalBonus = profile.goal === 'hypertrophy' ? 1 : 0;
	const strengthPenalty = profile.goal === 'strength' ? -1 : 0;
	return Math.min(Math.max(byExperience[profile.experience] + goalBonus + strengthPenalty, 3), 7);
}

function resolvedSplit(profile: AthleteProfileDTO): Exclude<ProfileSplit, 'auto'> {
	if (profile.splitPreference !== 'auto') return profile.splitPreference;
	if (profile.trainingDays <= 2) return 'upper_lower';
	if (profile.trainingDays === 3) return 'push_pull_legs';
	if (profile.goal === 'strength') return 'upper_lower';
	return profile.trainingDays >= 5 ? 'push_pull_legs' : 'upper_lower';
}

function filterForContext(names: readonly string[], profile: AthleteProfileDTO): string[] {
	const lower = profile.limitations.toLowerCase();
	const avoid = new Set<string>();
	if (lower.includes('knie')) {
		avoid.add('Walking Lunge');
		avoid.add('Front Squat');
	}
	if (lower.includes('schulter')) {
		avoid.add('Overhead Press');
		avoid.add('Lateral Raise');
		avoid.add('Dips');
	}
	if (lower.includes('rücken') || lower.includes('ruecken')) {
		avoid.add('Deadlift');
		avoid.add('Romanian Deadlift');
	}
	if (profile.equipment === 'bodyweight') {
		return names.filter((name) => ['Pull-up', 'Dips', 'Walking Lunge'].includes(name));
	}
	return names.filter((name) => !avoid.has(name));
}

function routine(
	profile: AthleteProfileDTO,
	key: string,
	nameSuffix: string,
	description: string,
	exerciseNames: readonly string[]
): PlanBlueprint {
	const filtered = filterForContext(exerciseNames, profile);
	const resolved = filtered.length >= 3 ? filtered : [...exerciseNames];
	return {
		key,
		name: `Coach ${GOAL_LABELS[profile.goal]} ${nameSuffix}`,
		description: `${description} · ${GOAL_HINTS[profile.goal]}`,
		exerciseNames: resolved.slice(0, exerciseLimit(profile))
	};
}

export function buildPlanBlueprints(profile: AthleteProfileDTO): PlanBlueprint[] {
	const split = resolvedSplit(profile);
	const days = profile.trainingDays;

	if (split === 'full_body') {
		const cycle = [BASE_EXERCISES.fullA, BASE_EXERCISES.fullB, BASE_EXERCISES.fullC];
		return Array.from({ length: days }, (_, index) =>
			routine(
				profile,
				`full-${index + 1}`,
				`Full Body ${String.fromCharCode(65 + index)}`,
				'Ganzkörper-Einheit mit Grundübung, Zug-/Druckbewegung und Zubehör',
				cycle[index % cycle.length]
			)
		);
	}

	if (split === 'upper_lower') {
		const base = [
			routine(profile, 'upper-a', 'Upper A', 'Oberkörper-Fokus mit Druck- und Zugbewegungen', [
				...BASE_EXERCISES.upper
			]),
			routine(profile, 'lower-a', 'Lower A', 'Unterkörper-Fokus mit Quads, Hamstrings und Waden', [
				...BASE_EXERCISES.lower
			])
		];
		if (days <= 2) return base;
		const extra = [
			routine(
				profile,
				'upper-b',
				'Upper B',
				'Zweite Oberkörper-Variante mit stärkerem Rückenfokus',
				['Pull-up', 'Incline Bench Press', 'Cable Row', 'Dips', 'Face Pull', 'Hammer Curl']
			),
			routine(
				profile,
				'lower-b',
				'Lower B',
				'Zweite Unterkörper-Variante mit Hüfte und einbeiniger Arbeit',
				[
					'Deadlift',
					'Front Squat',
					'Walking Lunge',
					'Hip Thrust',
					'Leg Curl',
					'Standing Calf Raise'
				]
			),
			routine(
				profile,
				'full-extra',
				'Full Body',
				'Optionale Zusatz-Einheit für Technik und Volumen',
				[...BASE_EXERCISES.fullC]
			)
		];
		return [...base, ...extra].slice(0, days);
	}

	const ppl = [
		routine(profile, 'push', 'Push', 'Brust, Schulter und Trizeps', BASE_EXERCISES.push),
		routine(profile, 'pull', 'Pull', 'Rücken und Bizeps', BASE_EXERCISES.pull),
		routine(profile, 'legs', 'Legs', 'Quads, Hamstrings, Glutes und Waden', BASE_EXERCISES.legs)
	];
	if (days <= 3) return ppl.slice(0, days);
	const extra = [
		routine(profile, 'upper', 'Upper', 'Zusätzliche Oberkörper-Einheit für mehr Wochenvolumen', [
			...BASE_EXERCISES.upper
		]),
		routine(
			profile,
			'lower',
			'Lower',
			'Zusätzliche Lower-Body-Einheit als Gegenstück zu Upper Body',
			[...BASE_EXERCISES.lower]
		),
		routine(profile, 'accessory', 'Accessories', 'Leichtere Zubehör-Einheit für Schwachstellen', [
			'Lateral Raise',
			'Face Pull',
			'Triceps Pushdown',
			'Barbell Curl',
			'Leg Curl',
			'Standing Calf Raise'
		])
	];
	return [...ppl, ...extra].slice(0, days);
}

export async function generatePlanTemplates(userId: string): Promise<GeneratedPlanDTO> {
	await connectDB();
	const profile = await getAthleteProfile(userId);
	const blueprints = buildPlanBlueprints(profile);
	const exerciseNames = [...new Set(blueprints.flatMap((blueprint) => blueprint.exerciseNames))];
	const exercises = await Exercise.find({ name: { $in: exerciseNames } }).lean();
	const byName = new Map(exercises.map((exercise) => [exercise.name, exercise]));
	const templateNames: string[] = [];
	const templates: GeneratedPlanDTO['templates'] = [];

	for (const blueprint of blueprints) {
		const exerciseIds = blueprint.exerciseNames
			.map((name) => byName.get(name)?._id)
			.filter((id): id is NonNullable<typeof id> => Boolean(id));
		if (exerciseIds.length === 0) continue;

		templateNames.push(blueprint.name);
		const doc = await Template.findOneAndUpdate(
			{ userId, name: blueprint.name },
			{
				$set: {
					description: blueprint.description,
					exerciseIds,
					source: 'generated',
					planKey: blueprint.key
				}
			},
			{ upsert: true, runValidators: true, returnDocument: 'after' }
		);
		templates.push({
			id: String(doc._id),
			name: doc.name,
			description: doc.description ?? '',
			exerciseCount: doc.exerciseIds.length
		});
	}

	await Template.deleteMany({
		userId,
		source: 'generated',
		name: { $nin: templateNames }
	});

	return { profile, templates };
}
