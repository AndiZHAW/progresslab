<script lang="ts">
	import FilterTabs from '$lib/components/FilterTabs.svelte';
	import { formatDate, topWeight, topReps, avgRpe } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let category = $state('all');

	const filtered = $derived(
		data.sessions.filter((s) => category === 'all' || s.category === category)
	);

	const counts = $derived({
		all: data.sessions.length,
		push: data.sessions.filter((s) => s.category === 'push').length,
		pull: data.sessions.filter((s) => s.category === 'pull').length,
		legs: data.sessions.filter((s) => s.category === 'legs').length
	});
</script>

<svelte:head>
	<title>Sessions · ProgressLab</title>
</svelte:head>

<div class="head">
	<div>
		<h1>Sessions</h1>
		<p class="muted">Letzte {data.sessions.length} Sessions (max. 100)</p>
	</div>
	<a class="btn" href="/sessions/new">+ Neue Session</a>
</div>

<div class="controls">
	<FilterTabs
		bind:value={category}
		ariaLabel="Kategorie"
		options={[
			{ value: 'all', label: `Alle (${counts.all})` },
			{ value: 'push', label: `Push (${counts.push})` },
			{ value: 'pull', label: `Pull (${counts.pull})` },
			{ value: 'legs', label: `Legs (${counts.legs})` }
		]}
	/>
</div>

{#if filtered.length === 0}
	<div class="card empty">
		<h2>Noch keine Sessions</h2>
		<p class="muted">Starte deine erste Session, um sie hier zu sehen.</p>
		<a class="btn" href="/sessions/new" style="margin-top:8px;">Session loggen</a>
	</div>
{:else}
	<ul class="list">
		{#each filtered as s (s.id)}
			<li>
				<a href={`/exercises/${s.exerciseId}`}>
					<div class="row">
						<div>
							<div class="name">{s.exerciseName ?? 'Übung'}</div>
							<div class="muted small">
								{formatDate(s.date)} · {s.sets.length} Sätze · {topWeight(s.sets)} kg ×
								{topReps(s.sets)}
							</div>
						</div>
						<div class="rpe">RPE Ø {avgRpe(s.sets).toFixed(1)}</div>
					</div>
				</a>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 18px;
	}
	.controls {
		margin-bottom: 16px;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.list a {
		display: block;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		padding: 14px 16px;
		text-decoration: none;
		color: inherit;
	}
	.list a:hover {
		border-color: var(--c-text-muted);
	}
	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}
	.name {
		font-weight: 700;
	}
	.small {
		font-size: 12px;
	}
	.rpe {
		color: var(--c-text-muted);
		font-size: 13px;
	}
	.empty {
		text-align: center;
		padding: 32px;
	}
	@media (max-width: 640px) {
		.head {
			flex-direction: column;
		}
		.head .btn {
			align-self: stretch;
			text-align: center;
		}
	}
</style>
