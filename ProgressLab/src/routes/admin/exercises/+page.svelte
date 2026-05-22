<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { showToast } from '$lib/toast.svelte';
	import type { ExerciseDTO } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const readOnlyDemoAdmin = $derived(data.readOnlyDemoAdmin);

	const emptyExerciseForm = {
		name: '',
		category: 'push' as ExerciseDTO['category'],
		muscleGroup: '',
		isBodyweight: false,
		defaultRepTarget: 5,
		defaultRpeTarget: 7
	};

	let form = $state({ ...emptyExerciseForm });
	let creating = $state(false);
	let formError = $state('');
	let editingId = $state<string | null>(null);
	let editForm = $state({ ...emptyExerciseForm });
	let editing = $state(false);
	let editError = $state('');

	async function create(e: SubmitEvent) {
		e.preventDefault();
		formError = '';
		if (readOnlyDemoAdmin) {
			formError = 'Der oeffentliche Demo-Admin ist in der Live-App read-only.';
			return;
		}
		if (!form.name.trim()) {
			formError = 'Name erforderlich';
			return;
		}
		creating = true;
		try {
			const res = await fetch('/api/exercises', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(form)
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				formError = body.message ?? 'Anlegen fehlgeschlagen';
				return;
			}
			showToast('Uebung angelegt');
			form = { ...emptyExerciseForm };
			await invalidateAll();
		} finally {
			creating = false;
		}
	}

	function startEdit(ex: ExerciseDTO) {
		editError = '';
		editingId = ex.id;
		editForm = {
			name: ex.name,
			category: ex.category,
			muscleGroup: ex.muscleGroup,
			isBodyweight: ex.isBodyweight,
			defaultRepTarget: ex.defaultRepTarget,
			defaultRpeTarget: ex.defaultRpeTarget
		};
	}

	function cancelEdit() {
		editingId = null;
		editError = '';
	}

	async function update(e: SubmitEvent) {
		e.preventDefault();
		editError = '';
		if (!editingId) return;
		if (readOnlyDemoAdmin) {
			editError = 'Der oeffentliche Demo-Admin ist in der Live-App read-only.';
			return;
		}
		if (!editForm.name.trim()) {
			editError = 'Name erforderlich';
			return;
		}
		editing = true;
		try {
			const res = await fetch(`/api/exercises/${editingId}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(editForm)
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				editError = body.message ?? 'Speichern fehlgeschlagen';
				return;
			}
			showToast('Uebung aktualisiert');
			editingId = null;
			await invalidateAll();
		} finally {
			editing = false;
		}
	}

	async function remove(ex: ExerciseDTO) {
		if (readOnlyDemoAdmin) {
			showToast('Der oeffentliche Demo-Admin ist read-only', 'error');
			return;
		}
		if (!confirm(`Uebung "${ex.name}" wirklich loeschen?`)) return;
		const res = await fetch(`/api/exercises/${ex.id}`, { method: 'DELETE' });
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			showToast(body.message ?? 'Loeschen fehlgeschlagen', 'error');
			return;
		}
		showToast('Uebung geloescht');
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Uebungen verwalten - ProgressLab</title>
</svelte:head>

<div class="head">
	<div>
		<h1>Uebungen verwalten</h1>
		<p class="muted">Admin-Bereich - Uebungen anlegen, bearbeiten oder loeschen</p>
	</div>
</div>

<section class="card">
	<h2>Neue Uebung anlegen</h2>
	{#if readOnlyDemoAdmin}
		<div class="info-banner" role="status">
			Live-Demo: Der oeffentliche Admin ist read-only. Lokal nach <code>npm run seed</code>
			kann der Admin-CRUD vollstaendig getestet werden.
		</div>
	{/if}
	<form onsubmit={create} class="form">
		<fieldset class="form-fields" disabled={readOnlyDemoAdmin || creating}>
			<div class="grid">
				<div>
					<label for="ex-name" class="label">Name</label>
					<input
						id="ex-name"
						class="input"
						bind:value={form.name}
						required
						maxlength="80"
						placeholder="z. B. Hip Thrust"
					/>
				</div>
				<div>
					<label for="ex-cat" class="label">Kategorie</label>
					<select id="ex-cat" class="select" bind:value={form.category}>
						<option value="push">Push</option>
						<option value="pull">Pull</option>
						<option value="legs">Legs</option>
					</select>
				</div>
				<div>
					<label for="ex-mg" class="label">Muskelgruppe</label>
					<input
						id="ex-mg"
						class="input"
						bind:value={form.muscleGroup}
						maxlength="80"
						placeholder="z. B. Glutes"
					/>
				</div>
				<div class="check">
					<label for="ex-bw">
						<input id="ex-bw" type="checkbox" bind:checked={form.isBodyweight} />
						Bodyweight-Uebung
					</label>
				</div>
				<div>
					<label for="ex-reps" class="label">Default Reps</label>
					<input
						id="ex-reps"
						class="input"
						type="number"
						min="1"
						max="50"
						bind:value={form.defaultRepTarget}
					/>
				</div>
				<div>
					<label for="ex-rpe" class="label">Default RPE</label>
					<input
						id="ex-rpe"
						class="input"
						type="number"
						min="1"
						max="10"
						bind:value={form.defaultRpeTarget}
					/>
				</div>
			</div>
		</fieldset>

		{#if formError}
			<div class="error-banner" role="alert">{formError}</div>
		{/if}

		<button class="btn" type="submit" disabled={creating || readOnlyDemoAdmin}>
			{#if creating}<Spinner />{/if}
			Uebung anlegen
		</button>
	</form>
</section>

{#if editingId}
	<section class="card edit-card">
		<h2>Uebung bearbeiten</h2>
		<form onsubmit={update} class="form">
			<fieldset class="form-fields" disabled={readOnlyDemoAdmin || editing}>
				<div class="grid">
					<div>
						<label for="edit-name" class="label">Name</label>
						<input
							id="edit-name"
							class="input"
							bind:value={editForm.name}
							required
							maxlength="80"
						/>
					</div>
					<div>
						<label for="edit-cat" class="label">Kategorie</label>
						<select id="edit-cat" class="select" bind:value={editForm.category}>
							<option value="push">Push</option>
							<option value="pull">Pull</option>
							<option value="legs">Legs</option>
						</select>
					</div>
					<div>
						<label for="edit-mg" class="label">Muskelgruppe</label>
						<input id="edit-mg" class="input" bind:value={editForm.muscleGroup} maxlength="80" />
					</div>
					<div class="check">
						<label for="edit-bw">
							<input id="edit-bw" type="checkbox" bind:checked={editForm.isBodyweight} />
							Bodyweight-Uebung
						</label>
					</div>
					<div>
						<label for="edit-reps" class="label">Default Reps</label>
						<input
							id="edit-reps"
							class="input"
							type="number"
							min="1"
							max="50"
							bind:value={editForm.defaultRepTarget}
						/>
					</div>
					<div>
						<label for="edit-rpe" class="label">Default RPE</label>
						<input
							id="edit-rpe"
							class="input"
							type="number"
							min="1"
							max="10"
							bind:value={editForm.defaultRpeTarget}
						/>
					</div>
				</div>
			</fieldset>

			{#if editError}
				<div class="error-banner" role="alert">{editError}</div>
			{/if}

			<div class="row-actions">
				<button class="btn btn-secondary" type="button" onclick={cancelEdit} disabled={editing}>
					Abbrechen
				</button>
				<button class="btn btn-primary" type="submit" disabled={editing || readOnlyDemoAdmin}>
					{#if editing}<Spinner />{/if}
					Aenderungen speichern
				</button>
			</div>
		</form>
	</section>
{/if}

<section style="margin-top:24px;">
	<h2>Vorhandene Uebungen ({data.exercises.length})</h2>
	<ul class="list">
		{#each data.exercises as ex (ex.id)}
			<li>
				<div>
					<div class="name">{ex.name}</div>
					<div class="muted small">
						{ex.category.toUpperCase()}
						{#if ex.muscleGroup}
							<span>- {ex.muscleGroup}</span>
						{/if}
						{#if ex.isBodyweight}
							<span>- BW</span>
						{/if}
						<span>- Default {ex.defaultRepTarget} Reps @ RPE {ex.defaultRpeTarget}</span>
					</div>
				</div>
				<div class="row-actions">
					<button
						type="button"
						class="btn btn-secondary small"
						onclick={() => startEdit(ex)}
						disabled={readOnlyDemoAdmin}
					>
						Bearbeiten
					</button>
					<button
						type="button"
						class="btn btn-danger small"
						onclick={() => remove(ex)}
						disabled={readOnlyDemoAdmin}
					>
						Loeschen
					</button>
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	.head {
		margin-bottom: 18px;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin-top: 12px;
	}
	.edit-card {
		margin-top: 18px;
	}
	.form-fields {
		border: 0;
		padding: 0;
		margin: 0;
		min-inline-size: 0;
	}
	.info-banner {
		margin-top: 12px;
		padding: 12px 14px;
		border-radius: var(--radius-md);
		border: 1px solid color-mix(in srgb, var(--c-accent) 28%, var(--c-border));
		background: color-mix(in srgb, var(--c-accent) 9%, var(--c-surface));
		color: var(--c-text);
		font-size: 13px;
		line-height: 1.5;
	}
	.info-banner code {
		font-size: 12px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}
	.check {
		display: flex;
		align-items: flex-end;
		font-size: 13px;
	}
	.check label {
		display: inline-flex;
		gap: 8px;
		align-items: center;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 8px 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
	}
	.name {
		font-weight: 700;
	}
	.small {
		font-size: 12px;
	}
	.btn.small {
		padding: 6px 10px;
		font-size: 12px;
	}
	.row-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		justify-content: flex-end;
	}
	@media (max-width: 640px) {
		.grid {
			grid-template-columns: 1fr;
		}
		.list li {
			align-items: stretch;
			flex-direction: column;
		}
		.row-actions {
			width: 100%;
		}
		.row-actions .btn {
			flex: 1;
		}
	}
</style>
