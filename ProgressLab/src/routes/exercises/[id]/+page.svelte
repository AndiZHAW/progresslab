<script lang="ts">
	import RecommendationCard from '$lib/components/RecommendationCard.svelte';
	import ProgressChart from '$lib/components/ProgressChart.svelte';
	import SessionList from '$lib/components/SessionList.svelte';
	import { showToast } from '$lib/toast.svelte';
	import { formatDate } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let accepted = $state(false);

	function accept() {
		accepted = true;
		showToast('Empfehlung für nächste Session geplant');
	}
</script>

<svelte:head>
	<title>{data.exercise.name} · ProgressLab</title>
</svelte:head>

<div class="head">
	<a href="/" class="back" aria-label="Zurück zum Dashboard">‹</a>
	<div class="title-block">
		<h1>{data.exercise.name}</h1>
		<div class="muted small">
			<span class="cat-tag">{data.exercise.category}</span>
			{#if data.exercise.muscleGroup}
				· {data.exercise.muscleGroup}{/if}
			{#if data.exercise.isBodyweight}
				· Bodyweight{/if}
			{#if data.sessions.length > 0}
				· {data.sessions.length} Sessions{/if}
		</div>
	</div>
	<div class="spacer"></div>
	<a class="btn btn-primary" href={`/sessions/new/${data.exercise.id}`}>Session loggen</a>
</div>

<RecommendationCard recommendation={data.recommendation} />

<div class="actions">
	<button class="btn btn-primary" disabled={accepted} onclick={accept}>
		{accepted ? '✓ Geplant' : 'Empfehlung akzeptieren'}
	</button>
	<a class="btn btn-secondary" href={`/sessions/new/${data.exercise.id}`}>Manuell loggen</a>
</div>

{#if data.pr.topWeight || data.pr.estimated1RM}
	<section class="block">
		<h2>Persönliche Records</h2>
		<div class="pr-grid">
			{#if data.pr.topWeight}
				<div class="pr-mini">
					<div class="pr-lbl">Top-Gewicht</div>
					<div class="pr-val">{data.pr.topWeight.weight} kg × {data.pr.topWeight.reps}</div>
					<div class="pr-date">{formatDate(data.pr.topWeight.date)}</div>
				</div>
			{/if}
			{#if data.pr.estimated1RM}
				<div class="pr-mini accent">
					<div class="pr-lbl">Geschätztes 1RM</div>
					<div class="pr-val">{data.pr.estimated1RM.value} kg</div>
					<div class="pr-date">aus {data.pr.estimated1RM.weight} × {data.pr.estimated1RM.reps}</div>
				</div>
			{/if}
			{#if data.pr.topReps}
				<div class="pr-mini">
					<div class="pr-lbl">Top-Reps</div>
					<div class="pr-val">
						{data.pr.topReps.reps} × {data.exercise.isBodyweight
							? 'BW'
							: `${data.pr.topReps.weight} kg`}
					</div>
					<div class="pr-date">{formatDate(data.pr.topReps.date)}</div>
				</div>
			{/if}
			{#if data.pr.bestVolume}
				<div class="pr-mini">
					<div class="pr-lbl">Bestes Session-Volumen</div>
					<div class="pr-val">{data.pr.bestVolume.value.toLocaleString('de-CH')} kg</div>
					<div class="pr-date">{formatDate(data.pr.bestVolume.date)}</div>
				</div>
			{/if}
		</div>
	</section>
{/if}

<section class="block">
	<h2>Verlauf</h2>
	<p class="muted small">Top-Gewicht und Ø RPE pro Session</p>
	<ProgressChart sessions={data.sessions} />
</section>

<section class="block">
	<h2>Letzte Sessions</h2>
	<div class="card">
		<SessionList
			sessions={data.sessions.slice(0, 8)}
			emptyText="Noch keine Sessions für diese Übung."
		/>
	</div>
</section>

<style>
	.head {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 22px;
		flex-wrap: wrap;
	}
	.back {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		font-size: 22px;
		color: var(--c-text);
		flex-shrink: 0;
	}
	.back:hover {
		background: var(--c-bg-alt);
	}
	.title-block {
		min-width: 0;
	}
	.cat-tag {
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		font-size: 11px;
		background: var(--c-bg-alt);
		padding: 2px 8px;
		border-radius: var(--radius-pill);
	}
	.small {
		font-size: 12px;
	}
	.actions {
		display: flex;
		gap: 10px;
		margin: 18px 0;
		flex-wrap: wrap;
	}
	.actions .btn {
		flex: 1;
		min-width: 180px;
	}
	.block {
		margin-top: 30px;
	}
	.block h2 {
		margin-bottom: 4px;
	}
	.block .muted {
		margin-bottom: 12px;
	}
	.pr-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		gap: 10px;
	}
	.pr-mini {
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.pr-mini.accent {
		background: var(--c-accent-soft);
		border: 1px solid color-mix(in srgb, var(--c-accent) 35%, transparent);
		position: relative;
		padding-left: 19px;
	}
	.pr-mini.accent::before {
		content: '';
		position: absolute;
		left: 0;
		top: 14px;
		bottom: 14px;
		width: 3px;
		border-radius: 0 2px 2px 0;
		background: var(--c-accent);
	}
	.pr-mini.accent .pr-lbl {
		color: var(--c-accent-hover);
	}
	:global([data-theme='dark']) .pr-mini.accent .pr-lbl {
		color: var(--c-accent);
	}
	.pr-mini.accent .pr-date {
		color: var(--c-text-muted);
	}
	.pr-lbl {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		color: var(--c-text-subtle);
	}
	.pr-val {
		font-size: 18px;
		font-weight: 800;
		letter-spacing: -0.01em;
	}
	.pr-date {
		font-size: 11px;
		color: var(--c-text-subtle);
	}
	@media (max-width: 640px) {
		.head .btn {
			width: 100%;
		}
	}
</style>
