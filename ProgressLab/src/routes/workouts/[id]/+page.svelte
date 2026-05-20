<script lang="ts">
	import { formatRecommendation } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const total = $derived(data.exercisesWithStatus.length);
	const done = $derived(data.exercisesWithStatus.filter((e) => e.doneNow).length);
	const pct = $derived(total > 0 ? Math.round((done / total) * 100) : 0);
	const isComplete = $derived(total > 0 && done === total);
	const nextExercise = $derived(data.exercisesWithStatus.find((e) => !e.doneNow) ?? null);
</script>

<svelte:head>
	<title>{data.template.name} · ProgressLab</title>
</svelte:head>

<div class="head">
	<a href="/templates" class="back" aria-label="Zurück">‹</a>
	<div class="title-block">
		<h1>{data.template.name}</h1>
		<div class="muted small">
			Workout-Modus · {done} / {total} Übungen geloggt {#if data.template.description}· {data
					.template.description}{/if}
		</div>
	</div>
</div>

<div class="progress-wrap">
	<div class="progress-bar">
		<div class="progress-fill" style:width={`${pct}%`}></div>
	</div>
	<span class="progress-pct">{pct}%</span>
</div>

{#if nextExercise}
	<section class="next-panel" aria-label="Nächste Übung">
		<div>
			<div class="eyebrow">Nächste Übung</div>
			<strong>{nextExercise.name}</strong>
			<p class="muted small">
				{formatRecommendation(nextExercise.recommendation)} · RPE {nextExercise.recommendation
					.rpeTarget}
			</p>
		</div>
		<a
			class="btn btn-primary"
			href={`/sessions/new/${nextExercise.id}?back=/workouts/${data.template.id}`}
		>
			Weiter loggen
		</a>
	</section>
{/if}

<ol class="ex-list">
	{#each data.exercisesWithStatus as ex, i (ex.id)}
		<li class:done={ex.doneNow} class:next={nextExercise?.id === ex.id}>
			<div class="num">{i + 1}</div>
			<div class="info">
				<div class="name-row">
					<div class="name">{ex.name}</div>
					{#if nextExercise?.id === ex.id}
						<span class="next-badge">Nächste Übung</span>
					{/if}
				</div>
				<div class="muted small">
					{ex.category}
					{#if ex.muscleGroup}
						· {ex.muscleGroup}{/if}
					· Empfehlung: {formatRecommendation(ex.recommendation)} (RPE {ex.recommendation
						.rpeTarget})
				</div>
			</div>
			<div class="action">
				{#if ex.doneNow}
					<span class="done-badge">
						<svg
							viewBox="0 0 24 24"
							width="14"
							height="14"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M5 12l5 5L20 7" />
						</svg>
						Geloggt
					</span>
				{:else}
					<a
						class="btn btn-primary small"
						href={`/sessions/new/${ex.id}?back=/workouts/${data.template.id}`}
					>
						Loggen →
					</a>
				{/if}
			</div>
		</li>
	{/each}
</ol>

{#if isComplete}
	<div class="card done-card">
		<svg
			viewBox="0 0 24 24"
			width="40"
			height="40"
			fill="none"
			stroke="var(--c-success)"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="12" r="11" />
			<path d="M6 12l4 4 8-9" />
		</svg>
		<h2>Workout abgeschlossen</h2>
		<p class="muted">Alle Übungen aus „{data.template.name}" sind geloggt.</p>
		<div class="row">
			<a class="btn btn-secondary" href="/templates">Routinen</a>
			<a class="btn btn-primary" href="/stats">Statistik anschauen</a>
		</div>
	</div>
{/if}

<style>
	.head {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 20px;
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
	.title-block {
		min-width: 0;
	}
	.small {
		font-size: 12px;
	}
	.progress-wrap {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 22px;
	}
	.progress-bar {
		flex: 1;
		height: 8px;
		background: var(--c-bg-alt);
		border-radius: var(--radius-pill);
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background: var(--c-accent);
		transition: width 320ms var(--ease);
	}
	.progress-pct {
		font-variant-numeric: tabular-nums;
		font-weight: 700;
		font-size: 13px;
		color: var(--c-text-muted);
		min-width: 36px;
		text-align: right;
	}
	.next-panel {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 18px;
		padding: 16px;
		background: var(--c-surface);
		border: 1px solid var(--c-border-strong);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}
	.next-panel p {
		margin: 4px 0 0;
	}
	.eyebrow {
		color: var(--c-text-muted);
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0;
		text-transform: uppercase;
	}
	.ex-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.ex-list li {
		display: grid;
		grid-template-columns: 36px 1fr auto;
		gap: 14px;
		align-items: center;
		padding: 14px 16px;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		transition:
			border-color 120ms var(--ease),
			background 200ms var(--ease);
	}
	.ex-list li:hover {
		border-color: var(--c-border-strong);
	}
	.ex-list li.done {
		background: var(--c-accent-soft);
		border-color: color-mix(in srgb, var(--c-accent) 35%, transparent);
	}
	.ex-list li.next {
		border-color: var(--c-border-strong);
		box-shadow: var(--shadow-sm);
	}
	.num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--c-bg-alt);
		font-weight: 700;
		font-size: 13px;
		color: var(--c-text-muted);
	}
	.done .num {
		background: var(--c-accent);
		color: var(--c-accent-fg);
	}
	.info {
		min-width: 0;
	}
	.name {
		font-weight: 600;
		font-size: 14px;
	}
	.name-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.next-badge {
		display: inline-flex;
		align-items: center;
		padding: 3px 8px;
		border-radius: var(--radius-pill);
		background: var(--c-accent-soft);
		color: var(--c-text);
		font-size: 11px;
		font-weight: 700;
	}
	.btn.small {
		padding: 8px 14px;
		font-size: 13px;
	}
	.done-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 600;
		color: var(--c-success);
		padding: 6px 10px;
		border-radius: var(--radius-pill);
		background: color-mix(in srgb, var(--c-success) 12%, transparent);
	}
	.done-card {
		text-align: center;
		padding: 30px 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		margin-top: 22px;
	}
	.done-card .row {
		justify-content: center;
		margin-top: 6px;
	}
	@media (max-width: 640px) {
		.next-panel {
			align-items: stretch;
			flex-direction: column;
		}
		.next-panel .btn {
			width: 100%;
		}
		.ex-list li {
			grid-template-columns: 28px 1fr;
			grid-template-rows: auto auto;
			gap: 10px;
		}
		.action {
			grid-column: 1 / 3;
			justify-self: stretch;
		}
		.action .btn {
			width: 100%;
		}
	}
</style>
