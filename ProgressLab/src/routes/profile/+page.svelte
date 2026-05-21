<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { tick } from 'svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { showToast } from '$lib/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function initialProfile() {
		return data.profile;
	}

	let heightCm = $state<string | number>(initialProfile().heightCm?.toString() ?? '');
	let bodyWeightKg = $state<string | number>(initialProfile().bodyWeightKg?.toString() ?? '');
	let experience = $state(initialProfile().experience);
	let goal = $state(initialProfile().goal);
	let trainingDays = $state(initialProfile().trainingDays);
	let splitPreference = $state(initialProfile().splitPreference);
	let equipment = $state(initialProfile().equipment);
	let limitations = $state(initialProfile().limitations);
	let saving = $state(false);
	let generating = $state(false);
	let formError = $state('');
	let successMessage = $state('');
	let resultPanel: HTMLElement | undefined = $state();
	let generatedTemplates = $state<Array<{ id: string; name: string; exerciseCount: number }>>([]);

	const goalCopy = $derived(
		{
			hypertrophy: {
				label: 'Hypertrophy',
				text: 'Mehr Volumen, 8-15 Reps, Fokus auf Muskelaufbau.'
			},
			strength: {
				label: 'Kraft',
				text: 'Mehr Grundübungen, 3-6 Reps, klare Top-Sets.'
			},
			balanced: {
				label: 'Balanced',
				text: 'Mischung aus Kraft, Technik und Muskelaufbau.'
			}
		}[goal]
	);

	function optionalNumber(value: string | number): number | null {
		const text = String(value).trim();
		return text ? Number(text) : null;
	}

	function profilePayload() {
		return {
			heightCm: optionalNumber(heightCm),
			bodyWeightKg: optionalNumber(bodyWeightKg),
			experience,
			goal,
			trainingDays,
			splitPreference,
			equipment,
			limitations
		};
	}

	function validateProfileInput(): string {
		const height = optionalNumber(heightCm);
		const bodyWeight = optionalNumber(bodyWeightKg);

		if (height !== null && (!Number.isFinite(height) || height < 120 || height > 230)) {
			return 'Körpergrösse (cm) muss zwischen 120 und 230 liegen.';
		}
		if (
			bodyWeight !== null &&
			(!Number.isFinite(bodyWeight) || bodyWeight < 30 || bodyWeight > 250)
		) {
			return 'Körpergewicht (kg) muss zwischen 30 und 250 liegen.';
		}
		return '';
	}

	async function saveProfile(showSuccess = true) {
		formError = '';
		successMessage = '';
		const validationError = validateProfileInput();
		if (validationError) {
			formError = validationError;
			return false;
		}
		saving = true;
		try {
			const res = await fetch('/api/profile', {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(profilePayload())
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				formError = body.message ?? 'Profil konnte nicht gespeichert werden';
				return false;
			}
			if (showSuccess) {
				successMessage = 'Profil gespeichert. Deine Coach-ID ist aktuell.';
				showToast('Coach-ID gespeichert');
			}
			await invalidateAll();
			return true;
		} catch {
			formError = 'Verbindung fehlgeschlagen. Bitte Seite neu laden und erneut versuchen.';
			return false;
		} finally {
			saving = false;
		}
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		await saveProfile();
	}

	async function generatePlan() {
		const saved = await saveProfile(false);
		if (!saved) return;
		generating = true;
		formError = '';
		successMessage = '';
		try {
			const res = await fetch('/api/plan/generate', { method: 'POST' });
			const body = await res.json().catch(() => ({}));
			if (!res.ok) {
				formError = body.message ?? 'Plan konnte nicht generiert werden';
				return;
			}
			generatedTemplates = body.templates ?? [];
			successMessage = `${generatedTemplates.length} Coach-Routinen erstellt. Du findest sie jetzt unter Routinen.`;
			showToast(`${generatedTemplates.length} Coach-Routinen erstellt`);
			await invalidateAll();
			await tick();
			resultPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} catch {
			formError = 'Verbindung fehlgeschlagen. Bitte Seite neu laden und erneut versuchen.';
		} finally {
			generating = false;
		}
	}
</script>

<svelte:head>
	<title>Coach-ID · ProgressLab</title>
</svelte:head>

<section class="profile-hero">
	<div>
		<span class="eyebrow">Coach-ID</span>
		<h1>Dein Trainingsprofil</h1>
		<p>
			Ziel, Erfahrung und Wochenfrequenz steuern, welche Routinen ProgressLab für dich baut und wie
			aggressiv die Empfehlungen gedacht sind.
		</p>
	</div>
	<div class="hero-metrics" aria-label="Profilstatus">
		<div>
			<strong>{goalCopy.label}</strong>
			<span>Ziel</span>
		</div>
		<div>
			<strong>{trainingDays}x</strong>
			<span>pro Woche</span>
		</div>
		<div>
			<strong>{data.generatedCount}</strong>
			<span>Coach-Routinen</span>
		</div>
	</div>
</section>

<div class="layout">
	<form class="card profile-form" onsubmit={submit} novalidate>
		<div class="form-head">
			<div>
				<span class="eyebrow light">Athlete Data</span>
				<h2>Coach-ID einrichten</h2>
			</div>
			<span class="pill">{experience}</span>
		</div>

		<div class="field-grid two">
			<label>
				<span class="label">Grösse (cm)</span>
				<input
					class="input"
					type="number"
					inputmode="decimal"
					min="120"
					max="230"
					step="1"
					bind:value={heightCm}
					placeholder="178"
				/>
			</label>
			<label>
				<span class="label">Gewicht (kg)</span>
				<input
					class="input"
					type="number"
					inputmode="decimal"
					min="30"
					max="250"
					step="0.1"
					bind:value={bodyWeightKg}
					placeholder="82.5"
				/>
			</label>
		</div>

		<div>
			<span class="label">Ziel</span>
			<div class="choice-grid">
				<label class:active={goal === 'hypertrophy'}>
					<input type="radio" name="goal" value="hypertrophy" bind:group={goal} />
					<strong>Hypertrophy</strong>
					<span>maximaler Muskelaufbau</span>
				</label>
				<label class:active={goal === 'strength'}>
					<input type="radio" name="goal" value="strength" bind:group={goal} />
					<strong>Kraft</strong>
					<span>schwerere Grundübungen</span>
				</label>
				<label class:active={goal === 'balanced'}>
					<input type="radio" name="goal" value="balanced" bind:group={goal} />
					<strong>Balanced</strong>
					<span>stabiler Allround-Fortschritt</span>
				</label>
			</div>
		</div>

		<div class="field-grid two">
			<label>
				<span class="label">Erfahrung</span>
				<select class="select" bind:value={experience}>
					<option value="beginner">Anfänger</option>
					<option value="intermediate">Fortgeschritten</option>
					<option value="advanced">Erfahren</option>
				</select>
			</label>
			<label>
				<span class="label">Trainingstage pro Woche</span>
				<select class="select" bind:value={trainingDays}>
					<option value={2}>2 Tage</option>
					<option value={3}>3 Tage</option>
					<option value={4}>4 Tage</option>
					<option value={5}>5 Tage</option>
					<option value={6}>6 Tage</option>
				</select>
			</label>
		</div>

		<div class="field-grid two">
			<label>
				<span class="label">Split</span>
				<select class="select" bind:value={splitPreference}>
					<option value="auto">Automatisch</option>
					<option value="full_body">Full Body</option>
					<option value="upper_lower">Upper / Lower</option>
					<option value="push_pull_legs">Push / Pull / Legs</option>
				</select>
			</label>
			<label>
				<span class="label">Equipment</span>
				<select class="select" bind:value={equipment}>
					<option value="gym">Gym</option>
					<option value="basic">Basic Gym</option>
					<option value="bodyweight">Bodyweight</option>
				</select>
			</label>
		</div>

		<label>
			<span class="label">Einschränkungen (optional)</span>
			<textarea
				class="input textarea"
				bind:value={limitations}
				maxlength="300"
				placeholder="z. B. Schulter, Knie oder Rücken vorsichtig planen"
			></textarea>
		</label>

		{#if formError}
			<div class="error-banner" role="alert">{formError}</div>
		{/if}

		{#if successMessage}
			<div class="success-banner" role="status">{successMessage}</div>
		{/if}

		<div class="actions">
			<button class="btn btn-secondary" type="submit" disabled={saving || generating}>
				{#if saving}<Spinner />{/if}
				Profil speichern
			</button>
			<button
				class="btn btn-primary"
				type="button"
				onclick={generatePlan}
				disabled={saving || generating}
			>
				{#if generating}<Spinner />{/if}
				Plan generieren
			</button>
		</div>
	</form>

	<aside class="coach-panel">
		<div class="card insight">
			<span class="eyebrow light">Plan-Logik</span>
			<h2>{goalCopy.label}</h2>
			<p>{goalCopy.text}</p>
			<ul>
				<li><strong>{trainingDays} Trainingstage</strong><span>bestimmen Anzahl Routinen</span></li>
				<li><strong>{splitPreference}</strong><span>wählt Split-Struktur</span></li>
				<li><strong>{equipment}</strong><span>filtert Übungsauswahl</span></li>
			</ul>
		</div>

		{#if generatedTemplates.length > 0}
			<div class="card generated" bind:this={resultPanel}>
				<h2>Generiert</h2>
				<ul>
					{#each generatedTemplates as template (template.id)}
						<li>
							<span>{template.name}</span>
							<strong>{template.exerciseCount} Übungen</strong>
						</li>
					{/each}
				</ul>
				<button class="btn btn-primary" type="button" onclick={() => goto('/templates')}>
					Routinen ansehen
				</button>
			</div>
		{/if}
	</aside>
</div>

<style>
	.profile-hero {
		position: relative;
		overflow: hidden;
		display: flex;
		justify-content: space-between;
		gap: 24px;
		align-items: flex-end;
		padding: 30px;
		margin-bottom: 18px;
		border-radius: 30px;
		color: #fff;
		background: linear-gradient(135deg, rgba(16, 19, 26, 0.98), rgba(42, 47, 54, 0.94));
		box-shadow: 0 32px 78px -34px rgba(10, 12, 16, 0.72);
	}
	.profile-hero::after {
		content: '';
		position: absolute;
		right: -40px;
		top: -70px;
		width: 260px;
		height: 260px;
		border: 36px solid rgba(202, 255, 65, 0.15);
		border-radius: 50%;
	}
	.profile-hero > * {
		position: relative;
		z-index: 1;
	}
	.eyebrow {
		display: inline-flex;
		width: fit-content;
		margin-bottom: 8px;
		color: var(--c-volt);
		font-size: 11px;
		font-weight: 900;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.eyebrow.light {
		color: var(--c-text-subtle);
	}
	.profile-hero h1 {
		font-size: 48px;
		line-height: 0.98;
		margin-bottom: 12px;
	}
	.profile-hero p {
		max-width: 54ch;
		color: rgba(255, 255, 255, 0.76);
	}
	.hero-metrics {
		display: grid;
		grid-template-columns: repeat(3, minmax(110px, 1fr));
		gap: 8px;
		min-width: min(430px, 100%);
	}
	.hero-metrics div {
		padding: 12px;
		border: 1px solid rgba(255, 255, 255, 0.13);
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(14px);
	}
	.hero-metrics strong,
	.hero-metrics span {
		display: block;
	}
	.hero-metrics strong {
		font-size: 17px;
	}
	.hero-metrics span {
		margin-top: 3px;
		color: rgba(255, 255, 255, 0.62);
		font-size: 10px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.8fr);
		gap: 16px;
	}
	.profile-form,
	.coach-panel {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.form-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}
	.form-head h2,
	.insight h2,
	.generated h2 {
		font-size: 24px;
	}
	.pill {
		padding: 6px 10px;
		border-radius: 999px;
		background: var(--c-bg-alt);
		color: var(--c-text-muted);
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
	}
	.field-grid {
		display: grid;
		gap: 12px;
	}
	.field-grid.two {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	label {
		display: grid;
		gap: 6px;
	}
	.choice-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
	}
	.choice-grid label {
		position: relative;
		padding: 14px;
		border: 1px solid var(--c-border);
		border-radius: 18px;
		background: var(--c-surface);
		cursor: pointer;
		transition:
			border-color 140ms var(--ease),
			background 140ms var(--ease),
			transform 140ms var(--ease);
	}
	.choice-grid label:hover {
		transform: translateY(-1px);
		border-color: var(--c-border-strong);
	}
	.choice-grid label.active {
		border-color: var(--c-accent);
		background: var(--c-accent-soft);
	}
	.choice-grid input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.choice-grid strong,
	.choice-grid span {
		display: block;
	}
	.choice-grid strong {
		font-size: 14px;
	}
	.choice-grid span {
		margin-top: 4px;
		color: var(--c-text-muted);
		font-size: 12px;
	}
	.textarea {
		min-height: 92px;
		resize: vertical;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		flex-wrap: wrap;
	}
	.insight {
		background:
			linear-gradient(135deg, color-mix(in srgb, var(--c-volt) 12%, transparent), transparent 45%),
			var(--c-surface);
	}
	.insight p {
		margin-top: 6px;
		color: var(--c-text-muted);
	}
	.insight ul,
	.generated ul {
		list-style: none;
		display: grid;
		gap: 10px;
		margin-top: 18px;
	}
	.insight li,
	.generated li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 10px 0;
		border-top: 1px solid var(--c-border);
	}
	.insight li {
		display: grid;
	}
	.insight li span,
	.generated strong {
		color: var(--c-text-subtle);
		font-size: 12px;
	}
	.generated .btn {
		width: 100%;
		margin-top: 14px;
	}
	@media (max-width: 900px) {
		.profile-hero,
		.layout {
			grid-template-columns: 1fr;
		}
		.profile-hero {
			display: grid;
		}
		.hero-metrics {
			min-width: 0;
		}
	}
	@media (max-width: 640px) {
		.profile-hero {
			padding: 22px;
			border-radius: 24px;
		}
		.profile-hero h1 {
			font-size: 40px;
		}
		.hero-metrics,
		.field-grid.two,
		.choice-grid {
			grid-template-columns: 1fr;
		}
		.actions .btn {
			flex: 1 1 100%;
		}
	}
</style>
