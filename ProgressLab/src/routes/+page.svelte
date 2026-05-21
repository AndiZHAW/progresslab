<script lang="ts">
	import ExerciseTile from '$lib/components/ExerciseTile.svelte';
	import FilterTabs from '$lib/components/FilterTabs.svelte';
	import { formatRecommendation } from '$lib/format';
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
		untrained: data.exercises.filter((e) => e.sessionCount === 0).length,
		routines: data.templates.length
	});

	const nextExercise = $derived.by(() => {
		const trained = data.exercises.filter((ex) => ex.sessionCount > 0);
		const source = trained.length > 0 ? trained : data.exercises;
		return [...source].sort(
			(a, b) => b.sessionCount - a.sessionCount || a.name.localeCompare(b.name)
		)[0];
	});

	const primaryTemplate = $derived(data.templates[0] ?? null);

	function clearSearch() {
		query = '';
	}

	function categoryLabel(value: string | undefined): string {
		if (value === 'push') return 'Push';
		if (value === 'pull') return 'Pull';
		if (value === 'legs') return 'Legs';
		return 'Training';
	}

	function routineTone(index: number): string {
		return ['tone-push', 'tone-pull', 'tone-legs', 'tone-neutral'][index % 4];
	}
</script>

<svelte:head>
	<title>Dashboard · ProgressLab</title>
</svelte:head>

<section class="today">
	<div class="today-card">
		<div class="today-copy">
			<span class="eyebrow">Heute trainieren</span>
			<h1>Hi {data.user?.username}</h1>
			<p>
				{#if totals.sessions === 0}
					Starte deine erste Session und lass ProgressLab deine nächsten Trainingswerte ableiten.
				{:else if totals.prs > 0}
					{totals.prs}
					{totals.prs === 1 ? 'neuer PR' : 'neue PRs'} diese Woche. Nutze den Schwung für die nächste
					Einheit.
				{:else}
					{totals.sessions} Sessions getrackt. Wähle eine Übung oder starte direkt eine Routine.
				{/if}
			</p>
			<div class="hero-actions">
				<a class="btn btn-light big" href="/sessions/new">Session starten</a>
				{#if primaryTemplate}
					<a class="btn btn-dark-ghost big" href={`/workouts/${primaryTemplate.id}`}>
						{primaryTemplate.name}
					</a>
				{/if}
			</div>
		</div>

		<div class="today-focus" aria-label="Empfehlung">
			<span class="focus-label">Nächste Empfehlung</span>
			{#if nextExercise}
				<strong>{nextExercise.name}</strong>
				<span>{formatRecommendation(nextExercise.recommendation)}</span>
			{:else}
				<strong>Bereit</strong>
				<span>Übung wählen</span>
			{/if}
		</div>

		<div class="training-art" aria-hidden="true">
			<span class="plate plate-a"></span>
			<span class="plate plate-b"></span>
			<span class="bar bar-a"></span>
			<span class="bar bar-b"></span>
			<span class="runner-line"></span>
		</div>
	</div>

	<div class="metrics" aria-label="Trainingsübersicht">
		<div>
			<strong>{totals.sessions}</strong>
			<span>Sessions</span>
		</div>
		<div>
			<strong>{totals.routines}</strong>
			<span>Routinen</span>
		</div>
		<div>
			<strong>{totals.prs}</strong>
			<span>PRs/Woche</span>
		</div>
	</div>
</section>

{#if data.templates.length > 0}
	<section class="routines" aria-labelledby="routine-title">
		<div class="section-head">
			<div>
				<span class="eyebrow light">Workouts</span>
				<h2 id="routine-title">Geführte Routinen</h2>
			</div>
			<a href="/templates" class="text-link">Verwalten</a>
		</div>
		<div class="routine-rail">
			{#each data.templates.slice(0, 4) as t, i (t.id)}
				<a class={`routine-card ${routineTone(i)}`} href={`/workouts/${t.id}`}>
					<div class="routine-top">
						<span>{categoryLabel(t.exercises[0]?.category)}</span>
						<span>{t.exercises.length} Übungen</span>
					</div>
					<div>
						<div class="routine-name">{t.name}</div>
						{#if t.description}
							<div class="routine-meta">{t.description}</div>
						{:else}
							<div class="routine-meta">Geführte Einheit starten</div>
						{/if}
					</div>
					<span class="routine-cta">Starten</span>
					<span class="routine-art" aria-hidden="true"></span>
				</a>
			{/each}
		</div>
	</section>
{/if}

<section class="library" aria-labelledby="library-title">
	<div class="section-head library-head">
		<div>
			<span class="eyebrow light">Übungsbibliothek</span>
			<h2 id="library-title">Empfehlungen</h2>
		</div>
		<span class="library-count">{filtered.length} aktiv</span>
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
			<div class="search-wrap">
				<svg
					class="search-icon"
					viewBox="0 0 24 24"
					width="14"
					height="14"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				>
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
					<button type="button" class="clear" onclick={clearSearch} aria-label="Suche leeren"
						>×</button
					>
				{/if}
			</div>
			<select class="select sort" bind:value={sort} aria-label="Sortierung">
				<option value="recent">Häufigste zuerst</option>
				<option value="name">Alphabetisch</option>
				<option value="trend">Nach Trend</option>
			</select>
		</div>
	</div>
</section>

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
	<svg
		viewBox="0 0 24 24"
		width="22"
		height="22"
		fill="none"
		stroke="currentColor"
		stroke-width="2.6"
		stroke-linecap="round"
	>
		<path d="M12 5v14M5 12h14" />
	</svg>
</a>

<style>
	.today {
		display: grid;
		gap: 12px;
		margin-bottom: 30px;
	}
	.today-card {
		position: relative;
		min-height: 330px;
		padding: 30px;
		border-radius: 30px;
		overflow: hidden;
		color: #fff;
		background: linear-gradient(135deg, rgba(16, 19, 26, 0.98) 0%, rgba(33, 36, 42, 0.95) 100%);
		box-shadow: 0 32px 78px -34px rgba(10, 12, 16, 0.72);
	}
	.today-copy {
		position: relative;
		z-index: 2;
		max-width: 560px;
		min-height: 270px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
	.eyebrow {
		display: inline-flex;
		width: fit-content;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.11em;
		text-transform: uppercase;
		color: var(--c-volt);
		margin-bottom: 10px;
	}
	.eyebrow.light {
		color: var(--c-text-subtle);
		margin-bottom: 4px;
	}
	.today h1 {
		font-size: 52px;
		line-height: 0.98;
		max-width: 10ch;
		margin-bottom: 14px;
	}
	.today p {
		margin: 0;
		max-width: 44ch;
		color: rgba(255, 255, 255, 0.78);
		font-size: 16px;
	}
	.hero-actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 24px;
	}
	.btn.big {
		min-height: 48px;
		padding: 13px 20px;
		font-size: 14px;
	}
	.btn-light {
		background: #ffffff;
		color: #10131a;
	}
	.btn-light:hover:not(:disabled) {
		background: #edf0e8;
	}
	.btn-dark-ghost {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
		border-color: rgba(255, 255, 255, 0.22);
		box-shadow: none;
	}
	.btn-dark-ghost:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.16);
		box-shadow: none;
	}
	.today-focus {
		position: absolute;
		right: 24px;
		bottom: 24px;
		z-index: 2;
		width: min(250px, calc(100% - 48px));
		padding: 16px;
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 22px;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(18px);
		display: grid;
		gap: 4px;
	}
	.focus-label {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.58);
	}
	.today-focus strong {
		font-size: 18px;
		line-height: 1.15;
	}
	.today-focus span:last-child {
		color: var(--c-volt);
		font-weight: 800;
	}
	.training-art {
		position: absolute;
		inset: 0;
		overflow: hidden;
		opacity: 0.95;
	}
	.plate {
		position: absolute;
		border: 1px solid rgba(255, 255, 255, 0.16);
		background: rgba(255, 255, 255, 0.06);
	}
	.plate-a {
		width: 190px;
		height: 190px;
		border-radius: 50%;
		right: 70px;
		top: 34px;
	}
	.plate-b {
		width: 92px;
		height: 92px;
		border-radius: 50%;
		right: 120px;
		top: 83px;
		border-color: rgba(202, 255, 65, 0.42);
	}
	.bar {
		position: absolute;
		right: -22px;
		height: 12px;
		width: 340px;
		background: rgba(255, 255, 255, 0.13);
		border-radius: 999px;
		transform: rotate(-32deg);
	}
	.bar-a {
		top: 94px;
	}
	.bar-b {
		top: 132px;
		background: rgba(202, 255, 65, 0.32);
	}
	.runner-line {
		position: absolute;
		right: 32px;
		bottom: 62px;
		width: 220px;
		height: 84px;
		border: 2px solid rgba(255, 255, 255, 0.18);
		border-left: 0;
		border-bottom: 0;
		border-radius: 0 42px 0 0;
		transform: skewX(-14deg);
	}
	.metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}
	.metrics div {
		background: var(--c-surface);
		border: 1px solid color-mix(in srgb, var(--c-border) 78%, transparent);
		border-radius: 18px;
		padding: 14px 16px;
		box-shadow: var(--shadow-xs);
	}
	.metrics strong {
		display: block;
		font-size: 20px;
		line-height: 1;
	}
	.metrics span {
		display: block;
		margin-top: 4px;
		font-size: 11px;
		color: var(--c-text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.section-head {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 16px;
		margin-bottom: 12px;
	}
	.section-head h2 {
		font-size: 24px;
	}
	.text-link {
		font-size: 13px;
		font-weight: 800;
		color: var(--c-text);
	}
	.routines {
		margin-bottom: 32px;
	}
	.routine-rail {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(250px, 1fr);
		gap: 12px;
		overflow-x: auto;
		scroll-snap-type: x proximity;
		padding-bottom: 4px;
	}
	.routine-card {
		position: relative;
		min-height: 190px;
		padding: 18px;
		border-radius: 24px;
		overflow: hidden;
		color: #ffffff;
		background: #111318;
		text-decoration: none;
		box-shadow: var(--shadow-lg);
		scroll-snap-align: start;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		transition:
			transform 160ms var(--ease),
			box-shadow 160ms var(--ease);
	}
	.routine-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-xl);
	}
	.routine-card.tone-push {
		background: linear-gradient(135deg, #151317 0%, #55221f 100%);
	}
	.routine-card.tone-pull {
		background: linear-gradient(135deg, #10141b 0%, #1c3a5d 100%);
	}
	.routine-card.tone-legs {
		background: linear-gradient(135deg, #101610 0%, #315230 100%);
	}
	.routine-card.tone-neutral {
		background: linear-gradient(135deg, #151515 0%, #3a3430 100%);
	}
	.routine-top {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: rgba(255, 255, 255, 0.72);
		position: relative;
		z-index: 2;
	}
	.routine-name {
		position: relative;
		z-index: 2;
		font-size: 26px;
		font-weight: 900;
		line-height: 0.98;
		max-width: 8ch;
	}
	.routine-meta {
		position: relative;
		z-index: 2;
		margin-top: 7px;
		color: rgba(255, 255, 255, 0.72);
		font-size: 12px;
		max-width: 22ch;
	}
	.routine-cta {
		position: relative;
		z-index: 2;
		width: fit-content;
		padding: 8px 13px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.16);
		font-size: 12px;
		font-weight: 800;
		backdrop-filter: blur(10px);
	}
	.routine-art {
		position: absolute;
		right: -30px;
		bottom: -42px;
		width: 150px;
		height: 150px;
		border-radius: 50%;
		border: 28px solid rgba(255, 255, 255, 0.1);
	}
	.library {
		margin-bottom: 18px;
	}
	.library-count {
		font-size: 12px;
		font-weight: 800;
		color: var(--c-text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.controls {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.search-row {
		flex-wrap: wrap;
		padding: 10px;
		background: color-mix(in srgb, var(--c-surface) 78%, transparent);
		border: 1px solid color-mix(in srgb, var(--c-border) 72%, transparent);
		border-radius: 22px;
		box-shadow: var(--shadow-xs);
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
		background: var(--c-surface);
	}
	.clear {
		position: absolute;
		right: 8px;
		width: 24px;
		height: 24px;
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
		background: var(--c-surface);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(238px, 1fr));
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
		transition:
			transform 160ms var(--ease),
			box-shadow 160ms var(--ease);
	}
	.fab:hover {
		transform: translateY(-2px) scale(1.05);
	}
	.fab:active {
		transform: translateY(0) scale(0.97);
	}
	@media (max-width: 760px) {
		.today {
			margin-bottom: 26px;
		}
		.today-card {
			display: grid;
			min-height: auto;
			gap: 18px;
			padding: 22px;
		}
		.today-copy {
			min-height: auto;
			justify-content: flex-start;
		}
		.today h1 {
			font-size: 43px;
			max-width: none;
		}
		.today p {
			font-size: 15px;
		}
		.hero-actions {
			margin-top: 18px;
		}
		.today-focus {
			position: relative;
			left: auto;
			right: auto;
			bottom: auto;
			width: auto;
			padding: 14px;
			border-radius: 20px;
		}
		.training-art {
			opacity: 0.62;
		}
		.metrics {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.metrics div {
			padding: 12px 10px;
		}
		.routine-rail {
			grid-auto-columns: minmax(240px, 78vw);
			margin-right: -12px;
			padding-right: 12px;
		}
		.sort {
			flex-basis: 100%;
		}
		.btn.big {
			flex: 1 1 170px;
		}
		.grid {
			grid-template-columns: 1fr;
		}
		.fab {
			display: none;
		}
	}
</style>
