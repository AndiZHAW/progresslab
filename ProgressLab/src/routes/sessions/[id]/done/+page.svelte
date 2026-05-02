<script lang="ts">
	import { page } from '$app/state';
	import RecommendationCard from '$lib/components/RecommendationCard.svelte';
	import { formatDate, topWeight, topReps, avgRpe } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const back = $derived(page.url.searchParams.get('back') ?? '');
	const safeBack = $derived(back.startsWith('/') && !back.startsWith('//') ? back : '');
</script>

<svelte:head>
	<title>Gespeichert · ProgressLab</title>
</svelte:head>

<div class="confirm">
	<div class="check" aria-hidden="true">
		<svg viewBox="0 0 24 24" width="48" height="48">
			<circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="2" />
			<polyline
				points="6,12 10.5,16.5 18,8"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>
	<h1>Session gespeichert</h1>
	<p class="muted">
		{data.exercise.name} · {data.session.sets.length} Sätze · {formatDate(data.session.date)}
	</p>

	<div class="stats">
		<div>
			<div class="stat-num">{topWeight(data.session.sets)} kg</div>
			<div class="stat-lbl">Top-Gewicht</div>
		</div>
		<div>
			<div class="stat-num">{topReps(data.session.sets)}</div>
			<div class="stat-lbl">Reps</div>
		</div>
		<div>
			<div class="stat-num">{avgRpe(data.session.sets).toFixed(1)}</div>
			<div class="stat-lbl">Ø RPE</div>
		</div>
	</div>

	{#if data.newRecommendation}
		<RecommendationCard
			recommendation={data.newRecommendation}
			label="Empfehlung aktualisiert"
		/>
	{/if}

	<div class="actions">
		{#if safeBack}
			<a class="btn btn-primary" href={safeBack}>Zurück zur Routine →</a>
			<a class="btn btn-secondary" href="/">Zum Dashboard</a>
		{:else}
			<a class="btn btn-primary" href="/">Zum Dashboard</a>
			<a class="btn btn-secondary" href="/sessions/new">Weitere Übung loggen</a>
		{/if}
	</div>
</div>

<style>
	.confirm {
		max-width: 480px;
		margin: 24px auto;
		display: flex;
		flex-direction: column;
		gap: 14px;
		text-align: center;
	}
	.check {
		display: flex;
		justify-content: center;
		color: var(--c-success);
		margin-bottom: 6px;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin: 12px 0 18px;
	}
	.stats > div {
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		padding: 12px 8px;
	}
	.stat-num {
		font-size: 22px;
		font-weight: 800;
	}
	.stat-lbl {
		font-size: 11px;
		color: var(--c-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 2px;
	}
	.actions {
		display: flex;
		gap: 10px;
		flex-direction: column;
		margin-top: 8px;
	}
</style>
