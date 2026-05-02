import mongoose from 'mongoose';
import { connectDB } from './db';
import { Template } from './models/Template';
import { Exercise } from './models/Exercise';
import { toExerciseDTO } from './dto';
import type { ExerciseDTO } from '../types';

export type TemplateDTO = {
	id: string;
	name: string;
	description: string;
	exercises: ExerciseDTO[];
};

export async function listTemplates(userId: string): Promise<TemplateDTO[]> {
	await connectDB();
	const docs = await Template.find({ userId }).sort({ name: 1 }).lean();
	const allIds = [...new Set(docs.flatMap((d) => d.exerciseIds.map(String)))];
	const exercises = await Exercise.find({ _id: { $in: allIds } }).lean();
	const map = new Map(
		exercises.map((e) => [
			String(e._id),
			toExerciseDTO(e as unknown as Parameters<typeof toExerciseDTO>[0])
		])
	);

	return docs.map((d) => ({
		id: String(d._id),
		name: d.name,
		description: d.description ?? '',
		exercises: d.exerciseIds
			.map((id) => map.get(String(id)))
			.filter((x): x is ExerciseDTO => Boolean(x))
	}));
}

export async function getTemplate(userId: string, templateId: string): Promise<TemplateDTO | null> {
	if (!mongoose.isValidObjectId(templateId)) return null;
	await connectDB();
	const doc = await Template.findOne({ _id: templateId, userId }).lean();
	if (!doc) return null;
	const exercises = await Exercise.find({ _id: { $in: doc.exerciseIds } }).lean();
	const orderMap = new Map(doc.exerciseIds.map((id, i) => [String(id), i]));
	const ordered = exercises
		.map((e) => toExerciseDTO(e as unknown as Parameters<typeof toExerciseDTO>[0]))
		.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

	return {
		id: String(doc._id),
		name: doc.name,
		description: doc.description ?? '',
		exercises: ordered
	};
}
