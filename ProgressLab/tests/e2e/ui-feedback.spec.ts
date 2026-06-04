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

test.describe('UI feedback and button reactions', () => {
	test('registration creates a persistent account that can log in again', async ({ page }) => {
		const username = `codex_user_${Date.now()}`;
		const password = 'strong1234';

		await page.goto('/register');
		await waitForApp(page);
		await expect(page.getByRole('button', { name: 'Account erstellen' })).toBeDisabled();

		await page.locator('#r-username').fill(username);
		await page.locator('#r-password').fill(password);
		await page.locator('#r-confirm').fill('does-not-match');
		await expect(page.getByText(/Passwörter stimmen nicht überein/i)).toBeVisible();
		await expect(page.getByRole('button', { name: 'Account erstellen' })).toBeDisabled();

		await page.locator('#r-confirm').fill(password);
		await page.getByRole('button', { name: 'Account erstellen' }).click();
		await page.waitForURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText(new RegExp(username, 'i'));

		await page.locator('details summary').click();
		await page.getByRole('button', { name: 'Abmelden' }).click();
		await page.waitForURL('/login');

		await login(page, username, password);
		await expect(page.getByRole('heading', { level: 1 })).toContainText(new RegExp(username, 'i'));

		await page.locator('details summary').click();
		await page.getByRole('button', { name: 'Abmelden' }).click();
		await page.waitForURL('/login');
		await page.goto('/register');
		await page.locator('#r-username').fill(username);
		await page.locator('#r-password').fill(password);
		await page.locator('#r-confirm').fill(password);
		await page.getByRole('button', { name: 'Account erstellen' }).click();
		await expect(page.getByRole('alert')).toContainText(/Username bereits vergeben/i);
	});

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
		await expect(page.getByRole('alert').filter({ hasText: /Bitte Eingaben/i })).toBeVisible();
		await expect(page.getByRole('alert').filter({ hasText: /Satz 1: Reps 1/i })).toBeVisible();

		await page.getByLabel('Satz 1 Reps').fill('5');
		await page.getByRole('button', { name: 'Session speichern' }).click();
		await expect(page).toHaveURL(/\/sessions\/.+\/done/);
		await expect(page.getByRole('heading', { name: 'Session gespeichert' })).toBeVisible();
		await expect(page.getByText(/Empfehlung aktualisiert/i)).toBeVisible();
	});

	test('manual recommendation planning prefills the next logger and is consumed on save', async ({
		page
	}) => {
		await login(page);
		await page
			.getByRole('link', { name: /Bench Press/i })
			.first()
			.click();
		await expect(page.getByRole('heading', { level: 1 })).toContainText(/Bench Press/i);

		await page.getByRole('button', { name: 'Manuell anpassen' }).click();
		await page.getByLabel('Gewicht (kg)').fill('77.5');
		await page.getByLabel('Reps').fill('6');
		await page.getByLabel('RPE-Ziel').fill('8');
		await page.getByRole('button', { name: 'Anpassung speichern' }).click();
		await expect(page.getByText('Plan angepasst')).toBeVisible();
		await expect(page.getByText('Nächste Session geplant')).toBeVisible();

		await page.getByRole('link', { name: 'Jetzt loggen' }).click();
		await expect(page.getByText(/Geplante Empfehlung/)).toBeVisible();
		await expect(page.getByLabel('Satz 1 Gewicht')).toHaveValue('77.5');
		await expect(page.getByLabel('Satz 1 Reps')).toHaveValue('6');
		await expect(page.getByLabel('Satz 1 RPE')).toHaveValue('8');

		await page.getByRole('button', { name: 'Session speichern' }).click();
		await expect(page).toHaveURL(/\/sessions\/.+\/done/);
		await expect(page.getByRole('heading', { name: 'Session gespeichert' })).toBeVisible();

		await page.goto('/');
		await page
			.getByRole('link', { name: /Bench Press/i })
			.first()
			.click();
		await expect(page.getByText('Nächste Session geplant')).toHaveCount(0);
	});

	test('routine form disables invalid save, then creates, edits and deletes with feedback', async ({
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

		const editedRoutineName = `${routineName} Edit`;
		const createdRoutine = page.locator('article').filter({
			has: page.getByRole('heading', { name: routineName })
		});
		await createdRoutine.getByRole('button', { name: 'Routine bearbeiten' }).click();
		await expect(page.getByRole('heading', { name: 'Routine bearbeiten' })).toBeVisible();
		await page.locator('#edit-t-name').fill(editedRoutineName);
		await page.locator('#edit-t-desc').fill('Bearbeitete Routine für Feedback-Test');
		await page.getByRole('button', { name: 'Änderungen speichern' }).click();
		await expect(page.getByText('Routine aktualisiert')).toBeVisible();
		await expect(page.getByRole('heading', { name: editedRoutineName })).toBeVisible();
		await expect(page.getByText('Bearbeitete Routine für Feedback-Test')).toBeVisible();

		page.once('dialog', (dialog) => dialog.accept());
		await page
			.locator('article')
			.filter({ has: page.getByRole('heading', { name: editedRoutineName }) })
			.getByRole('button', { name: 'Routine löschen' })
			.click();
		await expect(page.getByText('Routine gelöscht')).toBeVisible();
		await expect(page.getByRole('heading', { name: editedRoutineName })).toHaveCount(0);
	});

	test('admin can create, edit and delete an exercise locally', async ({ page }) => {
		await login(page, 'admin', 'admin1234');
		await page.goto('/admin/exercises');
		await waitForApp(page);

		const exerciseName = `Codex Exercise ${Date.now()}`;
		const editedName = `${exerciseName} Edit`;

		await page.locator('#ex-name').fill(exerciseName);
		await page.locator('#ex-cat').selectOption('legs');
		await page.locator('#ex-mg').fill('Quads');
		await page.locator('#ex-reps').fill('8');
		await page.locator('#ex-rpe').fill('7');
		await page.getByRole('button', { name: 'Übung anlegen' }).click();
		await expect(page.getByText('Übung angelegt')).toBeVisible();
		await expect(page.getByText(exerciseName).first()).toBeVisible();

		await page
			.locator('li')
			.filter({ hasText: exerciseName })
			.first()
			.getByRole('button', { name: 'Bearbeiten' })
			.click();
		await expect(page.getByRole('heading', { name: 'Übung bearbeiten' })).toBeVisible();
		await page.locator('#edit-name').fill(editedName);
		await page.locator('#edit-mg').fill('Hamstrings');
		await page.locator('#edit-reps').fill('10');
		await page.locator('#edit-rpe').fill('8');
		await page.getByRole('button', { name: 'Änderungen speichern' }).click();
		await expect(page.getByText('Übung aktualisiert')).toBeVisible();
		await expect(page.locator('li').filter({ hasText: editedName }).first()).toContainText(
			'Default 10 Reps @ RPE 8'
		);

		page.once('dialog', (dialog) => dialog.accept());
		await page
			.locator('li')
			.filter({ hasText: editedName })
			.first()
			.getByRole('button', { name: 'Löschen' })
			.click();
		await expect(page.getByText('Übung gelöscht')).toBeVisible();
		await expect(page.locator('li').filter({ hasText: editedName })).toHaveCount(0);
	});

	test('404 page has a clear message and recovery action', async ({ page }) => {
		await page.goto('/route-die-es-nicht-gibt');
		await waitForApp(page);

		await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible();
		await page.getByRole('link', { name: 'Neu anmelden' }).click();
		await expect(page).toHaveURL('/login');
	});
});
