import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { User } from '$lib/server/models/User';
import { hashPassword, createSession, SESSION_COOKIE } from '$lib/server/auth';
import { dev } from '$app/environment';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
		throw error(400, 'username und password erforderlich');
	}
	const username = body.username.trim().toLowerCase();
	const password = body.password;

	if (!/^[a-z0-9_-]{3,32}$/.test(username)) {
		throw error(400, 'Username: 3–32 Zeichen, nur a-z, 0-9, _ oder -');
	}
	if (password.length < 6) {
		throw error(400, 'Passwort muss mindestens 6 Zeichen haben');
	}

	await connectDB();
	const existing = await User.findOne({ username });
	if (existing) {
		throw error(409, 'Username bereits vergeben');
	}

	const passwordHash = await hashPassword(password);
	const user = await User.create({ username, passwordHash, role: 'user' });

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
