<script lang="ts">
	import ExerciseTile from '$lib/components/ExerciseTile.svelte';
	import FilterTabs from '$lib/components/FilterTabs.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let category = $state('all');
	let query = $state('');
	let sort = $state<'name' | 'trend'>('name');

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const list = data.exercises.filter((ex) => {
			if (category !== 'all' && ex.category !== category) return false;
			if (q && !ex.name.toLowerCase().includes(q) && !ex.muscleGroup.toLowerCase().includes(q))
				return false;
			return true;
		});
		const order = { up: 0, flat: 1, down: 2 } as const;
		list.sort((a, b) =>
			sort === 'name'
				? a.name.localeCompare(b.name)
				: order[a.recommendation.trend] - order[b.recommendation.trend] ||
					a.name.localeCompare(b.name)
		);
		return list;
	});

	const counts = $derived({
		all: data.exercises.length,
		push: data.exercises.filter((e) => e.category === 'push').length,
		pull: data.exercises.filter((e) => e.category === 'pull').length,
		legs: data.exercises.filter((e) => e.category === 'legs').length
	});
</script>

<svelte:head>
	<title>Dashboard · ProgressLab</title>
</svelte:head>

<div class="head">
	<div>
		<h1>Dashboard</h1>
		<p class="muted">
			Hallo {data.user?.username} – wähle eine Übung oder starte direkt eine neue Session.
		</p>
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
	<div class="row search-row">
		<input
			class="input search"
			type="search"
			placeholder="Suche nach Übung oder Muskelgruppe…"
			bind:value={query}
			aria-label="Suche"
		/>
		<select class="select sort" bind:value={sort} aria-label="Sortierung">
			<option value="name">Sortierung: Name</option>
			<option value="trend">Sortierung: Trend</option>
		</select>
	</div>
</div>

{#if filtered.length === 0}
	<div class="card empty">
		<h2>Keine Übung gefunden</h2>
		<p class="muted">
			{#if data.exercises.length === 0}
				Es sind noch keine Übungen vorhanden. Frage einen Admin, welche anzulegen.
			{:else}
				Filter zurücksetzen oder andere Suche probieren.
			{/if}
		</p>
	</div>
{:else}
	<div class="grid">
		{#each filtered as ex (ex.id)}
			<ExerciseTile exercise={ex} />
		{/each}
	</div>
{/if}

<a class="fab" href="/sessions/new" aria-label="Neue Session starten">+</a>

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 18px;
	}
	.controls {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 18px;
	}
	.search-row {
		flex-wrap: wrap;
	}
	.search {
		flex: 1;
		min-width: 200px;
	}
	.sort {
		flex: 0 0 200px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 14px;
	}
	.empty {
		text-align: center;
		padding: 32px 16px;
	}
	.fab {
		position: fixed;
		bottom: 24px;
		right: 24px;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--c-accent);
		color: var(--c-accent-fg);
		font-size: 30px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-lg);
		text-decoration: none;
		z-index: 30;
	}
	.fab:active {
		transform: scale(0.93);
	}
	@media (max-width: 640px) {
		.head {
			flex-direction: column;
		}
		.head .btn {
			align-self: stretch;
			text-align: center;
		}
		.sort {
			flex-basis: 100%;
		}
	}
</style>
