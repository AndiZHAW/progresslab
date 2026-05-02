<script lang="ts">
	let { size = 18, label = '' }: { size?: number; label?: string } = $props();
</script>

<span class="wrap" role="status">
	<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
		<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.2" />
		<path d="M12 3 a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" />
	</svg>
	{#if label}<span class="label">{label}</span>{/if}
</span>

<style>
	.wrap {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: inherit;
	}
	svg {
		animation: spin 0.9s linear infinite;
	}
	.label {
		font-size: 13px;
		color: var(--c-text-muted);
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
