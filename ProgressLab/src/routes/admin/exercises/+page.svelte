<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { showToast } from '$lib/toast.svelte';
	import type { ExerciseDTO } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let form = $state({
		name: '',
		category: 'push' as ExerciseDTO['category'],
		muscleGroup: '',
		isBodyweight: false,
		defaultRepTarget: 5,
		defaultRpeTarget: 7
	});
	let creating = $state(false);
	let formError = $state('');

	async function create(e: SubmitEvent) {
		e.preventDefault();
		formError = '';
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
			showToast('Übung angelegt');
			form = {
				name: '',
				category: 'push',
				muscleGroup: '',
				isBodyweight: false,
				defaultRepTarget: 5,
				defaultRpeTarget: 7
			};
			await invalidateAll();
		} finally {
			creating = false;
		}
	}

	async function remove(ex: ExerciseDTO) {
		if (!confirm(`Übung "${ex.name}" wirklich löschen?`)) return;
		const res = await fetch(`/api/exercises/${ex.id}`, { method: 'DELETE' });
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			showToast(body.message ?? 'Löschen fehlgeschlagen', 'error');
			return;
		}
		showToast('Übung gelöscht');
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Übungen verwalten · ProgressLab</title>
</svelte:head>

<div class="head">
	<div>
		<h1>Übungen verwalten</h1>
		<p class="muted">Admin-Bereich · Übungen anlegen oder löschen</p>
	</div>
</div>

<section class="card">
	<h2>Neue Übung anlegen</h2>
	<form onsubmit={create} class="form">
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
					Bodyweight-Übung
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

		{#if formError}
			<div class="error-banner" role="alert">{formError}</div>
		{/if}

		<button class="btn" type="submit" disabled={creating}>
			{#if creating}<Spinner />{/if}
			Übung anlegen
		</button>
	</form>
</section>

<section style="margin-top:24px;">
	<h2>Vorhandene Übungen ({data.exercises.length})</h2>
	<ul class="list">
		{#each data.exercises as ex (ex.id)}
			<li>
				<div>
					<div class="name">{ex.name}</div>
					<div class="muted small">
						{ex.category.toUpperCase()}
						{#if ex.muscleGroup} · {ex.muscleGroup}{/if}
						{#if ex.isBodyweight} · BW{/if}
						· Default {ex.defaultRepTarget} Reps @ RPE {ex.defaultRpeTarget}
					</div>
				</div>
				<button type="button" class="btn btn-danger small" onclick={() => remove(ex)}>
					Löschen
				</button>
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
	@media (max-width: 640px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
