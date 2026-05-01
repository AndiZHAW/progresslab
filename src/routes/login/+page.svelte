<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { showToast } from '$lib/toast.svelte';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		loading = true;
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				error = body.message ?? 'Anmeldung fehlgeschlagen';
				return;
			}
			showToast('Willkommen zurück');
			await invalidateAll();
			await goto('/');
		} catch {
			error = 'Verbindung fehlgeschlagen';
		} finally {
			loading = false;
		}
	}

	function fill(role: 'user' | 'admin') {
		username = role === 'user' ? 'demo' : 'admin';
		password = role === 'user' ? 'demo1234' : 'admin1234';
	}
</script>

<svelte:head>
	<title>Anmelden · ProgressLab</title>
</svelte:head>

<div class="auth">
	<h1>Anmelden</h1>
	<p class="muted">Melde dich an, um deine Übungen und Sessions zu sehen.</p>

	<form onsubmit={submit} novalidate>
		<label for="username" class="label">Username</label>
		<input
			id="username"
			class="input"
			type="text"
			autocomplete="username"
			bind:value={username}
			required
			minlength="3"
			maxlength="32"
		/>

		<label for="password" class="label">Passwort</label>
		<input
			id="password"
			class="input"
			type="password"
			autocomplete="current-password"
			bind:value={password}
			required
			minlength="6"
		/>

		{#if error}
			<div class="error-banner" role="alert">{error}</div>
		{/if}

		<button class="btn" type="submit" disabled={loading || !username || !password}>
			{#if loading}<Spinner />{/if}
			Anmelden
		</button>
	</form>

	<div class="demo">
		<div class="muted">Demo-Accounts (für Bewertung):</div>
		<div class="row">
			<button type="button" class="btn-secondary btn small" onclick={() => fill('user')}>
				demo / demo1234
			</button>
			<button type="button" class="btn-secondary btn small" onclick={() => fill('admin')}>
				admin / admin1234
			</button>
		</div>
	</div>

	<p class="muted">Noch kein Account? <a href="/register">Hier registrieren</a></p>
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
	.demo {
		border-top: 1px solid var(--c-border);
		padding-top: 14px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.btn.small {
		padding: 8px 12px;
		font-size: 12px;
		font-weight: 600;
	}
</style>
