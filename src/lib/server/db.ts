import mongoose from 'mongoose';
import { MONGODB_URI } from '$env/static/private';

let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
	if (mongoose.connection.readyState === 1) {
		return Promise.resolve(mongoose);
	}
	if (!connectionPromise) {
		connectionPromise = mongoose.connect(MONGODB_URI, {
			serverSelectionTimeoutMS: 8000
		});
	}
	return connectionPromise;
}
