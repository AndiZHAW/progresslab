import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';
const COOKIE = 'pl_theme';

const initial: Theme = browser
	? (document.documentElement.dataset.theme as Theme) || 'light'
	: 'light';

export const theme = $state<{ value: Theme }>({ value: initial });

export function setTheme(next: Theme) {
	theme.value = next;
	if (browser) {
		document.documentElement.dataset.theme = next;
		document.cookie = `${COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
	}
}

export function toggleTheme() {
	setTheme(theme.value === 'dark' ? 'light' : 'dark');
}
