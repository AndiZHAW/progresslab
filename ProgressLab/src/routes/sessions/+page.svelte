<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import FilterTabs from '$lib/components/FilterTabs.svelte';
	import { formatDate, topWeight, topReps, avgRpe } from '$lib/format';
	import { showToast } from '$lib/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let category = $state('all');
	let pendingDelete = $state<string | null>(null);
	let optimisticallyRemoved = $state<Set<string>>(new Set());
	let undoSession = $state<{ id: string; name: string } | null>(null);
	let deleteTimer: ReturnType<typeof setTimeout> | null = null;

	const filtered = $derived(
		data.sessions.filter(
			(s) => !optimisticallyRemoved.has(s.id) && (category === 'all' || s.category === category)
		)
	);

	const counts = $derived({
		all: data.sessions.filter((s) => !optimisticallyRemoved.has(s.id)).length,
		push: data.sessions.filter((s) => s.category === 'push' && !optimisticallyRemoved.has(s.id))
			.length,
		pull: data.sessions.filter((s) => s.category === 'pull' && !optimisticallyRemoved.has(s.id))
			.length,
		legs: data.sessions.filter((s) => s.category === 'legs' && !optimisticallyRemoved.has(s.id))
			.length
	});

	async function commitDelete(id: string) {
		pendingDelete = id;
		try {
			const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				const next = new Set(optimisticallyRemoved);
				next.delete(id);
				optimisticallyRemoved = next;
				const body = await res.json().catch(() => ({}));
				showToast(body.message ?? 'Löschen fehlgeschlagen', 'error');
				return;
			}
			showToast('Session gelöscht', 'info');
			await invalidateAll();
		} finally {
			pendingDelete = null;
			if (undoSession?.id === id) undoSession = null;
			deleteTimer = null;
		}
	}

	function quickDelete(id: string, name: string) {
		if (undoSession) {
			showToast('Bitte erst den offenen Löschvorgang abschliessen oder rückgängig machen.', 'info');
			return;
		}
		optimisticallyRemoved = new Set([...optimisticallyRemoved, id]);
		undoSession = { id, name };
		showToast('Session entfernt. Undo ist kurz möglich.', 'info');
		deleteTimer = setTimeout(() => {
			void commitDelete(id);
		}, 5000);
	}

	function undoDelete() {
		if (!undoSession) return;
		if (deleteTimer) clearTimeout(deleteTimer);
		const next = new Set(optimisticallyRemoved);
		next.delete(undoSession.id);
		optimisticallyRemoved = next;
		undoSession = null;
		deleteTimer = null;
		showToast('Löschen rückgängig gemacht', 'info');
	}
</script>

<svelte:head>
	<title>Sessions · ProgressLab</title>
</svelte:head>

<div class="head">
	<div>
		<h1>Sessions</h1>
		<p class="muted">{counts.all} Sessions{counts.all === 100 ? ' (max. 100 angezeigt)' : ''}</p>
	</div>
	<div class="row">
		<a class="btn btn-secondary" href="/api/sessions/export" download>CSV</a>
		<a class="btn btn-primary" href="/sessions/new">+ Neue Session</a>
	</div>
</div>

<div class="controls">
	<FilterTabs
		bind:value={category}
		ariaLabel="Kategorie"
		options={[
			{ value: 'all', label: `Alle (${counts.all})` },
			{ value: 'push', label: `Push (${counts.push})` },
			{ value: 'pull', label: `Pull (${counts.pull})` },
			{ value: 'legs', label: `Legs (${counts.legs})` }
		]}
	/>
</div>

{#if undoSession}
	<div class="undo-banner" role="status">
		<span>„{undoSession.name}“ wird in wenigen Sekunden gelöscht.</span>
		<button type="button" class="btn btn-secondary small" onclick={undoDelete}>Rückgängig</button>
	</div>
{/if}

{#if filtered.length === 0}
	<div class="card empty">
		<h2>{counts.all === 0 ? 'Noch keine Sessions' : 'Keine Treffer'}</h2>
		<p class="muted">
			{#if counts.all === 0}
				Starte deine erste Session, um sie hier zu sehen.
			{:else}
				In dieser Kategorie ist noch nichts geloggt.
			{/if}
		</p>
		<a class="btn btn-primary" href="/sessions/new" style="margin-top:8px; align-self:center;">
			+ Session loggen
		</a>
	</div>
{:else}
	<ul class="list">
		{#each filtered as s (s.id)}
			<li>
				<div class="row-card">
					<a class="info" href={`/exercises/${s.exerciseId}`}>
						<div class="name">{s.exerciseName ?? 'Übung'}</div>
						<div class="muted small">
							{formatDate(s.date)} · {s.sets.length} Sätze · {topWeight(s.sets)} kg ×
							{topReps(s.sets)}
						</div>
					</a>
					<div class="rpe">RPE Ø {avgRpe(s.sets).toFixed(1)}</div>
					<div class="actions">
						<a class="btn btn-ghost small" href={`/sessions/${s.id}/edit`} aria-label="Bearbeiten">
							Bearbeiten
						</a>
						<button
							type="button"
							class="btn btn-ghost small icon-btn"
							aria-label="Löschen"
							disabled={pendingDelete === s.id || undoSession !== null}
							onclick={() => quickDelete(s.id, s.exerciseName ?? 'Session')}
							title="Schnell-Löschen"
						>
							×
						</button>
					</div>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 22px;
		flex-wrap: wrap;
	}
	.controls {
		margin-bottom: 16px;
	}
	.undo-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 14px;
		padding: 12px 14px;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--radius-md);
		background: var(--c-surface);
		box-shadow: var(--shadow-sm);
		font-size: 13px;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.row-card {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 14px;
		align-items: center;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		padding: 12px 14px;
		transition:
			border-color 120ms var(--ease),
			box-shadow 120ms var(--ease);
	}
	.row-card:hover {
		border-color: var(--c-border-strong);
		box-shadow: var(--shadow-sm);
	}
	.info {
		display: block;
		color: inherit;
	}
	.name {
		font-weight: 700;
	}
	.small {
		font-size: 12px;
	}
	.rpe {
		color: var(--c-text-muted);
		font-size: 13px;
		font-variant-numeric: tabular-nums;
	}
	.actions {
		display: flex;
		gap: 4px;
	}
	.btn.small {
		padding: 6px 10px;
		font-size: 12px;
	}
	.icon-btn {
		font-size: 18px;
		padding: 4px 10px;
		line-height: 1;
		color: var(--c-text-muted);
	}
	.icon-btn:hover {
		color: var(--c-danger);
		background: var(--c-danger-bg);
	}
	.empty {
		text-align: center;
		padding: 36px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	@media (max-width: 640px) {
		.undo-banner {
			align-items: stretch;
			flex-direction: column;
		}
		.undo-banner .btn {
			width: 100%;
		}
		.row-card {
			grid-template-columns: 1fr auto;
			grid-template-rows: auto auto;
		}
		.rpe {
			grid-row: 1;
			grid-column: 2;
		}
		.actions {
			grid-row: 2;
			grid-column: 1 / 3;
			justify-content: flex-end;
		}
	}
</style>
