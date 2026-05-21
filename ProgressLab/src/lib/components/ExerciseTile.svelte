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
	const trendLabel = $derived(
		exercise.recommendation.trend === 'up'
			? 'Trend steigend'
			: exercise.recommendation.trend === 'down'
				? 'Trend fallend'
				: 'Trend stabil'
	);
	const trendClass = $derived('trend-' + exercise.recommendation.trend);
	const categoryClass = $derived(`cat-${exercise.category}`);

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
		const line = points
			.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
			.join(' ');
		const area =
			line + ` L${points[points.length - 1][0].toFixed(1)},36 L${points[0][0].toFixed(1)},36 Z`;
		return { line, area };
	});
</script>

<a
	class={`tile ${categoryClass}`}
	href={`/exercises/${exercise.id}`}
	aria-label={`Übung ${exercise.name}`}
>
	<div class="visual">
		<div class="visual-top">
			<span class="cat">{exercise.category}</span>
			<div class="trend {trendClass}" role="img" aria-label={trendLabel}>
				<span aria-hidden="true">{arrow}</span>
			</div>
		</div>
		<span class="disc disc-a"></span>
		<span class="disc disc-b"></span>
		<span class="slash slash-a"></span>
		<span class="slash slash-b"></span>
		{#if exercise.hasPR}
			<span
				class="pr-badge"
				title="Persönliche Bestleistung in den letzten 7 Tagen"
				aria-label="Neuer Personal Record in den letzten 7 Tagen">PR</span
			>
		{/if}
	</div>

	<div class="body">
		<div class="title-row">
			<div>
				<h3>{exercise.name}</h3>
				<div class="meta">
					{#if exercise.muscleGroup}
						<span>{exercise.muscleGroup}</span>
					{:else}
						<span>Training</span>
					{/if}
					<span>·</span>
					<span>{exercise.sessionCount} Sessions</span>
				</div>
			</div>
		</div>

		<div class="rec">
			<span>Coach</span>
			<strong>{formatRecommendation(exercise.recommendation)}</strong>
			<small>{exercise.recommendation.reason}</small>
		</div>

		{#if exercise.sparkline.length > 0}
			<svg class="spark" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
				<path d={sparkPath.area} class="spark-area" />
				<path d={sparkPath.line} class="spark-line" />
			</svg>
		{:else}
			<div class="spark-empty">Noch keine Daten</div>
		{/if}
	</div>
</a>

<style>
	.tile {
		background: var(--c-surface);
		border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
		border-radius: 24px;
		display: grid;
		grid-template-rows: 118px 1fr;
		text-decoration: none;
		color: var(--c-text);
		overflow: hidden;
		box-shadow: var(--shadow-card);
		transition:
			transform 160ms var(--ease),
			box-shadow 160ms var(--ease),
			border-color 160ms var(--ease);
		min-height: 284px;
	}
	.tile:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-lg);
		border-color: var(--c-border-strong);
	}
	.tile:active {
		transform: translateY(0);
	}
	.visual {
		position: relative;
		overflow: hidden;
		padding: 14px;
		color: #ffffff;
		background: #15171d;
	}
	.cat-push .visual {
		background: linear-gradient(135deg, #171316 0%, #6f2722 100%);
	}
	.cat-pull .visual {
		background: linear-gradient(135deg, #10141b 0%, #1f496f 100%);
	}
	.cat-legs .visual {
		background: linear-gradient(135deg, #111710 0%, #3f643a 100%);
	}
	.visual-top {
		position: relative;
		z-index: 2;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	.cat {
		display: inline-flex;
		padding: 6px 10px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.14);
		font-size: 10px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		backdrop-filter: blur(10px);
	}
	.trend {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.14);
		font-size: 18px;
		font-weight: 900;
		backdrop-filter: blur(10px);
	}
	.trend-up {
		color: var(--c-volt);
	}
	.trend-flat {
		color: rgba(255, 255, 255, 0.78);
	}
	.trend-down {
		color: #fecaca;
	}
	.disc,
	.slash {
		position: absolute;
		pointer-events: none;
	}
	.disc {
		border-radius: 50%;
		border: 18px solid rgba(255, 255, 255, 0.12);
	}
	.disc-a {
		width: 112px;
		height: 112px;
		right: -22px;
		bottom: -36px;
	}
	.disc-b {
		width: 52px;
		height: 52px;
		right: 8px;
		bottom: -6px;
		border-width: 10px;
		border-color: rgba(202, 255, 65, 0.34);
	}
	.slash {
		width: 180px;
		height: 9px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.16);
		transform: rotate(-28deg);
		right: -30px;
	}
	.slash-a {
		top: 54px;
	}
	.slash-b {
		top: 78px;
		background: rgba(255, 255, 255, 0.08);
	}
	.pr-badge {
		position: absolute;
		left: 14px;
		bottom: 14px;
		z-index: 2;
		display: inline-flex;
		align-items: center;
		font-size: 10px;
		font-weight: 900;
		letter-spacing: 0.08em;
		background: var(--c-volt);
		color: #10131a;
		padding: 5px 9px;
		border-radius: var(--radius-pill);
		text-transform: uppercase;
	}
	.body {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	h3 {
		font-size: 18px;
		line-height: 1.08;
		max-width: 14ch;
	}
	.meta {
		margin-top: 5px;
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		align-items: center;
		font-size: 11px;
		color: var(--c-text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.rec {
		display: grid;
		gap: 2px;
		margin-top: auto;
	}
	.rec span {
		font-size: 10px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--c-text-subtle);
	}
	.rec strong {
		font-size: 18px;
		line-height: 1.1;
	}
	.rec small {
		color: var(--c-text-muted);
		font-size: 12px;
		line-height: 1.35;
	}
	.spark {
		width: 100%;
		height: 34px;
		margin-top: 2px;
		display: block;
	}
	.spark-line {
		fill: none;
		stroke: var(--c-text);
		stroke-width: 1.7;
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.spark-area {
		fill: var(--c-text);
		opacity: 0.06;
	}
	.spark-empty {
		font-size: 12px;
		color: var(--c-text-subtle);
		padding: 9px 0 2px;
	}
	@media (max-width: 640px) {
		.tile {
			grid-template-rows: 112px 1fr;
			min-height: 268px;
		}
		h3 {
			max-width: 18ch;
		}
	}
</style>
