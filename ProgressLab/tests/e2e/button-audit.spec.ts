import { expect, test, type Page } from '@playwright/test';

async function waitForApp(page: Page) {
	await page.locator('html[data-progresslab-ready="true"]').waitFor();
}

async function login(page: Page, username = 'demo', password = 'demo1234') {
	await page.goto('/login');
	await waitForApp(page);
	await page.fill('#username', username);
	await page.fill('#password', password);
	await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
	await page.waitForURL('/');
	await waitForApp(page);
}

async function register(page: Page, username: string, password = 'strong1234') {
	await page.goto('/register');
	await waitForApp(page);
	await page.locator('#r-username').fill(username);
	await page.locator('#r-password').fill(password);
	await page.locator('#r-confirm').fill(password);
	await page.getByRole('button', { name: 'Account erstellen' }).click();
	await page.waitForURL('/');
	await waitForApp(page);
}

test.describe('Button audit: reachable controls react correctly', () => {
	test('public auth links, theme button and disabled register submit react', async ({ page }) => {
		await page.goto('/login');
		await waitForApp(page);

		await page.getByRole('button', { name: /Theme wechseln|Design aktivieren/i }).click();
		await page.getByRole('link', { name: 'Registrieren', exact: true }).click();
		await expect(page).toHaveURL('/register');
		await expect(page.getByRole('button', { name: 'Account erstellen' })).toBeDisabled();

		await page.locator('#r-username').fill('xy');
		await expect(page.getByText(/3.*32 Zeichen/i)).toBeVisible();
		await page.getByRole('link', { name: /Hier anmelden/i }).click();
		await expect(page).toHaveURL('/login');
	});

	test('desktop navigation, theme toggle and user menu buttons react', async ({ page }) => {
		await login(page);

		const nav = page.getByRole('navigation', { name: 'Hauptnavigation', exact: true });
		for (const [label, url] of [
			['Routinen', '/templates'],
			['Coach-ID', '/profile'],
			['Statistik', '/stats'],
			['Records', '/records'],
			['Sessions', '/sessions'],
			['Dashboard', '/']
		] as const) {
			await nav.getByRole('link', { name: label, exact: true }).click();
			await expect(page).toHaveURL(url);
		}

		await page.locator('button.theme-btn').first().click();
		await expect(page.locator('html')).toHaveAttribute('data-progresslab-ready', 'true');
		await page.locator('details summary').click();
		await expect(page.getByRole('button', { name: 'Abmelden' })).toBeVisible();
	});

	test('dashboard filters, search, sort, hero CTAs and routine links react', async ({ page }) => {
		await login(page);

		for (const label of [/Push/i, /Pull/i, /Legs/i, /Alle/i]) {
			const tab = page.getByRole('tab', { name: label }).first();
			await tab.click();
			await expect(tab).toHaveAttribute('aria-selected', 'true');
		}

		await page.getByLabel('Suche').fill('bench');
		await expect(page.getByRole('button', { name: 'Suche leeren' })).toBeVisible();
		await page.getByRole('button', { name: 'Suche leeren' }).click();
		await expect(page.getByLabel('Suche')).toHaveValue('');

		await page.getByLabel('Sortierung').selectOption('name');
		await page.getByLabel('Sortierung').selectOption('trend');
		await page
			.locator('#main-content')
			.getByRole('link', { name: 'Coach-ID', exact: true })
			.click();
		await expect(page).toHaveURL('/profile');

		await page.goto('/');
		await page.getByRole('link', { name: 'Verwalten' }).click();
		await expect(page).toHaveURL('/templates');
	});

	test('detail page plan buttons accept, remove, validate and save manual plans', async ({
		page
	}) => {
		await login(page);
		await page
			.getByRole('link', { name: /Bench Press/i })
			.first()
			.click();

		await page.getByRole('button', { name: /Empfehlung akzeptieren|Coach-Plan erneuern/i }).click();
		await expect(page.getByText(/Session geplant/i)).toBeVisible();
		await page.getByRole('button', { name: 'Plan entfernen' }).click();
		await expect(page.getByText(/Session geplant/i)).toHaveCount(0);

		await page.getByRole('button', { name: 'Manuell anpassen' }).click();
		await page.getByLabel('RPE-Ziel').fill('11');
		await page.getByRole('button', { name: 'Anpassung speichern' }).click();
		await expect(page.getByRole('alert')).toContainText(/RPE-Ziel/i);

		await page.getByLabel('RPE-Ziel').fill('8');
		await page.getByRole('button', { name: 'Anpassung speichern' }).click();
		await expect(page.getByText(/Session geplant/i)).toBeVisible();
		await page.getByRole('link', { name: 'Jetzt loggen' }).click();
		await expect(page).toHaveURL(/\/sessions\/new\/.+/);
	});

	test('template cancel buttons and delete dismissal keep existing routines intact', async ({
		page
	}) => {
		await login(page);
		await page.goto('/templates');
		await waitForApp(page);

		const firstRoutineName = await page.locator('article.t-card h3').first().innerText();

		await page.getByRole('button', { name: /\+ Neue Routine/i }).click();
		await expect(page.getByRole('heading', { name: 'Neue Routine' })).toBeVisible();
		await page.getByRole('button', { name: 'Abbrechen' }).click();
		await expect(page.getByRole('heading', { name: 'Neue Routine' })).toHaveCount(0);

		await page
			.locator('article.t-card')
			.filter({ has: page.getByRole('heading', { name: firstRoutineName }) })
			.getByRole('button', { name: 'Routine bearbeiten' })
			.click();
		await expect(page.getByRole('heading', { name: 'Routine bearbeiten' })).toBeVisible();
		await page.getByRole('button', { name: 'Abbrechen' }).click();
		await expect(page.getByRole('heading', { name: 'Routine bearbeiten' })).toHaveCount(0);

		page.once('dialog', (dialog) => dialog.dismiss());
		await page
			.locator('article.t-card')
			.filter({ has: page.getByRole('heading', { name: firstRoutineName }) })
			.getByRole('button', { name: 'Routine löschen' })
			.click();
		await expect(page.getByRole('heading', { name: firstRoutineName })).toBeVisible();

		await page.getByRole('link', { name: 'Plan generieren' }).click();
		await expect(page).toHaveURL('/profile');
	});

	test('session filters, edit save, delete cancel and export links react', async ({ page }) => {
		await login(page);
		await page.goto('/sessions');
		await waitForApp(page);

		for (const label of [/Push/i, /Pull/i, /Legs/i, /Alle/i]) {
			await page.getByRole('tab', { name: label }).first().click();
			await expect(page.getByRole('heading', { name: 'Sessions' })).toBeVisible();
		}

		await expect(page.getByRole('link', { name: 'CSV' })).toHaveAttribute(
			'href',
			'/api/sessions/export'
		);
		await page.locator('.row-card').first().getByRole('link', { name: 'Bearbeiten' }).click();
		await expect(page.locator('.head .muted', { hasText: 'Session bearbeiten' })).toBeVisible();
		await page.getByLabel('Notiz').fill('Button audit note');
		await page.getByRole('button', { name: 'Änderungen speichern' }).click();
		await expect(page).toHaveURL('/sessions');
		await expect(page.getByText('Session aktualisiert')).toBeVisible();

		await page.locator('.row-card').first().getByRole('link', { name: 'Bearbeiten' }).click();
		page.once('dialog', (dialog) => dialog.dismiss());
		await page.getByRole('button', { name: 'Session löschen' }).click();
		await expect(page.locator('.head .muted', { hasText: 'Session bearbeiten' })).toBeVisible();
	});

	test('profile controls, radios, selects, save, generate and generated CTA react', async ({
		page
	}) => {
		await login(page);
		await page.goto('/profile');
		await waitForApp(page);

		await page.locator('.choice-grid label').filter({ hasText: 'Hypertrophy' }).click();
		const armLimitation = page.getByLabel('Arm/Ellbogen/Handgelenk');
		if (!(await armLimitation.isChecked())) {
			await page
				.locator('.restriction-grid label')
				.filter({ hasText: 'Arm/Ellbogen/Handgelenk' })
				.click();
		}
		await expect(armLimitation).toBeChecked();
		await page.getByLabel('Erfahrung').selectOption('advanced');
		await page.getByLabel('Trainingstage pro Woche').selectOption('5');
		await page.getByLabel('Split').selectOption('upper_lower');
		await page.getByLabel('Equipment').selectOption('gym');
		await page.getByRole('button', { name: 'Profil speichern' }).click();
		await expect(page.getByRole('status').filter({ hasText: /Profil gespeichert/i })).toBeVisible();

		await page.getByRole('button', { name: 'Plan generieren' }).click();
		await expect(page.getByRole('heading', { name: 'Generiert' })).toBeVisible();
		await page.getByRole('button', { name: 'Routinen ansehen' }).click();
		await expect(page).toHaveURL('/templates');
	});

	test('mobile hamburger and bottom-tab controls navigate correctly', async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 740 });
		await login(page);

		await page.getByRole('button', { name: /Men/i }).click();
		await page
			.getByRole('navigation', { name: 'Hauptnavigation', exact: true })
			.getByRole('link', { name: 'Sessions', exact: true })
			.click();
		await expect(page).toHaveURL('/sessions');

		const mobileTabs = page.getByRole('navigation', { name: 'Mobile Hauptnavigation' });
		await mobileTabs.getByRole('link', { name: /Routinen/i }).click();
		await expect(page).toHaveURL('/templates');
		await mobileTabs.getByRole('link', { name: /Loggen/i }).click();
		await expect(page).toHaveURL('/sessions/new');
		await mobileTabs.getByRole('link', { name: /Stats/i }).click();
		await expect(page).toHaveURL('/stats');
		await mobileTabs.getByRole('link', { name: /Home/i }).click();
		await expect(page).toHaveURL('/');
	});

	test('empty-state buttons work for a newly registered user', async ({ page }) => {
		const username = `empty_state_${Date.now()}`;
		await register(page, username);

		await page.goto('/sessions');
		await expect(page.getByRole('heading', { name: 'Noch keine Sessions' })).toBeVisible();
		await page.getByRole('link', { name: /\+ Session loggen/i }).click();
		await expect(page).toHaveURL('/sessions/new');

		await page.goto('/stats');
		await page.getByRole('link', { name: /\+ Erste Session loggen/i }).click();
		await expect(page).toHaveURL('/sessions/new');

		await page.goto('/records');
		await page.getByRole('link', { name: /\+ Erste Session loggen/i }).click();
		await expect(page).toHaveURL('/sessions/new');

		await page.goto('/templates');
		await waitForApp(page);
		await page.getByRole('button', { name: /\+ Erste Routine anlegen/i }).click();
		await expect(page.getByRole('heading', { name: 'Neue Routine' })).toBeVisible();
	});
});
