<script lang="ts">
	type Option = { value: string; label: string };
	let {
		options,
		value = $bindable(),
		ariaLabel = 'Filter'
	}: { options: Option[]; value: string; ariaLabel?: string } = $props();
</script>

<div class="tabs" role="tablist" aria-label={ariaLabel}>
	{#each options as opt (opt.value)}
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
		align-items: center;
		flex-wrap: wrap;
		gap: 2px;
		width: fit-content;
		max-width: 100%;
		padding: 4px;
		background: var(--c-bg-alt);
		border: 1px solid color-mix(in srgb, var(--c-border) 72%, transparent);
		border-radius: var(--radius-pill);
	}
	button {
		min-height: 34px;
		padding: 7px 15px;
		border-radius: var(--radius-pill);
		border: 0;
		background: transparent;
		color: var(--c-text-muted);
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
		transition:
			background 120ms var(--ease),
			color 120ms var(--ease),
			box-shadow 120ms var(--ease);
	}
	button:hover {
		color: var(--c-text);
	}
	button.active {
		background: var(--c-surface);
		color: var(--c-text);
		box-shadow: var(--shadow-xs);
	}
	@media (max-width: 640px) {
		.tabs {
			width: 100%;
			overflow-x: auto;
			flex-wrap: nowrap;
			scrollbar-width: none;
		}
		.tabs::-webkit-scrollbar {
			display: none;
		}
		button {
			flex: 1 0 auto;
		}
	}
</style>
