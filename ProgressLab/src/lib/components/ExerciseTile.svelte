<script lang="ts">
	import type { ExerciseWithRecDTO } from '$lib/types';
	import { formatRecommendation } from '$lib/format';

	let { exercise }: { exercise: ExerciseWithRecDTO } = $props();

	const arrow = $derived(
		exercise.recommendation.trend === 'up'
			? '↑'
			: exercise.recommendation.trend === 'down'
				? '↓'
				: '→'
	);
	const trendClass = $derived('trend-' + exercise.recommendation.trend);

	const sparkPath = $derived.by(() => {
		const xs = exercise.sparkline;
		if (xs.length === 0) return { line: '', area: '' };
		if (xs.length === 1) return { line: 'M0,18 L100,18', area: 'M0,18 L100,18 L100,36 L0,36 Z' };
		const min = Math.min(...xs);
		const max = Math.max(...xs);
		const range = Math.max(max - min, 1);
		const stepX = 100 / (xs.length - 1);
		const points = xs.map((v, i) => {
			const x = i * stepX;
			const y = 32 - ((v - min) / range) * 26;
			return [x, y] as const;
		});
		const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
		const area =
			line + ` L${points[points.length - 1][0].toFixed(1)},36 L${points[0][0].toFixed(1)},36 Z`;
		return { line, area };
	});
</script>

<a class="tile" href={`/exercises/${exercise.id}`} aria-label={`Übung ${exercise.name}`}>
	<div class="tile-head">
		<div class="tile-name">
			{exercise.name}
			{#if exercise.hasPR}
				<span class="pr-badge" title="Persönliche Bestleistung in den letzten 7 Tagen">PR</span>
			{/if}
		</div>
		<div class="trend {trendClass}" aria-label={`Trend ${exercise.recommendation.trend}`}>{arrow}</div>
	</div>

	<div class="meta">
		<span class="cat">{exercise.category}</span>
		{#if exercise.muscleGroup}
			<span class="dot">·</span>
			<span>{exercise.muscleGroup}</span>
		{/if}
	</div>

	{#if exercise.sparkline.length > 0}
		<svg class="spark" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
			<path d={sparkPath.area} class="spark-area" />
			<path d={sparkPath.line} class="spark-line" />
		</svg>
	{:else}
		<div class="spark-empty">Noch keine Daten</div>
	{/if}

	<div class="rec">
		<div class="rec-value">{formatRecommendation(exercise.recommendation)}</div>
		<div class="rec-why">{exercise.recommendation.reason}</div>
	</div>

	{#if exercise.recommendation.estimated1RM !== null && exercise.recommendation.estimated1RM > 0}
		<div class="e1rm">
			<span class="e1rm-lbl">e1RM</span>
			<span class="e1rm-val">{exercise.recommendation.estimated1RM} kg</span>
		</div>
	{/if}
</a>

<style>
	.tile {
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-lg);
		padding: 16px 16px 14px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		text-decoration: none;
		color: var(--c-text);
		transition: transform 160ms var(--ease), box-shadow 160ms var(--ease), border-color 160ms var(--ease);
		position: relative;
		min-height: 168px;
		box-shadow: var(--shadow-xs);
	}
	.tile:hover {
		box-shadow: var(--shadow-md);
		border-color: var(--c-border-strong);
		transform: translateY(-2px);
	}
	.tile:active {
		transform: translateY(0);
	}
	.tile-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 10px;
	}
	.tile-name {
		font-weight: 600;
		font-size: 15px;
		letter-spacing: -0.01em;
		display: inline-flex;
		gap: 6px;
		align-items: center;
		flex-wrap: wrap;
	}
	.pr-badge {
		display: inline-flex;
		align-items: center;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.08em;
		background: var(--c-warning-bg);
		color: var(--c-warning);
		padding: 2px 6px;
		border-radius: var(--radius-pill);
		text-transform: uppercase;
	}
	.trend {
		font-size: 16px;
		font-weight: 700;
		line-height: 1;
		padding-top: 2px;
	}
	.trend-up {
		color: var(--c-trend-up);
	}
	.trend-flat {
		color: var(--c-trend-flat);
	}
	.trend-down {
		color: var(--c-trend-down);
	}
	.meta {
		display: flex;
		gap: 4px;
		align-items: center;
		font-size: 11px;
		color: var(--c-text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.dot {
		opacity: 0.5;
	}
	.spark {
		width: 100%;
		height: 36px;
		margin: 4px 0 6px;
		display: block;
	}
	.spark-line {
		fill: none;
		stroke: var(--c-accent);
		stroke-width: 1.5;
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.spark-area {
		fill: var(--c-accent);
		opacity: 0.08;
	}
	.spark-empty {
		font-size: 11px;
		color: var(--c-text-subtle);
		padding: 12px 0;
		text-align: center;
	}
	.rec {
		margin-top: auto;
	}
	.rec-value {
		font-size: 14px;
		font-weight: 700;
	}
	.rec-why {
		font-size: 11px;
		color: var(--c-text-muted);
		margin-top: 2px;
		line-height: 1.4;
	}
	.e1rm {
		position: absolute;
		top: 14px;
		right: 14px;
		font-size: 10px;
		display: none;
	}
	.e1rm-lbl {
		color: var(--c-text-subtle);
		margin-right: 3px;
	}
	.e1rm-val {
		font-weight: 700;
		color: var(--c-text-muted);
	}
</style>
