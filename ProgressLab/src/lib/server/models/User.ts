import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			minlength: 3,
			maxlength: 32,
			match: /^[a-z0-9_-]+$/
		},
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['user', 'admin'], default: 'user' }
	},
	{ timestamps: true }
);

const sessionTokenSchema = new Schema(
	{
		token: { type: String, required: true, unique: true, index: true },
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		expiresAt: { type: Date, required: true, index: true }
	},
	{ timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export type SessionTokenDoc = InferSchemaType<typeof sessionTokenSchema> & {
	_id: mongoose.Types.ObjectId;
};

export const User =
	(mongoose.models.User as mongoose.Model<UserDoc>) ||
	mongoose.model<UserDoc>('User', userSchema);
export const SessionToken =
	(mongoose.models.SessionToken as mongoose.Model<SessionTokenDoc>) ||
	mongoose.model<SessionTokenDoc>('SessionToken', sessionTokenSchema);
