<script lang="ts">
	import ExerciseTile from '$lib/components/ExerciseTile.svelte';
	import FilterTabs from '$lib/components/FilterTabs.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let category = $state('all');
	let query = $state('');
	let sort = $state<'name' | 'trend' | 'recent'>('recent');

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const list = data.exercises.filter((ex) => {
			if (category !== 'all' && ex.category !== category) return false;
			if (q && !ex.name.toLowerCase().includes(q) && !ex.muscleGroup.toLowerCase().includes(q))
				return false;
			return true;
		});
		const trendOrder = { up: 0, flat: 1, down: 2 } as const;
		list.sort((a, b) => {
			if (sort === 'name') return a.name.localeCompare(b.name);
			if (sort === 'trend')
				return (
					trendOrder[a.recommendation.trend] - trendOrder[b.recommendation.trend] ||
					a.name.localeCompare(b.name)
				);
			return b.sessionCount - a.sessionCount || a.name.localeCompare(b.name);
		});
		return list;
	});

	const counts = $derived({
		all: data.exercises.length,
		push: data.exercises.filter((e) => e.category === 'push').length,
		pull: data.exercises.filter((e) => e.category === 'pull').length,
		legs: data.exercises.filter((e) => e.category === 'legs').length
	});

	const totals = $derived({
		sessions: data.exercises.reduce((s, e) => s + e.sessionCount, 0),
		prs: data.exercises.filter((e) => e.hasPR).length,
		untrained: data.exercises.filter((e) => e.sessionCount === 0).length
	});

	function clearSearch() {
		query = '';
	}
</script>

<svelte:head>
	<title>Dashboard · ProgressLab</title>
</svelte:head>

<section class="hero">
	<div class="hero-text">
		<h1>Hi {data.user?.username} 👋</h1>
		<p class="muted">
			{#if totals.sessions === 0}
				Bereit für deine erste Session? Wähle eine Übung und der Coach schlägt dir Startwerte vor.
			{:else if totals.prs > 0}
				Stark — {totals.prs}
				{totals.prs === 1 ? 'Übung' : 'Übungen'} mit neuem PR diese Woche.
			{:else}
				{totals.sessions} Sessions getrackt. Heute weitermachen?
			{/if}
		</p>
	</div>
	<a class="btn btn-primary big" href="/sessions/new">
		<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
			<path d="M12 5v14M5 12h14" />
		</svg>
		Neue Session
	</a>
</section>

{#if data.templates.length > 0}
	<section class="routines">
		<div class="routines-head">
			<h2>Routinen</h2>
			<a href="/templates" class="muted small">Verwalten →</a>
		</div>
		<div class="routine-row">
			{#each data.templates.slice(0, 4) as t (t.id)}
				<a class="routine-card" href={`/workouts/${t.id}`}>
					<div class="routine-name">{t.name}</div>
					<div class="routine-meta">
						{t.exercises.length} Übungen{#if t.description} · {t.description}{/if}
					</div>
					<span class="routine-cta">Starten →</span>
				</a>
			{/each}
		</div>
	</section>
{/if}

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
		<div class="search-wrap">
			<svg class="search-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<circle cx="11" cy="11" r="7" />
				<path d="M21 21l-4.35-4.35" />
			</svg>
			<input
				class="input search"
				type="search"
				placeholder="Übung oder Muskelgruppe suchen…"
				bind:value={query}
				aria-label="Suche"
			/>
			{#if query}
				<button type="button" class="clear" onclick={clearSearch} aria-label="Suche leeren">×</button>
			{/if}
		</div>
		<select class="select sort" bind:value={sort} aria-label="Sortierung">
			<option value="recent">Häufigste zuerst</option>
			<option value="name">Alphabetisch</option>
			<option value="trend">Nach Trend</option>
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

<a class="fab" href="/sessions/new" aria-label="Neue Session starten">
	<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
		<path d="M12 5v14M5 12h14" />
	</svg>
</a>

<style>
	.hero {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 18px;
		margin-bottom: 28px;
		flex-wrap: wrap;
	}
	.hero-text {
		flex: 1;
		min-width: 260px;
	}
	.hero h1 {
		font-size: 30px;
		margin-bottom: 4px;
	}
	.hero .muted {
		font-size: 15px;
		max-width: 56ch;
	}
	.btn.big {
		padding: 13px 22px;
		font-size: 14px;
		font-weight: 600;
	}
	.controls {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 22px;
	}
	.routines {
		margin-bottom: 26px;
	}
	.routines-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 10px;
	}
	.routines-head h2 {
		font-size: 16px;
	}
	.small {
		font-size: 12px;
	}
	.routine-row {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 10px;
	}
	.routine-card {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 14px 16px;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--c-text);
		box-shadow: var(--shadow-xs);
		transition: transform 160ms var(--ease), box-shadow 160ms var(--ease), border-color 160ms var(--ease);
		position: relative;
		overflow: hidden;
	}
	.routine-card::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: var(--c-accent);
	}
	.routine-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--c-border-strong);
	}
	.routine-name {
		font-weight: 700;
		font-size: 14px;
		padding-left: 6px;
	}
	.routine-meta {
		font-size: 11px;
		color: var(--c-text-muted);
		padding-left: 6px;
	}
	.routine-cta {
		font-size: 12px;
		font-weight: 600;
		color: var(--c-accent);
		margin-top: 4px;
		padding-left: 6px;
	}
	.search-row {
		flex-wrap: wrap;
	}
	.search-wrap {
		flex: 1;
		min-width: 200px;
		position: relative;
		display: flex;
		align-items: center;
	}
	.search-icon {
		position: absolute;
		left: 14px;
		color: var(--c-text-subtle);
		pointer-events: none;
	}
	.search {
		flex: 1;
		padding-left: 38px;
	}
	.clear {
		position: absolute;
		right: 8px;
		width: 22px;
		height: 22px;
		border: none;
		background: var(--c-bg-alt);
		border-radius: 50%;
		font-size: 14px;
		cursor: pointer;
		color: var(--c-text-muted);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}
	.clear:hover {
		background: var(--c-border);
	}
	.sort {
		flex: 0 0 200px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 14px;
	}
	.empty {
		text-align: center;
		padding: 44px 20px;
	}
	.fab {
		position: fixed;
		bottom: 28px;
		right: 28px;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--c-accent);
		color: var(--c-accent-fg);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-xl);
		text-decoration: none;
		z-index: 30;
		transition: transform 160ms var(--ease), box-shadow 160ms var(--ease);
	}
	.fab:hover {
		transform: translateY(-2px) scale(1.05);
	}
	.fab:active {
		transform: translateY(0) scale(0.97);
	}
	@media (max-width: 640px) {
		.hero h1 {
			font-size: 24px;
		}
		.btn.big {
			width: 100%;
		}
		.sort {
			flex-basis: 100%;
		}
		.fab {
			bottom: 18px;
			right: 18px;
		}
	}
</style>
