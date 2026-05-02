<script lang="ts">
	let {
		label,
		value,
		hint,
		accent = false
	}: { label: string; value: string | number; hint?: string; accent?: boolean } = $props();
</script>

<div class="stat" class:accent>
	<div class="lbl">{label}</div>
	<div class="val">{value}</div>
	{#if hint}<div class="hint">{hint}</div>{/if}
</div>

<style>
	.stat {
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-lg);
		padding: 18px 20px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		box-shadow: var(--shadow-xs);
		transition: transform 160ms var(--ease), box-shadow 160ms var(--ease);
	}
	.stat:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}
	.stat.accent {
		background: linear-gradient(135deg, var(--c-text) 0%, color-mix(in srgb, var(--c-text) 78%, var(--c-accent)) 100%);
		color: var(--c-bg);
		border-color: transparent;
	}
	.lbl {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		opacity: 0.7;
	}
	.val {
		font-size: 26px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.hint {
		font-size: 12px;
		opacity: 0.7;
		margin-top: 2px;
	}
</style>
