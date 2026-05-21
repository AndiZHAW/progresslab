<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { showToast } from '$lib/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let creating = $state(false);
	let formError = $state('');
	let name = $state('');
	let description = $state('');
	let selectedIds = $state<Set<string>>(new Set());
	let saving = $state(false);

	function toggleSelected(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedIds = next;
	}

	async function create(e: SubmitEvent) {
		e.preventDefault();
		formError = '';
		if (!name.trim() || selectedIds.size === 0) {
			formError = 'Name und mindestens eine Übung erforderlich';
			return;
		}
		saving = true;
		try {
			const res = await fetch('/api/templates', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					name,
					description,
					exerciseIds: [...selectedIds]
				})
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				formError = body.message ?? 'Anlegen fehlgeschlagen';
				return;
			}
			showToast('Routine angelegt');
			name = '';
			description = '';
			selectedIds = new Set();
			creating = false;
			await invalidateAll();
		} finally {
			saving = false;
		}
	}

	async function remove(id: string, templateName: string) {
		if (!confirm(`Routine "${templateName}" löschen?`)) return;
		const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			showToast(body.message ?? 'Löschen fehlgeschlagen', 'error');
			return;
		}
		showToast('Routine gelöscht', 'info');
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Routinen · ProgressLab</title>
</svelte:head>

<div class="head">
	<div>
		<h1>Routinen</h1>
		<p class="muted">
			Speichere deine Lieblings-Workouts als Routine. Beim Loggen kannst du sie in einem Schritt
			starten.
		</p>
	</div>
	{#if !creating}
		<button class="btn btn-primary" onclick={() => (creating = true)}>+ Neue Routine</button>
	{/if}
</div>

{#if creating}
	<section class="card create-form">
		<h2>Neue Routine</h2>
		<form onsubmit={create}>
			<div>
				<label for="t-name" class="label">Name</label>
				<input
					id="t-name"
					class="input"
					bind:value={name}
					required
					maxlength="80"
					placeholder="z. B. Push Day A"
				/>
			</div>

			<div>
				<label for="t-desc" class="label">Beschreibung (optional)</label>
				<input
					id="t-desc"
					class="input"
					bind:value={description}
					maxlength="300"
					placeholder="z. B. Brust + Schulter, mittlere Intensität"
				/>
			</div>

			<div>
				<div class="label">Übungen ({selectedIds.size} ausgewählt)</div>
				<div class="ex-grid">
					{#each data.exercises as ex (ex.id)}
						<button
							type="button"
							class="ex-chip"
							class:active={selectedIds.has(ex.id)}
							onclick={() => toggleSelected(ex.id)}
						>
							<span class="dot" aria-hidden="true">{selectedIds.has(ex.id) ? '✓' : '+'}</span>
							<span class="ex-name">{ex.name}</span>
							<span class="ex-cat">{ex.category}</span>
						</button>
					{/each}
				</div>
			</div>

			{#if formError}
				<div class="error-banner" role="alert">{formError}</div>
			{/if}

			<div class="actions">
				<button
					type="button"
					class="btn btn-secondary"
					onclick={() => {
						creating = false;
						name = '';
						description = '';
						selectedIds = new Set();
						formError = '';
					}}
				>
					Abbrechen
				</button>
				<button
					class="btn btn-primary"
					type="submit"
					disabled={saving || !name.trim() || selectedIds.size === 0}
				>
					{#if saving}<Spinner />{/if}
					Routine speichern
				</button>
			</div>
		</form>
	</section>
{/if}

{#if data.templates.length === 0 && !creating}
	<div class="card empty">
		<h2>Noch keine Routinen</h2>
		<p class="muted">
			Erstelle deine erste Routine, um wiederkehrende Workouts mit einem Klick zu starten.
		</p>
		<button
			class="btn btn-primary"
			onclick={() => (creating = true)}
			style="margin-top:8px; align-self:center;"
		>
			+ Erste Routine anlegen
		</button>
	</div>
{:else if data.templates.length > 0}
	<div class="grid">
		{#each data.templates as t (t.id)}
			<article class="t-card">
				<header>
					<h3>{t.name}</h3>
					<button
						type="button"
						class="btn btn-ghost icon-btn"
						aria-label="Routine löschen"
						onclick={() => remove(t.id, t.name)}
					>
						×
					</button>
				</header>
				{#if t.description}
					<p class="muted small">{t.description}</p>
				{/if}
				<ul class="ex-list">
					{#each t.exercises as ex, i (ex.id)}
						<li>
							<span class="num">{i + 1}</span>
							<span class="ex-list-name">{ex.name}</span>
							<span class="ex-list-cat">{ex.category}</span>
						</li>
					{/each}
				</ul>
				<footer>
					<a class="btn btn-primary small" href={`/workouts/${t.id}`}> Workout starten → </a>
				</footer>
			</article>
		{/each}
	</div>
{/if}

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 14px;
		margin-bottom: 22px;
		flex-wrap: wrap;
	}
	.create-form {
		margin-bottom: 22px;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 12px;
	}
	form > div {
		display: flex;
		flex-direction: column;
	}
	.ex-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 8px;
	}
	.ex-chip {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border-radius: var(--radius-md);
		border: 1px solid var(--c-border);
		background: var(--c-surface);
		cursor: pointer;
		text-align: left;
		font-size: 13px;
		color: var(--c-text);
		transition:
			border-color 120ms var(--ease),
			background 120ms var(--ease);
	}
	.ex-chip:hover {
		border-color: var(--c-text-muted);
	}
	.ex-chip.active {
		background: var(--c-accent-soft);
		border-color: var(--c-accent);
	}
	.ex-chip .dot {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 1px solid currentColor;
		font-size: 12px;
		flex-shrink: 0;
	}
	.ex-chip.active .dot {
		background: var(--c-accent);
		color: var(--c-accent-fg);
		border-color: var(--c-accent);
	}
	.ex-name {
		font-weight: 600;
		flex: 1;
	}
	.ex-cat {
		font-size: 10px;
		color: var(--c-text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 14px;
	}
	.t-card {
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-lg);
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-shadow: var(--shadow-xs);
	}
	.t-card header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 8px;
	}
	.t-card h3 {
		font-size: 16px;
		font-weight: 700;
	}
	.icon-btn {
		font-size: 18px;
		padding: 4px 10px;
		line-height: 1;
		color: var(--c-text-subtle);
		box-shadow: none;
	}
	.icon-btn:hover {
		color: var(--c-danger);
	}
	.ex-list {
		list-style: none;
		padding: 0;
		margin: 4px 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.ex-list li {
		display: grid;
		grid-template-columns: 22px 1fr auto;
		gap: 8px;
		align-items: center;
		padding: 6px 8px;
		border-radius: var(--radius-sm);
		background: var(--c-surface-alt);
		font-size: 13px;
	}
	.num {
		font-size: 11px;
		color: var(--c-text-subtle);
		font-weight: 700;
		text-align: center;
	}
	.ex-list-name {
		font-weight: 500;
	}
	.ex-list-cat {
		font-size: 10px;
		color: var(--c-text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.t-card footer {
		margin-top: auto;
		padding-top: 8px;
	}
	.t-card footer .btn {
		width: 100%;
	}
	.btn.small {
		padding: 8px 14px;
		font-size: 13px;
	}
	.empty {
		text-align: center;
		padding: 36px 24px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.small {
		font-size: 12px;
	}
</style>
