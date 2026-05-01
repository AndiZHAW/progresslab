<script lang="ts">
	import RecommendationCard from '$lib/components/RecommendationCard.svelte';
	import ProgressChart from '$lib/components/ProgressChart.svelte';
	import SessionList from '$lib/components/SessionList.svelte';
	import { showToast } from '$lib/toast.svelte';
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
	<div>
		<h1>{data.exercise.name}</h1>
		<div class="muted small">
			{data.exercise.category.toUpperCase()}
			{#if data.exercise.muscleGroup} · {data.exercise.muscleGroup}{/if}
			{#if data.exercise.isBodyweight} · Bodyweight{/if}
		</div>
	</div>
	<div class="spacer"></div>
	<a class="btn" href={`/sessions/new/${data.exercise.id}`}>Session loggen</a>
</div>

<RecommendationCard recommendation={data.recommendation} />

<div class="actions">
	<button class="btn" disabled={accepted} onclick={accept}>
		{accepted ? '✓ Geplant' : 'Empfehlung akzeptieren'}
	</button>
	<a class="btn btn-secondary" href={`/sessions/new/${data.exercise.id}`}>Manuell loggen</a>
</div>

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
	.back:hover {
		background: var(--c-bg);
	}
	.small {
		font-size: 12px;
	}
	.actions {
		display: flex;
		gap: 10px;
		margin: 16px 0;
		flex-wrap: wrap;
	}
	.actions .btn {
		flex: 1;
		min-width: 180px;
	}
	.block {
		margin-top: 28px;
	}
	.block h2 {
		margin-bottom: 4px;
	}
	.block .muted {
		margin-bottom: 12px;
	}
	@media (max-width: 640px) {
		.head {
			flex-wrap: wrap;
		}
		.head .btn {
			width: 100%;
		}
	}
</style>
