<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { showToast } from '$lib/toast.svelte';

	let username = $state('');
	let password = $state('');
	let confirm = $state('');
	let error = $state('');
	let loading = $state(false);

	const usernameValid = $derived(/^[a-z0-9_-]{3,32}$/.test(username));
	const passwordValid = $derived(password.length >= 6);
	const matches = $derived(password === confirm && confirm.length > 0);
	const formValid = $derived(usernameValid && passwordValid && matches);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		if (!formValid) {
			error = 'Bitte alle Felder korrekt ausfüllen';
			return;
		}
		loading = true;
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				error = body.message ?? 'Registrierung fehlgeschlagen';
				return;
			}
			showToast('Willkommen bei ProgressLab');
			await invalidateAll();
			await goto('/');
		} catch {
			error = 'Verbindung fehlgeschlagen';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Registrieren · ProgressLab</title>
</svelte:head>

<div class="auth">
	<h1>Registrieren</h1>
	<p class="muted">Lege einen Account an, um deine Trainings zu erfassen.</p>

	<form onsubmit={submit} novalidate>
		<label for="r-username" class="label">Username</label>
		<input
			id="r-username"
			class="input"
			type="text"
			autocomplete="username"
			bind:value={username}
			required
		/>
		{#if username && !usernameValid}
			<div class="hint">3–32 Zeichen, nur a–z, 0–9, _ oder -</div>
		{/if}

		<label for="r-password" class="label">Passwort</label>
		<input
			id="r-password"
			class="input"
			type="password"
			autocomplete="new-password"
			bind:value={password}
			required
		/>
		{#if password && !passwordValid}
			<div class="hint">Mindestens 6 Zeichen</div>
		{/if}

		<label for="r-confirm" class="label">Passwort bestätigen</label>
		<input
			id="r-confirm"
			class="input"
			type="password"
			autocomplete="new-password"
			bind:value={confirm}
			required
		/>
		{#if confirm && !matches}
			<div class="hint">Passwörter stimmen nicht überein</div>
		{/if}

		{#if error}
			<div class="error-banner" role="alert">{error}</div>
		{/if}

		<button class="btn" type="submit" disabled={loading || !formValid}>
			{#if loading}<Spinner />{/if}
			Account erstellen
		</button>
	</form>

	<p class="muted">Bereits registriert? <a href="/login">Hier anmelden</a></p>
</div>

<style>
	.auth {
		max-width: 380px;
		margin: 32px auto;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	form .btn {
		margin-top: 12px;
	}
	.hint {
		font-size: 11px;
		color: var(--c-danger);
		margin-top: -2px;
	}
</style>
