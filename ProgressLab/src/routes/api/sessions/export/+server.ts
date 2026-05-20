import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { Session } from '$lib/server/models/Session';
import { Exercise } from '$lib/server/models/Exercise';

function csvEscape(value: string | number): string {
	const str =
		typeof value === 'string' && /^[=+\-@]/.test(value.trimStart()) ? `'${value}` : String(value);
	if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
	return str;
}

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet');

	await connectDB();
	const sessions = await Session.find({ userId: locals.user.id }).sort({ date: -1 }).lean();
	const exerciseIds = [...new Set(sessions.map((s) => String(s.exerciseId)))];
	const exercises = await Exercise.find({ _id: { $in: exerciseIds } })
		.select('name category')
		.lean();
	const map = new Map(exercises.map((e) => [String(e._id), e]));

	const header = ['Datum', 'Übung', 'Kategorie', 'Satz #', 'Gewicht (kg)', 'Reps', 'RPE', 'Notiz'];
	const rows = [header.map(csvEscape).join(',')];

	for (const s of sessions) {
		const ex = map.get(String(s.exerciseId));
		const date = new Date(s.date).toISOString().slice(0, 10);
		s.sets.forEach((set, i) => {
			rows.push(
				[
					date,
					ex?.name ?? '?',
					ex?.category ?? '?',
					i + 1,
					set.weight,
					set.reps,
					set.rpe,
					s.note ?? ''
				]
					.map(csvEscape)
					.join(',')
			);
		});
	}

	const today = new Date().toISOString().slice(0, 10);
	const filename = `progresslab-${locals.user.username}-${today}.csv`;
	const body = '﻿' + rows.join('\n');

	return new Response(body, {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="${filename}"`
		}
	});
};
