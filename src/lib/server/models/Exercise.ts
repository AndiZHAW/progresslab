import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const EXERCISE_CATEGORIES = ['push', 'pull', 'legs'] as const;
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

const exerciseSchema = new Schema(
	{
		name: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
		category: { type: String, required: true, enum: EXERCISE_CATEGORIES },
		muscleGroup: { type: String, trim: true, maxlength: 80, default: '' },
		isBodyweight: { type: Boolean, default: false },
		defaultRepTarget: { type: Number, min: 1, max: 50, default: 5 },
		defaultRpeTarget: { type: Number, min: 1, max: 10, default: 7 }
	},
	{ timestamps: true }
);

export type ExerciseDoc = InferSchemaType<typeof exerciseSchema> & { _id: mongoose.Types.ObjectId };

export const Exercise =
	(mongoose.models.Exercise as mongoose.Model<ExerciseDoc>) ||
	mongoose.model<ExerciseDoc>('Exercise', exerciseSchema);
