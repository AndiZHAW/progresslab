import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { User } from '$lib/server/models/User';
import { verifyPassword, createSession, SESSION_COOKIE } from '$lib/server/auth';
import { checkRateLimit, clearRateLimit } from '$lib/server/rate-limit';
import { dev } from '$app/environment';

const DUMMY_HASH = '$2b$10$a3lF31oA7wyHB.4wiwGagu.YrCv7JXa/6evB208okNry7cqqsRhS.';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
		throw error(400, 'username und password erforderlich');
	}
	const username = body.username.trim().toLowerCase();
	const rateLimitKey = `${getClientAddress()}:${username}`;
	const limit = checkRateLimit(rateLimitKey);
	if (!limit.ok) {
		throw error(429, `Zu viele Login-Versuche. Bitte ${limit.retryAfter}s warten.`);
	}

	await connectDB();
	const user = await User.findOne({ username });
	const ok = await verifyPassword(body.password, user?.passwordHash ?? DUMMY_HASH);
	if (!user || !ok) throw error(401, 'Falscher Username oder Passwort');
	clearRateLimit(rateLimitKey);

	const { token, expiresAt } = await createSession(String(user._id));
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		expires: expiresAt
	});

	return json({ id: String(user._id), username: user.username, role: user.role });
};
