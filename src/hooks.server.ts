import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE, userFromToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	event.locals.user = await userFromToken(token);
	return resolve(event);
};
