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

	const sparkPoints = $derived.by(() => {
		const xs = exercise.sparkline;
		if (xs.length === 0) return '';
		if (xs.length === 1) return `0,18 90,18`;
		const min = Math.min(...xs);
		const max = Math.max(...xs);
		const range = Math.max(max - min, 1);
		const stepX = 90 / (xs.length - 1);
		return xs
			.map((v, i) => {
				const x = i * stepX;
				const y = 32 - ((v - min) / range) * 28;
				return `${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	});
</script>

<a class="tile" href={`/exercises/${exercise.id}`} aria-label={`Übung ${exercise.name}`}>
	<div class="tile-head">
		<div class="tile-name">{exercise.name}</div>
		<div class="trend {trendClass}">{arrow}</div>
	</div>

	{#if exercise.sparkline.length > 0}
		<svg class="spark" viewBox="0 0 90 36" preserveAspectRatio="none" aria-hidden="true">
			<polyline points={sparkPoints} fill="none" stroke="currentColor" stroke-width="1.6" />
		</svg>
	{:else}
		<div class="spark-empty">Noch keine Daten</div>
	{/if}

	<div class="tile-rec">{formatRecommendation(exercise.recommendation)}</div>
	<div class="tile-why">Warum: {exercise.recommendation.reason}</div>
</a>

<style>
	.tile {
		background: var(--c-surface);
		border: 1.4px solid var(--c-border-strong);
		border-radius: var(--radius-md);
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		text-decoration: none;
		color: var(--c-text);
		transition: transform 120ms ease, box-shadow 120ms ease;
		min-height: 138px;
	}
	.tile:hover {
		box-shadow: var(--shadow-md);
	}
	.tile:active {
		transform: scale(0.98);
	}
	.tile-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	.tile-name {
		font-weight: 700;
		font-size: 14px;
	}
	.trend {
		font-size: 18px;
		font-weight: 700;
	}
	.trend-up {
		color: var(--c-success);
	}
	.trend-flat {
		color: var(--c-text-subtle);
	}
	.trend-down {
		color: var(--c-danger);
	}
	.spark {
		width: 100%;
		height: 36px;
		margin: 6px 0;
	}
	.spark-empty {
		font-size: 11px;
		color: var(--c-text-subtle);
		padding: 8px 0;
	}
	.tile-rec {
		font-size: 12px;
		font-weight: 700;
		margin-top: auto;
	}
	.tile-why {
		font-size: 11px;
		color: var(--c-text-muted);
	}
</style>
