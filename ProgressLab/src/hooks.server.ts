import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE, userFromToken } from '$lib/server/auth';

const THEME_COOKIE = 'pl_theme';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	event.locals.user = await userFromToken(token);

	const theme = event.cookies.get(THEME_COOKIE) === 'dark' ? 'dark' : 'light';

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%pl.theme%', theme)
	});
};
