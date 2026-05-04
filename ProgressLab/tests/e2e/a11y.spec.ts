import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function login(page: Page) {
	await page.goto('/login');
	await page.fill('#username', 'demo');
	await page.fill('#password', 'demo1234');
	await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
	await page.waitForURL('/');
}

const PAGES_PUBLIC = [
	{ name: 'Login', url: '/login' },
	{ name: 'Register', url: '/register' }
];

const PAGES_AUTHED = [
	{ name: 'Dashboard', url: '/' },
	{ name: 'Stats', url: '/stats' },
	{ name: 'Records', url: '/records' },
	{ name: 'Templates', url: '/templates' },
	{ name: 'Sessions', url: '/sessions' }
];

test.describe('Accessibility (axe-core, WCAG 2.1 AA)', () => {
	for (const p of PAGES_PUBLIC) {
		test(`${p.name}: keine kritischen WCAG-AA-Violations`, async ({ page }) => {
			await page.goto(p.url);
			const results = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
				.analyze();
			expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
		});
	}

	for (const p of PAGES_AUTHED) {
		test(`${p.name}: keine kritischen WCAG-AA-Violations`, async ({ page }) => {
			await login(page);
			await page.goto(p.url);
			const results = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
				.analyze();
			expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
		});
	}
});
