<script lang="ts">
	import type { Recommendation } from '$lib/types';
	import { formatRecommendation } from '$lib/format';

	let {
		recommendation,
		variant = 'dark',
		label = 'Empfehlung nächste Session'
	}: { recommendation: Recommendation; variant?: 'dark' | 'light'; label?: string } = $props();
</script>

<div class="rec" class:light={variant === 'light'}>
	<div class="lbl">{label}</div>
	<div class="main">{formatRecommendation(recommendation)}</div>
	<div class="why">{recommendation.reason} · RPE-Ziel {recommendation.rpeTarget}</div>
	{#if recommendation.deload}
		<div class="badge">Deload</div>
	{/if}
</div>

<style>
	.rec {
		background: #111;
		color: #fff;
		border-radius: var(--radius-md);
		padding: 16px 18px;
		position: relative;
	}
	.rec.light {
		background: #f0f0f0;
		color: #111;
	}
	.lbl {
		font-size: 11px;
		letter-spacing: 0.06em;
		opacity: 0.75;
		text-transform: uppercase;
	}
	.main {
		font-size: 24px;
		font-weight: 800;
		margin: 6px 0 4px;
	}
	.why {
		font-size: 12px;
		opacity: 0.75;
	}
	.badge {
		position: absolute;
		top: 14px;
		right: 14px;
		background: var(--c-warning);
		color: #fff;
		font-size: 10px;
		font-weight: 700;
		padding: 3px 8px;
		border-radius: var(--radius-pill);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>
