<script lang="ts">
	import type { Recommendation } from '$lib/types';
	import { formatRecommendation } from '$lib/format';

	let {
		recommendation,
		variant = 'dark',
		label = 'Empfehlung nächste Session'
	}: {
		recommendation: Recommendation;
		variant?: 'dark' | 'light' | 'accent';
		label?: string;
	} = $props();
</script>

<div class="rec" data-variant={variant}>
	<div class="lbl">{label}</div>
	<div class="main">{formatRecommendation(recommendation)}</div>
	<div class="meta">
		<span>{recommendation.reason}</span>
		<span class="sep">·</span>
		<span>RPE-Ziel {recommendation.rpeTarget}</span>
		{#if recommendation.estimated1RM !== null && recommendation.estimated1RM > 0}
			<span class="sep">·</span>
			<span>e1RM {recommendation.estimated1RM} kg</span>
		{/if}
	</div>
	{#if recommendation.deload}
		<div class="badge">Deload</div>
	{/if}
</div>

<style>
	.rec {
		border-radius: var(--radius-lg);
		padding: 22px 24px;
		position: relative;
		box-shadow: var(--shadow-card);
	}
	.rec[data-variant='dark'] {
		background: linear-gradient(
			135deg,
			var(--c-text) 0%,
			color-mix(in srgb, var(--c-text) 76%, var(--c-accent)) 100%
		);
		color: var(--c-bg);
	}
	.rec[data-variant='light'] {
		background: var(--c-surface-alt);
		color: var(--c-text);
		border: 1px solid var(--c-border);
		box-shadow: var(--shadow-xs);
	}
	.rec[data-variant='accent'] {
		background: linear-gradient(135deg, var(--c-accent) 0%, var(--c-accent-hover) 100%);
		color: var(--c-accent-fg);
	}
	.lbl {
		font-size: 11px;
		letter-spacing: 0.06em;
		opacity: 0.8;
		text-transform: uppercase;
		font-weight: 600;
	}
	.main {
		font-size: 28px;
		font-weight: 800;
		margin: 8px 0 6px;
		letter-spacing: 0;
	}
	.meta {
		font-size: 12px;
		opacity: 0.85;
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		align-items: center;
	}
	.sep {
		opacity: 0.5;
	}
	.badge {
		position: absolute;
		top: 16px;
		right: 16px;
		background: rgba(255, 255, 255, 0.18);
		color: inherit;
		font-size: 10px;
		font-weight: 700;
		padding: 4px 10px;
		border-radius: var(--radius-pill);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		backdrop-filter: blur(6px);
	}
	.rec[data-variant='light'] .badge {
		background: var(--c-warning-bg);
		color: var(--c-warning);
	}
</style>
