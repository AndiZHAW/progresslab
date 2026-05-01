<script lang="ts">
	import type { SessionDTO } from '$lib/types';
	import { formatDate, topWeight, topReps, avgRpe } from '$lib/format';

	let {
		sessions,
		emptyText = 'Noch keine Sessions erfasst.'
	}: { sessions: SessionDTO[]; emptyText?: string } = $props();
</script>

{#if sessions.length === 0}
	<div class="empty">{emptyText}</div>
{:else}
	<ul class="list">
		{#each sessions as s (s.id)}
			<li>
				<div class="left">
					<div class="date">{formatDate(s.date)}</div>
					<div class="meta">
						{topWeight(s.sets)} kg × {topReps(s.sets)} · {s.sets.length} Sätze
					</div>
				</div>
				<div class="right">RPE Ø {avgRpe(s.sets).toFixed(1)}</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 0;
		border-bottom: 1px solid var(--c-border);
	}
	li:last-child {
		border-bottom: none;
	}
	.date {
		font-size: 13px;
		font-weight: 600;
	}
	.meta {
		font-size: 12px;
		color: var(--c-text-muted);
	}
	.right {
		font-size: 12px;
		color: var(--c-text-muted);
	}
	.empty {
		padding: 16px 0;
		color: var(--c-text-subtle);
		font-size: 13px;
		text-align: center;
	}
</style>
