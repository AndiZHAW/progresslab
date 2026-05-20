<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import RecommendationCard from '$lib/components/RecommendationCard.svelte';
	import SetLoggerTable from '$lib/components/SetLoggerTable.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { showToast } from '$lib/toast.svelte';
	import type { SetDTO } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const back = $derived(page.url.searchParams.get('back') ?? '');
	const safeBack = $derived(back.startsWith('/') && !back.startsWith('//') ? back : '');

	const isoDate = new Date().toISOString().slice(0, 10);

	let date = $state(isoDate);
	let sets = $state<SetDTO[]>(
		Array.from({ length: 3 }, () => ({
			weight: data.recommendation.weight ?? 0,
			reps: data.recommendation.reps,
			rpe: data.recommendation.rpeTarget
		}))
	);
	let note = $state('');
	let saving = $state(false);
	let formError = $state('');
	let setErrors = $state<string[]>([]);

	function validate(): boolean {
		setErrors = sets.map((s, i) => {
			if (!Number.isFinite(s.weight) || s.weight < 0 || s.weight > 1000)
				return `Satz ${i + 1}: Gewicht 0–1000 kg`;
			if (!Number.isInteger(Number(s.reps)) || s.reps < 1 || s.reps > 100)
				return `Satz ${i + 1}: Reps 1–100`;
			if (!Number.isFinite(s.rpe) || s.rpe < 1 || s.rpe > 10) return `Satz ${i + 1}: RPE 1–10`;
			return '';
		});
		return setErrors.every((m) => m === '');
	}

	async function save(e: SubmitEvent) {
		e.preventDefault();
		formError = '';
		if (!validate()) {
			formError = 'Bitte Eingaben prüfen';
			return;
		}
		saving = true;
		try {
			const res = await fetch('/api/sessions', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					exerciseId: data.exercise.id,
					date,
					sets: sets.map((s) => ({
						weight: Number(s.weight),
						reps: Number(s.reps),
						rpe: Number(s.rpe)
					})),
					note
				})
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				formError = body.message ?? 'Speichern fehlgeschlagen';
				return;
			}
			const session = await res.json();
			showToast('Session gespeichert');
			const url = safeBack
				? `/sessions/${session.id}/done?back=${encodeURIComponent(safeBack)}`
				: `/sessions/${session.id}/done`;
			await goto(url);
		} catch {
			formError = 'Verbindung fehlgeschlagen';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>{data.exercise.name} loggen · ProgressLab</title>
</svelte:head>

<div class="head">
	<a href={safeBack || '/sessions/new'} class="back" aria-label="Zurück">‹</a>
	<div>
		<h1>{data.exercise.name}</h1>
		<div class="muted small">
			{#if safeBack}Workout-Modus · Sätze erfassen{:else}Schritt 2 von 2 · Sätze erfassen{/if}
		</div>
	</div>
</div>

<RecommendationCard recommendation={data.recommendation} variant="light" label="Empfehlung" />

<section class="rpe-help" aria-labelledby="rpe-help-title">
	<div>
		<h2 id="rpe-help-title">RPE kurz erklärt</h2>
		<p class="muted small">
			RPE 7 = ca. 3 Reps in Reserve, RPE 8 = 2, RPE 9 = 1, RPE 10 = keine Reserve.
		</p>
	</div>
	<span class="rpe-pill">1-10</span>
</section>

<form onsubmit={save} novalidate>
	<div class="block">
		<label for="date" class="label">Datum</label>
		<input id="date" class="input" type="date" bind:value={date} required />
	</div>

	<div class="block">
		<div class="label">Sätze</div>
		<SetLoggerTable bind:sets isBodyweight={data.exercise.isBodyweight} />
		{#each setErrors as err, i}
			{#if err}
				<div class="error-banner small" role="alert">{err}</div>
			{/if}
		{/each}
	</div>

	<div class="block">
		<label for="note" class="label">Notiz (optional)</label>
		<textarea
			id="note"
			class="textarea"
			bind:value={note}
			rows="3"
			maxlength="500"
			placeholder="z. B. Pause kurz, Form sauber…"
		></textarea>
	</div>

	{#if formError}
		<div class="error-banner" role="alert">{formError}</div>
	{/if}

	<div class="sticky">
		<div class="counter">
			<div class="num">{sets.length} Sätze erfasst</div>
			<div class="muted small">Wird gespeichert &amp; aktualisiert die Empfehlung</div>
		</div>
		<button class="btn" type="submit" disabled={saving || sets.length === 0}>
			{#if saving}<Spinner />{/if}
			Session speichern
		</button>
	</div>
</form>

<style>
	.head {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 18px;
	}
	.back {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		font-size: 22px;
		color: var(--c-text);
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 18px;
		margin-top: 18px;
	}
	.rpe-help {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-top: 12px;
		padding: 14px 16px;
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		background: var(--c-surface);
	}
	.rpe-help h2 {
		margin: 0 0 3px;
		font-size: 14px;
	}
	.rpe-help p {
		margin: 0;
	}
	.rpe-pill {
		flex-shrink: 0;
		padding: 6px 10px;
		border-radius: var(--radius-pill);
		background: var(--c-accent-soft);
		color: var(--c-text);
		font-weight: 700;
		font-size: 12px;
	}
	.block {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.error-banner.small {
		font-size: 12px;
		padding: 6px 10px;
	}
	.sticky {
		position: sticky;
		bottom: 0;
		background: var(--c-surface);
		border-top: 1px solid var(--c-border);
		margin: 24px -16px -16px;
		padding: 14px 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	.counter .num {
		font-weight: 700;
		font-size: 13px;
	}
	.small {
		font-size: 12px;
	}
	@media (max-width: 640px) {
		.sticky .btn {
			flex: 1;
		}
	}
</style>
