import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { User } from '$lib/server/models/User';
import { verifyPassword, createSession, SESSION_COOKIE } from '$lib/server/auth';
import { dev } from '$app/environment';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
		throw error(400, 'username und password erforderlich');
	}
	const username = body.username.trim().toLowerCase();

	await connectDB();
	const user = await User.findOne({ username });
	if (!user) throw error(401, 'Falscher Username oder Passwort');

	const ok = await verifyPassword(body.password, user.passwordHash);
	if (!ok) throw error(401, 'Falscher Username oder Passwort');

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
