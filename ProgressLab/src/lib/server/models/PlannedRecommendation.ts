import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const PLANNED_RECOMMENDATION_SOURCES = ['coach', 'manual'] as const;
export type PlannedRecommendationSource = (typeof PLANNED_RECOMMENDATION_SOURCES)[number];

export const PLANNED_RECOMMENDATION_STATUSES = ['planned', 'completed'] as const;
export type PlannedRecommendationStatus = (typeof PLANNED_RECOMMENDATION_STATUSES)[number];

const plannedRecommendationSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true, index: true },
		weight: { type: Number, min: 0, max: 1000, default: null },
		reps: { type: Number, required: true, min: 1, max: 100 },
		rpeTarget: { type: Number, required: true, min: 1, max: 10 },
		reason: { type: String, required: true, trim: true, maxlength: 180 },
		source: { type: String, enum: PLANNED_RECOMMENDATION_SOURCES, default: 'coach' },
		status: { type: String, enum: PLANNED_RECOMMENDATION_STATUSES, default: 'planned' }
	},
	{ timestamps: true }
);

plannedRecommendationSchema.index(
	{ userId: 1, exerciseId: 1, status: 1 },
	{ unique: true, partialFilterExpression: { status: 'planned' } }
);

export type PlannedRecommendationDoc = InferSchemaType<typeof plannedRecommendationSchema> & {
	_id: mongoose.Types.ObjectId;
};

export const PlannedRecommendation =
	(mongoose.models.PlannedRecommendation as mongoose.Model<PlannedRecommendationDoc>) ||
	mongoose.model<PlannedRecommendationDoc>('PlannedRecommendation', plannedRecommendationSchema);
