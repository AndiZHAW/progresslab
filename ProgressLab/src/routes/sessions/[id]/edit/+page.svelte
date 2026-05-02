<script lang="ts">
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';
	import SetLoggerTable from '$lib/components/SetLoggerTable.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { showToast } from '$lib/toast.svelte';
	import type { SetDTO } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let date = $state(untrack(() => data.session.date.slice(0, 10)));
	let sets = $state<SetDTO[]>(untrack(() => data.session.sets.map((s) => ({ ...s }))));
	let note = $state(untrack(() => data.session.note));
	let saving = $state(false);
	let deleting = $state(false);
	let formError = $state('');

	async function save(e: SubmitEvent) {
		e.preventDefault();
		formError = '';
		saving = true;
		try {
			const res = await fetch(`/api/sessions/${data.session.id}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					date,
					sets: sets.map((s) => ({
						weight: Number(s.weight),
						reps: Number(s.reps),
						rpe: Number(s.rpe)
					})),
					note
				})
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				formError = body.message ?? 'Speichern fehlgeschlagen';
				return;
			}
			showToast('Session aktualisiert');
			await goto('/sessions');
		} catch {
			formError = 'Verbindung fehlgeschlagen';
		} finally {
			saving = false;
		}
	}

	async function remove() {
		if (!confirm('Session wirklich löschen? Das kann nicht rückgängig gemacht werden.')) return;
		deleting = true;
		try {
			const res = await fetch(`/api/sessions/${data.session.id}`, { method: 'DELETE' });
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				showToast(body.message ?? 'Löschen fehlgeschlagen', 'error');
				return;
			}
			showToast('Session gelöscht', 'info');
			await goto('/sessions');
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Session bearbeiten · ProgressLab</title>
</svelte:head>

<div class="head">
	<a href="/sessions" class="back" aria-label="Zurück">‹</a>
	<div>
		<h1>{data.exercise.name}</h1>
		<div class="muted small">Session bearbeiten</div>
	</div>
</div>

<form onsubmit={save} novalidate>
	<div class="block">
		<label for="date" class="label">Datum</label>
		<input id="date" class="input" type="date" bind:value={date} required />
	</div>

	<div class="block">
		<div class="label">Sätze</div>
		<SetLoggerTable bind:sets isBodyweight={data.exercise.isBodyweight} />
	</div>

	<div class="block">
		<label for="note" class="label">Notiz</label>
		<textarea id="note" class="textarea" bind:value={note} rows="3" maxlength="500"></textarea>
	</div>

	{#if formError}
		<div class="error-banner" role="alert">{formError}</div>
	{/if}

	<div class="actions">
		<button class="btn btn-danger" type="button" onclick={remove} disabled={deleting || saving}>
			{#if deleting}<Spinner />{/if}
			Session löschen
		</button>
		<button class="btn btn-primary" type="submit" disabled={saving || deleting || sets.length === 0}>
			{#if saving}<Spinner />{/if}
			Änderungen speichern
		</button>
	</div>
</form>

<style>
	.head {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 22px;
	}
	.back {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		font-size: 22px;
		color: var(--c-text);
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.block {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.actions {
		display: flex;
		gap: 10px;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	.actions .btn-primary {
		flex: 1;
		min-width: 200px;
	}
	.small {
		font-size: 12px;
	}
</style>
