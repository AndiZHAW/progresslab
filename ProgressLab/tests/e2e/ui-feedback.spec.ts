import { expect, test, type Page } from '@playwright/test';

async function waitForApp(page: Page) {
	await page.locator('html[data-progresslab-ready="true"]').waitFor();
}

async function login(page: Page) {
	await page.goto('/login');
	await waitForApp(page);
	await page.fill('#username', 'demo');
	await page.fill('#password', 'demo1234');
	await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
	await page.waitForURL('/');
	await waitForApp(page);
}

test.describe('UI feedback and button reactions', () => {
	test('login reacts to demo buttons, invalid credentials and success', async ({ page }) => {
		await page.goto('/login');
		await waitForApp(page);

		await page.getByRole('button', { name: /demo\s+demo1234/i }).click();
		await expect(page.locator('#username')).toHaveValue('demo');
		await expect(page.locator('#password')).toHaveValue('demo1234');

		await page.fill('#password', 'wrong-password');
		await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
		await expect(page.getByRole('alert')).toContainText(/Falscher Username oder Passwort/i);

		await page.fill('#password', 'demo1234');
		await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
		await page.waitForURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText(/Hi demo/i);
	});

	test('profile save, validation and plan generation give visible feedback', async ({ page }) => {
		await login(page);
		await page.goto('/profile');
		await waitForApp(page);

		await page.getByLabel(/Gr.sse/i).fill('100');
		await page.getByRole('button', { name: /Profil speichern/i }).click();
		await expect(page.getByRole('alert')).toContainText(/120 und 230/i);

		await page.getByLabel(/Gr.sse/i).fill('178');
		await page.getByRole('button', { name: /Profil speichern/i }).click();
		await expect(page.getByRole('status').filter({ hasText: /Profil gespeichert/i })).toBeVisible();

		await page.getByRole('button', { name: /Plan generieren/i }).click();
		await expect(page.getByText(/Coach-Routinen erstellt\. Du findest sie jetzt/i)).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Generiert' })).toBeVisible();
	});

	test('session logger validates bad input and confirms a successful save', async ({ page }) => {
		await login(page);
		await page.goto('/sessions/new');
		await waitForApp(page);
		await page
			.getByRole('option', { name: /Bench Press/i })
			.first()
			.click();
		await page.getByRole('button', { name: /Weiter/i }).click();

		await page.getByLabel('Satz 1 Reps').fill('0');
		await page.getByRole('button', { name: 'Session speichern' }).click();
		await expect(
			page.getByRole('alert').filter({ hasText: /Bitte Eingaben prüfen/i })
		).toBeVisible();
		await expect(page.getByRole('alert').filter({ hasText: /Satz 1: Reps 1/i })).toBeVisible();

		await page.getByLabel('Satz 1 Reps').fill('5');
		await page.getByRole('button', { name: 'Session speichern' }).click();
		await expect(page).toHaveURL(/\/sessions\/.+\/done/);
		await expect(page.getByRole('heading', { name: 'Session gespeichert' })).toBeVisible();
		await expect(page.getByText(/Empfehlung aktualisiert/i)).toBeVisible();
	});

	test('routine form disables invalid save, then creates and deletes with feedback', async ({
		page
	}) => {
		await login(page);
		await page.goto('/templates');
		await waitForApp(page);
		const routineName = `Codex Feedback ${Date.now()}`;

		await page.getByRole('button', { name: /\+ Neue Routine/i }).click();
		await expect(page.getByRole('button', { name: 'Routine speichern' })).toBeDisabled();

		await page.getByLabel('Name').fill(routineName);
		await expect(page.getByRole('button', { name: 'Routine speichern' })).toBeDisabled();

		await page.locator('.ex-chip').first().click();
		await expect(page.getByRole('button', { name: 'Routine speichern' })).toBeEnabled();
		await page.getByRole('button', { name: 'Routine speichern' }).click();
		await expect(page.getByText('Routine angelegt')).toBeVisible();
		await expect(page.getByRole('heading', { name: routineName })).toBeVisible();

		page.once('dialog', (dialog) => dialog.accept());
		await page
			.locator('article')
			.filter({ has: page.getByRole('heading', { name: routineName }) })
			.getByRole('button', { name: 'Routine löschen' })
			.click();
		await expect(page.getByText('Routine gelöscht')).toBeVisible();
		await expect(page.getByRole('heading', { name: routineName })).toHaveCount(0);
	});

	test('404 page has a clear message and recovery action', async ({ page }) => {
		await page.goto('/route-die-es-nicht-gibt');
		await waitForApp(page);

		await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible();
		await page.getByRole('link', { name: 'Neu anmelden' }).click();
		await expect(page).toHaveURL('/login');
	});
});
