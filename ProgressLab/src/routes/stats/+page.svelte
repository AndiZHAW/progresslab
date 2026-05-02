<script lang="ts">
	import StatCard from '$lib/components/StatCard.svelte';
	import VolumeChart from '$lib/components/VolumeChart.svelte';
	import CategoryDonut from '$lib/components/CategoryDonut.svelte';
	import { formatDate } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const s = $derived(data.stats);
	const totalVolumeFmt = $derived(`${(s.totalVolume / 1000).toFixed(1)} t`);
</script>

<svelte:head>
	<title>Statistik · ProgressLab</title>
</svelte:head>

<div class="head">
	<div>
		<h1>Statistik</h1>
		<p class="muted">
			{#if s.firstSessionDate}
				Aktivität seit {formatDate(s.firstSessionDate)}
			{:else}
				Noch keine Sessions erfasst.
			{/if}
		</p>
	</div>
	<a class="btn btn-secondary" href="/api/sessions/export" download>CSV exportieren</a>
</div>

{#if s.totalSessions === 0}
	<div class="card empty">
		<h2>Starte deine erste Session</h2>
		<p class="muted">Sobald du Trainings loggst, erscheinen hier Auswertungen, Trends und Records.</p>
		<a class="btn btn-primary" href="/sessions/new" style="margin-top:8px; align-self:center;">+ Erste Session loggen</a>
	</div>
{:else}
	<div class="grid">
		<StatCard label="Sessions gesamt" value={s.totalSessions} accent />
		<StatCard
			label="Total Volumen"
			value={totalVolumeFmt}
			hint={`${s.totalVolume.toLocaleString('de-CH')} kg`}
		/>
		<StatCard label="Sätze gesamt" value={s.totalSets.toLocaleString('de-CH')} />
		<StatCard label="Reps gesamt" value={s.totalReps.toLocaleString('de-CH')} />
		<StatCard
			label="Aktuelle Streak"
			value={`${s.currentStreakDays} Tage`}
			hint={`Längste: ${s.longestStreakDays}`}
		/>
		<StatCard
			label="Trainings/Woche"
			value={s.avgSessionsPerWeek.toFixed(1)}
			hint={`${s.uniqueExercises} Übungen`}
		/>
	</div>

	<section class="block">
		<h2>Volumen pro Woche</h2>
		<p class="muted small">Summe Gewicht × Reps über alle Sätze</p>
		<VolumeChart weeks={s.weeklyVolume} />
	</section>

	<div class="row two-col">
		<section class="block grow">
			<h2>Verteilung nach Kategorie</h2>
			<p class="muted small">Volumen Push / Pull / Legs (kg)</p>
			<CategoryDonut data={s.categoryVolume} />
		</section>

		<section class="block grow">
			<h2>Top 6 Übungen nach Volumen</h2>
			<ul class="top">
				{#each s.topExercisesByVolume as t, i (t.exerciseId)}
					<li>
						<a href={`/exercises/${t.exerciseId}`}>
							<span class="rank">#{i + 1}</span>
							<span class="name">{t.name}</span>
							<span class="muted">{t.sessions} Sessions</span>
							<span class="vol">{t.volume.toLocaleString('de-CH')} kg</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	</div>
{/if}

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 14px;
		margin-bottom: 22px;
		flex-wrap: wrap;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 14px;
		margin-bottom: 28px;
	}
	.block {
		margin-top: 24px;
	}
	.block h2 {
		margin-bottom: 4px;
	}
	.block .muted.small {
		font-size: 12px;
		margin-bottom: 12px;
	}
	.two-col {
		gap: 18px;
		flex-wrap: wrap;
		align-items: stretch;
	}
	.two-col .grow {
		flex: 1;
		min-width: 300px;
		display: flex;
		flex-direction: column;
	}
	.top {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-lg);
		padding: 6px;
	}
	.top li a {
		display: grid;
		grid-template-columns: 32px 1fr auto auto;
		gap: 12px;
		align-items: center;
		padding: 10px 12px;
		border-radius: var(--radius-md);
		color: var(--c-text);
		transition: background 120ms var(--ease);
	}
	.top li a:hover {
		background: var(--c-bg-alt);
	}
	.rank {
		font-size: 12px;
		font-weight: 700;
		color: var(--c-text-subtle);
	}
	.name {
		font-weight: 600;
	}
	.vol {
		font-weight: 700;
		color: var(--c-accent);
		font-size: 13px;
	}
	.empty {
		text-align: center;
		padding: 36px 24px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	@media (max-width: 640px) {
		.top li a {
			grid-template-columns: 28px 1fr auto;
		}
		.top li .muted {
			grid-column: 2 / 4;
			font-size: 11px;
		}
	}
</style>
