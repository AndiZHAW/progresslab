<script lang="ts">
	import { goto } from '$app/navigation';
	import FilterTabs from '$lib/components/FilterTabs.svelte';
	import { formatRecommendation } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let category = $state('all');
	let query = $state('');
	let selected: string | null = $state(null);

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return data.exercises.filter((ex) => {
			if (category !== 'all' && ex.category !== category) return false;
			if (q && !ex.name.toLowerCase().includes(q) && !ex.muscleGroup.toLowerCase().includes(q))
				return false;
			return true;
		});
	});

	function start() {
		if (!selected) return;
		goto(`/sessions/new/${selected}`);
	}
</script>

<svelte:head>
	<title>Neue Session · ProgressLab</title>
</svelte:head>

<div class="head">
	<a href="/" class="back" aria-label="Zurück">‹</a>
	<div>
		<h1>Neue Session</h1>
		<div class="muted small">Schritt 1 von 2 · Übung wählen</div>
	</div>
</div>

<div class="controls">
	<FilterTabs
		bind:value={category}
		ariaLabel="Kategorie"
		options={[
			{ value: 'all', label: 'Alle' },
			{ value: 'push', label: 'Push' },
			{ value: 'pull', label: 'Pull' },
			{ value: 'legs', label: 'Legs' }
		]}
	/>
	<input
		class="input"
		type="search"
		placeholder="Übung suchen…"
		bind:value={query}
		aria-label="Suche"
	/>
</div>

{#if filtered.length === 0}
	<div class="card empty">
		<p class="muted">Keine Übung gefunden.</p>
	</div>
{:else}
	<ul class="list" role="listbox" aria-label="Verfügbare Übungen">
		{#each filtered as ex (ex.id)}
			<li>
				<button
					type="button"
					class="row"
					class:active={selected === ex.id}
					aria-selected={selected === ex.id}
					role="option"
					onclick={() => (selected = selected === ex.id ? null : ex.id)}
				>
					<div>
						<div class="name">{ex.name}</div>
						<div class="sub">
							Empfohlen: {formatRecommendation(ex.recommendation)} · RPE-Ziel
							{ex.recommendation.rpeTarget}
						</div>
					</div>
					<span class="dot" aria-hidden="true">{selected === ex.id ? '✓' : '+'}</span>
				</button>
			</li>
		{/each}
	</ul>
{/if}

<div class="sticky">
	<span class="muted small">{selected ? '1 Übung ausgewählt' : 'Bitte Übung auswählen'}</span>
	<button class="btn" disabled={!selected} onclick={start}>Weiter ›</button>
</div>

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
	.controls {
		display: flex;
		flex-direction: column;
		gap: 12px;
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
	.row {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border-radius: var(--radius-md);
		border: 1px solid var(--c-border);
		background: var(--c-surface);
		cursor: pointer;
		text-align: left;
	}
	.row:hover {
		border-color: var(--c-text-muted);
	}
	.row.active {
		background: var(--c-accent);
		color: var(--c-accent-fg);
		border-color: var(--c-accent);
	}
	.row.active .sub {
		color: rgba(255, 255, 255, 0.75);
	}
	.name {
		font-weight: 700;
		font-size: 14px;
	}
	.sub {
		font-size: 12px;
		color: var(--c-text-muted);
		margin-top: 2px;
	}
	.dot {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 1px solid currentColor;
		font-size: 16px;
	}
	.sticky {
		position: sticky;
		bottom: 0;
		background: var(--c-surface);
		border-top: 1px solid var(--c-border);
		padding: 12px 0;
		margin: 24px -16px -16px;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		justify-content: space-between;
	}
	.empty {
		padding: 24px;
		text-align: center;
	}
	.small {
		font-size: 12px;
	}
</style>
