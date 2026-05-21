import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRecommendation, epley1RM } from '../../src/lib/server/recommendation';

type SessionInput = Parameters<typeof buildRecommendation>[0][number];
type RecommendationOptions = Parameters<typeof buildRecommendation>[1];

function session(weight: number, reps: number, rpe: number, date = '2026-05-01'): SessionInput {
	return {
		date: new Date(date),
		sets: [{ weight, reps, rpe }]
	} as SessionInput;
}

const compound: RecommendationOptions = {
	isBodyweight: false,
	defaultRepTarget: 5,
	defaultRpeTarget: 7,
	name: 'Bench Press',
	muscleGroup: 'Chest',
	category: 'push'
};

test('returns defaults for the first weighted session', () => {
	const rec = buildRecommendation([], compound);

	assert.equal(rec.weight, 0);
	assert.equal(rec.reps, 5);
	assert.equal(rec.rpeTarget, 7);
	assert.equal(rec.trend, 'flat');
});

test('progresses compound exercises by 2.5 kg after an easy session', () => {
	const rec = buildRecommendation([session(100, 5, 7)], compound);

	assert.equal(rec.weight, 102.5);
	assert.equal(rec.reps, 5);
	assert.equal(rec.deload, false);
});

test('uses smaller rep-first progressions for isolation exercises', () => {
	const rec = buildRecommendation([session(12, 10, 6.5)], {
		...compound,
		defaultRepTarget: 10,
		name: 'Lateral Raise',
		muscleGroup: 'Shoulders'
	});

	assert.equal(rec.weight, 12);
	assert.equal(rec.reps, 11);
});

test('increases bodyweight exercises by one rep after an easy session', () => {
	const rec = buildRecommendation([session(0, 8, 7)], {
		...compound,
		isBodyweight: true,
		name: 'Pull-Up',
		muscleGroup: 'Back'
	});

	assert.equal(rec.weight, null);
	assert.equal(rec.reps, 9);
});

test('deloads by 10 percent after high RPE', () => {
	const rec = buildRecommendation([session(100, 5, 9.5)], compound);

	assert.equal(rec.weight, 90);
	assert.equal(rec.deload, true);
	assert.equal(rec.trend, 'down');
});

test('computes Epley 1RM deterministically', () => {
	assert.equal(epley1RM(100, 5), 116.7);
	assert.equal(epley1RM(100, 1), 100);
	assert.equal(epley1RM(0, 5), 0);
});
