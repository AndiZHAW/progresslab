<script lang="ts">
	import FilterTabs from '$lib/components/FilterTabs.svelte';
	import { formatDate } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let category = $state('all');

	const filtered = $derived(
		data.records.filter((r) => category === 'all' || r.exercise.category === category)
	);

	const counts = $derived({
		all: data.records.length,
		push: data.records.filter((r) => r.exercise.category === 'push').length,
		pull: data.records.filter((r) => r.exercise.category === 'pull').length,
		legs: data.records.filter((r) => r.exercise.category === 'legs').length
	});
</script>

<svelte:head>
	<title>Records · ProgressLab</title>
</svelte:head>

<div class="head">
	<div>
		<h1>Personal Records</h1>
		<p class="muted">
			Deine Bestwerte je Übung – top Gewicht, top Reps, geschätztes 1RM und höchstes Volumen pro
			Session.
		</p>
	</div>
</div>

{#if data.records.length === 0}
	<div class="card empty">
		<h2>Noch keine Records</h2>
		<p class="muted">
			Logge deine erste Session, um persönliche Bestleistungen zu erfassen.
		</p>
		<a class="btn btn-primary" href="/sessions/new" style="margin-top:8px; align-self:center;">
			+ Erste Session loggen
		</a>
	</div>
{:else}
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

	<div class="grid">
		{#each filtered as r (r.exercise.id)}
			<article class="rec-card">
				<header>
					<a href={`/exercises/${r.exercise.id}`} class="title">{r.exercise.name}</a>
					<span class="cat">{r.exercise.category}</span>
				</header>
				<div class="rows">
					<div class="row-pr">
						<span class="lbl">Top-Gewicht</span>
						<span class="val">
							{#if r.pr.topWeight}
								{r.pr.topWeight.weight} kg × {r.pr.topWeight.reps}
								<small>{formatDate(r.pr.topWeight.date)}</small>
							{:else}—{/if}
						</span>
					</div>
					<div class="row-pr">
						<span class="lbl">Top-Reps</span>
						<span class="val">
							{#if r.pr.topReps}
								{r.pr.topReps.reps} × {r.exercise.isBodyweight ? 'BW' : `${r.pr.topReps.weight} kg`}
								<small>{formatDate(r.pr.topReps.date)}</small>
							{:else}—{/if}
						</span>
					</div>
					{#if !r.exercise.isBodyweight}
						<div class="row-pr accent">
							<span class="lbl">Geschätztes 1RM (Epley)</span>
							<span class="val big">
								{#if r.pr.estimated1RM}
									{r.pr.estimated1RM.value} kg
									<small>aus {r.pr.estimated1RM.weight} × {r.pr.estimated1RM.reps}</small>
								{:else}—{/if}
							</span>
						</div>
					{/if}
					<div class="row-pr">
						<span class="lbl">Höchstes Session-Volumen</span>
						<span class="val">
							{#if r.pr.bestVolume}
								{r.pr.bestVolume.value.toLocaleString('de-CH')} kg
								<small>{formatDate(r.pr.bestVolume.date)}</small>
							{:else}—{/if}
						</span>
					</div>
				</div>
				<footer>
					<span class="muted small">{r.sessionCount} Session{r.sessionCount === 1 ? '' : 's'}</span>
					<a href={`/exercises/${r.exercise.id}`} class="btn btn-ghost small">Verlauf →</a>
				</footer>
			</article>
		{/each}
	</div>
{/if}

<style>
	.head {
		margin-bottom: 18px;
	}
	.controls {
		margin-bottom: 18px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 14px;
	}
	.rec-card {
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-lg);
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		box-shadow: var(--shadow-xs);
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
	}
	.title {
		font-weight: 700;
		font-size: 16px;
		color: var(--c-text);
	}
	.title:hover {
		color: var(--c-accent);
	}
	.cat {
		font-size: 10px;
		color: var(--c-text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 600;
	}
	.rows {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.row-pr {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 10px 12px;
		border-radius: var(--radius-md);
		background: var(--c-surface-alt);
		border: 1px solid var(--c-border);
	}
	.row-pr.accent {
		background: var(--c-accent-soft);
		border: 1px solid color-mix(in srgb, var(--c-accent) 35%, transparent);
		position: relative;
		padding-left: 16px;
	}
	.row-pr.accent::before {
		content: '';
		position: absolute;
		left: 0;
		top: 10px;
		bottom: 10px;
		width: 3px;
		border-radius: 0 2px 2px 0;
		background: var(--c-accent);
	}
	.row-pr.accent .lbl {
		color: var(--c-accent-hover);
	}
	:global([data-theme='dark']) .row-pr.accent .lbl {
		color: var(--c-accent);
	}
	.row-pr.accent .val {
		color: var(--c-text);
	}
	.row-pr.accent .val small {
		color: var(--c-text-muted);
		opacity: 1;
	}
	.lbl {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 600;
		color: var(--c-text-subtle);
	}
	.val {
		font-size: 15px;
		font-weight: 700;
		display: flex;
		gap: 8px;
		align-items: baseline;
		flex-wrap: wrap;
	}
	.val.big {
		font-size: 22px;
	}
	.val small {
		font-size: 11px;
		font-weight: 500;
		opacity: 0.75;
	}
	footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1px solid var(--c-border);
		padding-top: 10px;
	}
	.btn.small {
		padding: 6px 12px;
		font-size: 13px;
	}
	.empty {
		text-align: center;
		padding: 36px 24px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.small {
		font-size: 12px;
	}
</style>
