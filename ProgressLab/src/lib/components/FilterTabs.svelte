<script lang="ts">
	type Option = { value: string; label: string };
	let {
		options,
		value = $bindable(),
		ariaLabel = 'Filter'
	}: { options: Option[]; value: string; ariaLabel?: string } = $props();
</script>

<div class="tabs" role="tablist" aria-label={ariaLabel}>
	{#each options as opt}
		<button
			type="button"
			role="tab"
			aria-selected={value === opt.value}
			class:active={value === opt.value}
			onclick={() => (value = opt.value)}
		>
			{opt.label}
		</button>
	{/each}
</div>

<style>
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	button {
		padding: 8px 16px;
		border-radius: var(--radius-pill);
		border: 1px solid var(--c-text-subtle);
		background: var(--c-surface);
		color: var(--c-text);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: background 120ms ease;
	}
	button:hover {
		background: var(--c-bg);
	}
	button.active {
		background: var(--c-accent);
		color: var(--c-accent-fg);
		border-color: var(--c-accent);
	}
</style>
