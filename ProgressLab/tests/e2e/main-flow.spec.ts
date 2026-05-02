import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, username = 'demo', password = 'demo1234') {
	await page.goto('/login');
	await page.fill('#username', username);
	await page.fill('#password', password);
	await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
	await page.waitForURL('/');
}

test.describe('ProgressLab Hauptworkflow', () => {
	test('Anonyme User werden auf /login umgeleitet', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/login$/);
		await expect(page.getByRole('heading', { name: 'Anmelden' })).toBeVisible();
	});

	test('Demo-User kann sich anmelden und sieht das Dashboard', async ({ page }) => {
		await login(page);
		await expect(page.getByRole('heading', { level: 1 })).toContainText(/Hi demo/i);
		await expect(page.getByRole('link', { name: /Back Squat/i })).toBeVisible();
	});

	test('Übungs-Detail zeigt Empfehlung und Verlaufschart', async ({ page }) => {
		await login(page);
		await page.getByRole('link', { name: /Back Squat/i }).click();
		await expect(page.getByRole('heading', { level: 1 })).toContainText(/Back Squat/i);
		await expect(page.locator('canvas').first()).toBeVisible();
		await expect(page.getByText(/Empfehlung nächste Session/i)).toBeVisible();
	});

	test('Stats-Page zeigt aggregierte Kennzahlen und Heatmap', async ({ page }) => {
		await login(page);
		await page.getByRole('link', { name: 'Statistik', exact: true }).click();
		await expect(page).toHaveURL('/stats');
		await expect(page.getByRole('heading', { name: 'Statistik' })).toBeVisible();
		await expect(page.getByText(/Sessions gesamt/i).first()).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Trainingstage', exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: /Volumen pro Woche/i })).toBeVisible();
	});

	test('Records-Page zeigt PR-Karten mit e1RM', async ({ page }) => {
		await login(page);
		await page.getByRole('link', { name: 'Records', exact: true }).click();
		await expect(page).toHaveURL('/records');
		await expect(page.getByRole('heading', { name: 'Personal Records' })).toBeVisible();
		await expect(page.getByText(/Geschätztes 1RM/i).first()).toBeVisible();
	});

	test('Routinen-Page zeigt seedete Templates', async ({ page }) => {
		await login(page);
		await page.getByRole('link', { name: 'Routinen', exact: true }).click();
		await expect(page).toHaveURL('/templates');
		await expect(page.getByRole('heading', { name: 'Push Day' })).toBeVisible();
	});

	test('Session-Logging End-to-End: Übung wählen → Sätze loggen → Confirmation', async ({ page }) => {
		await login(page);
		await page.locator('a.fab').click();
		await expect(page).toHaveURL('/sessions/new');

		await page.getByRole('option', { name: /Bench Press/i }).first().click();
		await page.getByRole('button', { name: /Weiter/i }).click();

		await expect(page.getByRole('heading', { level: 1 })).toContainText(/Bench Press/i);
		await page.getByRole('button', { name: 'Session speichern' }).click();

		await expect(page).toHaveURL(/\/sessions\/.+\/done/);
		await expect(page.getByRole('heading', { name: 'Session gespeichert' })).toBeVisible();
		await expect(page.getByText(/Empfehlung aktualisiert/i)).toBeVisible();
	});

	test('Logout führt zurück auf /login', async ({ page }) => {
		await login(page);
		await page.locator('details summary').click();
		await page.getByRole('button', { name: 'Abmelden' }).click();
		await page.waitForURL('/login');
	});
});
