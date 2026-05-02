import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const setSchema = new Schema(
	{
		weight: { type: Number, required: true, min: 0, max: 1000 },
		reps: { type: Number, required: true, min: 1, max: 100 },
		rpe: { type: Number, required: true, min: 1, max: 10 }
	},
	{ _id: false }
);

const sessionSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true, index: true },
		date: { type: Date, required: true, default: () => new Date() },
		sets: {
			type: [setSchema],
			validate: [(v: unknown[]) => v.length >= 1, 'Mindestens ein Satz erforderlich']
		},
		note: { type: String, maxlength: 500, default: '' }
	},
	{ timestamps: true }
);

sessionSchema.index({ userId: 1, exerciseId: 1, date: -1 });

export type SessionDoc = InferSchemaType<typeof sessionSchema> & { _id: mongoose.Types.ObjectId };

export const Session =
	(mongoose.models.Session as mongoose.Model<SessionDoc>) ||
	mongoose.model<SessionDoc>('Session', sessionSchema);
