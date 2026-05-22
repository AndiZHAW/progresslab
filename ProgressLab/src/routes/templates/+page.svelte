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
	let editingId = $state<string | null>(null);
	let editName = $state('');
	let editDescription = $state('');
	let editSelectedIds = $state<Set<string>>(new Set());
	let editError = $state('');
	let updating = $state(false);

	function toggleSelected(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedIds = next;
	}

	function toggleEditSelected(id: string) {
		const next = new Set(editSelectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		editSelectedIds = next;
	}

	function resetCreate() {
		creating = false;
		name = '';
		description = '';
		selectedIds = new Set();
		formError = '';
	}

	function startEdit(template: PageData['templates'][number]) {
		resetCreate();
		editingId = template.id;
		editName = template.name;
		editDescription = template.description;
		editSelectedIds = new Set(template.exercises.map((ex) => ex.id));
		editError = '';
	}

	function cancelEdit() {
		editingId = null;
		editError = '';
		editSelectedIds = new Set();
	}

	async function create(e: SubmitEvent) {
		e.preventDefault();
		formError = '';
		if (!name.trim() || selectedIds.size === 0) {
			formError = 'Name und mindestens eine Uebung erforderlich';
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
			resetCreate();
			await invalidateAll();
		} finally {
			saving = false;
		}
	}

	async function update(e: SubmitEvent) {
		e.preventDefault();
		editError = '';
		if (!editingId) return;
		if (!editName.trim() || editSelectedIds.size === 0) {
			editError = 'Name und mindestens eine Uebung erforderlich';
			return;
		}
		updating = true;
		try {
			const res = await fetch(`/api/templates/${editingId}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					name: editName,
					description: editDescription,
					exerciseIds: [...editSelectedIds]
				})
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				editError = body.message ?? 'Speichern fehlgeschlagen';
				return;
			}
			showToast('Routine aktualisiert');
			cancelEdit();
			await invalidateAll();
		} finally {
			updating = false;
		}
	}

	async function remove(id: string, templateName: string) {
		if (!confirm(`Routine "${templateName}" loeschen?`)) return;
		const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			showToast(body.message ?? 'Loeschen fehlgeschlagen', 'error');
			return;
		}
		showToast('Routine geloescht', 'info');
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Routinen - ProgressLab</title>
</svelte:head>

<div class="head">
	<div>
		<span class="eyebrow">Workouts</span>
		<h1>Routinen</h1>
		<p class="muted">
			Speichere deine Lieblings-Workouts als gefuehrte Einheiten und starte sie wie in einer
			Training-App.
		</p>
	</div>
	<div class="head-actions">
		<a class="btn btn-secondary" href="/profile">Plan generieren</a>
		{#if !creating}
			<button
				class="btn btn-primary"
				onclick={() => {
					cancelEdit();
					creating = true;
				}}
			>
				+ Neue Routine
			</button>
		{/if}
	</div>
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
					placeholder="z. B. Brust + Schulter, mittlere Intensitaet"
				/>
			</div>

			<div>
				<div class="label">Uebungen ({selectedIds.size} ausgewaehlt)</div>
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
				<button type="button" class="btn btn-secondary" onclick={resetCreate}>Abbrechen</button>
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

{#if editingId}
	<section class="card create-form">
		<h2>Routine bearbeiten</h2>
		<form onsubmit={update}>
			<div>
				<label for="edit-t-name" class="label">Name</label>
				<input id="edit-t-name" class="input" bind:value={editName} required maxlength="80" />
			</div>

			<div>
				<label for="edit-t-desc" class="label">Beschreibung (optional)</label>
				<input id="edit-t-desc" class="input" bind:value={editDescription} maxlength="300" />
			</div>

			<div>
				<div class="label">Uebungen ({editSelectedIds.size} ausgewaehlt)</div>
				<div class="ex-grid">
					{#each data.exercises as ex (ex.id)}
						<button
							type="button"
							class="ex-chip"
							class:active={editSelectedIds.has(ex.id)}
							onclick={() => toggleEditSelected(ex.id)}
						>
							<span class="dot" aria-hidden="true">{editSelectedIds.has(ex.id) ? '✓' : '+'}</span>
							<span class="ex-name">{ex.name}</span>
							<span class="ex-cat">{ex.category}</span>
						</button>
					{/each}
				</div>
			</div>

			{#if editError}
				<div class="error-banner" role="alert">{editError}</div>
			{/if}

			<div class="actions">
				<button type="button" class="btn btn-secondary" onclick={cancelEdit} disabled={updating}>
					Abbrechen
				</button>
				<button
					class="btn btn-primary"
					type="submit"
					disabled={updating || !editName.trim() || editSelectedIds.size === 0}
				>
					{#if updating}<Spinner />{/if}
					Aenderungen speichern
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
				<div class="visual" aria-hidden="true">
					<span class="disc"></span>
					<span class="line line-a"></span>
					<span class="line line-b"></span>
				</div>
				<header>
					<div>
						{#if t.source === 'generated'}
							<span class="source-badge">Coach</span>
						{/if}
						<h3>{t.name}</h3>
					</div>
					<div class="card-actions">
						<button
							type="button"
							class="btn btn-ghost text-btn"
							onclick={() => startEdit(t)}
							aria-label="Routine bearbeiten"
						>
							Edit
						</button>
						<button
							type="button"
							class="btn btn-ghost icon-btn"
							aria-label="Routine loeschen"
							onclick={() => remove(t.id, t.name)}
						>
							×
						</button>
					</div>
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
					<a class="btn start-btn small" href={`/workouts/${t.id}`}>Workout starten</a>
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
		margin-bottom: 24px;
		flex-wrap: wrap;
	}
	.eyebrow {
		display: inline-flex;
		font-size: 11px;
		font-weight: 900;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--c-text-subtle);
		margin-bottom: 4px;
	}
	.head h1 {
		font-size: 42px;
		line-height: 0.98;
	}
	.head .muted {
		max-width: 48ch;
		margin-top: 8px;
	}
	.head-actions {
		display: flex;
		gap: 8px;
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
		flex-wrap: wrap;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}
	.t-card {
		position: relative;
		overflow: hidden;
		background: var(--c-surface);
		border: 1px solid color-mix(in srgb, var(--c-border) 72%, transparent);
		border-radius: 26px;
		padding: 0;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-card);
		min-height: 366px;
	}
	.visual {
		position: relative;
		height: 132px;
		background: linear-gradient(135deg, rgba(17, 19, 24, 0.98), rgba(45, 49, 55, 0.92));
		overflow: hidden;
	}
	.disc {
		position: absolute;
		right: -20px;
		bottom: -42px;
		width: 132px;
		height: 132px;
		border-radius: 50%;
		border: 22px solid rgba(255, 255, 255, 0.12);
	}
	.line {
		position: absolute;
		right: -30px;
		width: 220px;
		height: 10px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.16);
		transform: rotate(-28deg);
	}
	.line-a {
		top: 52px;
	}
	.line-b {
		top: 82px;
		background: rgba(202, 255, 65, 0.28);
	}
	.t-card header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 8px;
		padding: 18px 18px 0;
	}
	.t-card h3 {
		font-size: 26px;
		font-weight: 900;
		line-height: 0.98;
		max-width: 8ch;
	}
	.source-badge {
		display: inline-flex;
		margin-bottom: 6px;
		padding: 4px 8px;
		border-radius: 999px;
		background: var(--c-accent-soft);
		color: var(--c-accent);
		font-size: 10px;
		font-weight: 900;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.t-card > .muted {
		padding: 0 18px;
	}
	.card-actions {
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.icon-btn,
	.text-btn {
		box-shadow: none;
		color: var(--c-text-subtle);
	}
	.icon-btn {
		font-size: 18px;
		padding: 4px 10px;
		line-height: 1;
	}
	.text-btn {
		padding: 5px 9px;
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.icon-btn:hover {
		color: var(--c-danger);
	}
	.ex-list {
		list-style: none;
		padding: 0 18px;
		margin: 12px 0 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
	}
	.ex-list li {
		display: grid;
		grid-template-columns: 22px 1fr auto;
		gap: 8px;
		align-items: center;
		padding: 5px 0;
		font-size: 13px;
	}
	.num {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--c-accent);
		color: var(--c-accent-fg);
		font-size: 11px;
		font-weight: 700;
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
		padding: 16px 18px 18px;
	}
	.start-btn {
		width: 100%;
		background: var(--c-text);
		color: var(--c-bg);
		box-shadow: none;
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
	@media (max-width: 640px) {
		.actions .btn,
		.head-actions .btn {
			flex: 1 1 100%;
		}
	}
</style>
