<script lang="ts">
	import type { SetDTO } from '$lib/types';

	let { sets = $bindable(), isBodyweight = false }: { sets: SetDTO[]; isBodyweight?: boolean } =
		$props();

	function addSet() {
		const last = sets.at(-1);
		const next: SetDTO = last
			? { weight: last.weight, reps: last.reps, rpe: last.rpe }
			: { weight: 0, reps: 5, rpe: 7 };
		sets = [...sets, next];
	}

	function removeSet(index: number) {
		sets = sets.filter((_, i) => i !== index);
	}
</script>

<div class="wrap">
	<div class="head">
		<span>#</span>
		<span>{isBodyweight ? 'Zusatz (kg)' : 'Gewicht (kg)'}</span>
		<span>Reps</span>
		<span>RPE</span>
		<span></span>
	</div>
	{#each sets as set, i (i)}
		<div class="row">
			<div class="num">{i + 1}</div>
			<input
				class="input"
				type="number"
				min="0"
				max="1000"
				step="0.5"
				inputmode="decimal"
				bind:value={set.weight}
				aria-label={`Satz ${i + 1} Gewicht`}
			/>
			<input
				class="input"
				type="number"
				min="1"
				max="100"
				step="1"
				inputmode="numeric"
				bind:value={set.reps}
				aria-label={`Satz ${i + 1} Reps`}
			/>
			<input
				class="input"
				type="number"
				min="1"
				max="10"
				step="0.5"
				inputmode="decimal"
				bind:value={set.rpe}
				aria-label={`Satz ${i + 1} RPE`}
			/>
			<button
				type="button"
				class="del"
				aria-label={`Satz ${i + 1} entfernen`}
				disabled={sets.length === 1}
				onclick={() => removeSet(i)}
			>
				×
			</button>
		</div>
	{/each}

	<button type="button" class="add" onclick={addSet}>+ Satz hinzufügen</button>
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.head,
	.row {
		display: grid;
		grid-template-columns: 30px 1fr 80px 80px 32px;
		gap: 8px;
		align-items: center;
	}
	.head {
		font-size: 10px;
		color: var(--c-text-subtle);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding-bottom: 4px;
		border-bottom: 1px solid var(--c-border);
	}
	.num {
		text-align: center;
		font-weight: 700;
		font-size: 13px;
	}
	.input {
		width: 100%;
		text-align: center;
		min-height: 42px;
		padding: 8px 6px;
		border: 1px solid var(--c-border);
		border-radius: 13px;
		background: var(--c-surface-alt);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.input:focus {
		outline: none;
		border-color: var(--c-accent);
		background: var(--c-surface);
		box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-accent) 16%, transparent);
	}
	.del {
		width: 32px;
		height: 32px;
		background: var(--c-bg-alt);
		border: none;
		color: var(--c-text-subtle);
		font-size: 22px;
		line-height: 1;
		cursor: pointer;
		border-radius: 50%;
	}
	.del:hover:not(:disabled) {
		color: var(--c-danger);
	}
	.del:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
	.add {
		min-height: 44px;
		border: 1px dashed var(--c-border-strong);
		background: var(--c-surface-alt);
		padding: 12px;
		border-radius: var(--radius-lg);
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		color: var(--c-text);
	}
	.add:hover {
		background: var(--c-surface);
		border-color: var(--c-accent);
	}
	@media (max-width: 520px) {
		.head,
		.row {
			grid-template-columns: 26px 1fr 68px 68px 32px;
			gap: 6px;
		}
		.input {
			padding-inline: 4px;
		}
	}
</style>
