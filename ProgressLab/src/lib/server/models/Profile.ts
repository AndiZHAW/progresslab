import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const PROFILE_GOALS = ['hypertrophy', 'strength', 'balanced'] as const;
export const PROFILE_EXPERIENCES = ['beginner', 'intermediate', 'advanced'] as const;
export const PROFILE_SPLITS = ['auto', 'full_body', 'upper_lower', 'push_pull_legs'] as const;
export const PROFILE_EQUIPMENT = ['gym', 'basic', 'bodyweight'] as const;

export type ProfileGoal = (typeof PROFILE_GOALS)[number];
export type ProfileExperience = (typeof PROFILE_EXPERIENCES)[number];
export type ProfileSplit = (typeof PROFILE_SPLITS)[number];
export type ProfileEquipment = (typeof PROFILE_EQUIPMENT)[number];

const profileSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
			index: true
		},
		heightCm: { type: Number, min: 120, max: 230, default: null },
		bodyWeightKg: { type: Number, min: 30, max: 250, default: null },
		experience: {
			type: String,
			enum: PROFILE_EXPERIENCES,
			default: 'intermediate',
			required: true
		},
		goal: { type: String, enum: PROFILE_GOALS, default: 'balanced', required: true },
		trainingDays: { type: Number, min: 2, max: 6, default: 3, required: true },
		splitPreference: {
			type: String,
			enum: PROFILE_SPLITS,
			default: 'auto',
			required: true
		},
		equipment: { type: String, enum: PROFILE_EQUIPMENT, default: 'gym', required: true },
		limitations: { type: String, trim: true, maxlength: 300, default: '' }
	},
	{ timestamps: true }
);

export type ProfileDoc = InferSchemaType<typeof profileSchema> & {
	_id: mongoose.Types.ObjectId;
};

export const Profile =
	(mongoose.models.Profile as mongoose.Model<ProfileDoc>) ||
	mongoose.model<ProfileDoc>('Profile', profileSchema);
