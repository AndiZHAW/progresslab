import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const templateSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		name: { type: String, required: true, trim: true, maxlength: 80 },
		description: { type: String, trim: true, maxlength: 300, default: '' },
		source: { type: String, enum: ['manual', 'generated'], default: 'manual', index: true },
		planKey: { type: String, trim: true, maxlength: 80, default: '' },
		exerciseIds: {
			type: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],
			validate: [(v: unknown[]) => v.length >= 1, 'Mindestens eine Übung erforderlich']
		}
	},
	{ timestamps: true }
);

templateSchema.index({ userId: 1, name: 1 }, { unique: true });

export type TemplateDoc = InferSchemaType<typeof templateSchema> & {
	_id: mongoose.Types.ObjectId;
};

export const Template =
	(mongoose.models.Template as mongoose.Model<TemplateDoc>) ||
	mongoose.model<TemplateDoc>('Template', templateSchema);
