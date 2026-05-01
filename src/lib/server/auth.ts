import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import { SessionToken, User } from './models/User';

const SESSION_TTL_DAYS = 30;
export const SESSION_COOKIE = 'pl_session';

export async function hashPassword(plain: string): Promise<string> {
	return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
	return bcrypt.compare(plain, hash);
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
	await connectDB();
	const token = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
	await SessionToken.create({ token, userId, expiresAt });
	return { token, expiresAt };
}

export async function destroySession(token: string): Promise<void> {
	await connectDB();
	await SessionToken.deleteOne({ token });
}

export async function userFromToken(token: string | undefined): Promise<App.Locals['user']> {
	if (!token) return null;
	await connectDB();
	const session = await SessionToken.findOne({ token, expiresAt: { $gt: new Date() } }).lean();
	if (!session) return null;
	const user = await User.findById(session.userId).lean();
	if (!user) return null;
	return {
		id: String(user._id),
		username: user.username,
		role: user.role as 'user' | 'admin'
	};
}
