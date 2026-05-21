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

<div class="auth-layout">
	<aside class="pitch">
		<div class="pitch-eyebrow">RPE-basiertes Training</div>
		<h1 class="pitch-title">Schluss mit Raten,<br />wann du steigern sollst.</h1>
		<p class="pitch-text">
			ProgressLab beobachtet, wie schwer sich deine Sätze anfühlen, und schlägt dir nach jedem
			Training konkrete Werte für die nächste Session vor.
		</p>
		<ul class="bullets">
			<li>+2.5 kg automatisch, wenn du Reserve hast</li>
			<li>Deload erkennen, bevor du übertrainierst</li>
			<li>1RM-Schätzung &amp; persönliche Records pro Übung</li>
		</ul>
	</aside>

	<div class="auth-card">
		<h2>Anmelden</h2>
		<p class="muted">Willkommen zurück bei ProgressLab.</p>

		<form onsubmit={submit} novalidate>
			<div>
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
			</div>

			<div>
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
			</div>

			{#if error}
				<div class="error-banner" role="alert">{error}</div>
			{/if}

			<button class="btn btn-primary" type="submit" disabled={loading || !username || !password}>
				{#if loading}<Spinner />{/if}
				Anmelden
			</button>
		</form>

		<div class="demo">
			<div class="demo-lbl">Demo-Accounts</div>
			<div class="demo-row">
				<button type="button" class="btn btn-ghost demo-btn" onclick={() => fill('user')}>
					<strong>demo</strong>
					<span class="muted">demo1234</span>
				</button>
				<button type="button" class="btn btn-ghost demo-btn" onclick={() => fill('admin')}>
					<strong>admin</strong>
					<span class="muted">admin1234</span>
				</button>
			</div>
		</div>

		<p class="muted center">
			Noch kein Account? <a class="link" href="/register">Hier registrieren</a>
		</p>
	</div>
</div>

<style>
	.auth-layout {
		display: grid;
		grid-template-columns: 1fr 420px;
		gap: 48px;
		align-items: center;
		min-height: calc(100vh - 200px);
	}
	.pitch {
		padding: 24px 0;
	}
	.pitch-eyebrow {
		display: inline-block;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--c-accent);
		background: var(--c-accent-soft);
		padding: 4px 10px;
		border-radius: var(--radius-pill);
		margin-bottom: 18px;
	}
	.pitch-title {
		font-size: 44px;
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.05;
		margin-bottom: 18px;
	}
	.pitch-text {
		font-size: 16px;
		color: var(--c-text-muted);
		max-width: 44ch;
		margin-bottom: 22px;
	}
	.bullets {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.bullets li {
		font-size: 14px;
		color: var(--c-text);
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.bullets li::before {
		content: '';
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--c-accent-soft);
		color: var(--c-accent);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12l5 5L20 7'/%3E%3C/svg%3E")
			center/12px no-repeat;
		-webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12l5 5L20 7'/%3E%3C/svg%3E")
			center/12px no-repeat;
		background-color: var(--c-accent);
	}
	.auth-card {
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-xl);
		padding: 28px;
		box-shadow: var(--shadow-lg);
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	form .btn {
		margin-top: 4px;
	}
	.demo {
		border-top: 1px solid var(--c-border);
		padding-top: 14px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.demo-lbl {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--c-text-subtle);
	}
	.demo-row {
		display: flex;
		gap: 8px;
	}
	.demo-btn {
		flex: 1;
		padding: 10px 12px;
		font-size: 12px;
		display: flex;
		gap: 6px;
		justify-content: center;
		border: 1px dashed var(--c-border-strong);
	}
	.demo-btn strong {
		font-weight: 700;
	}
	.center {
		text-align: center;
		font-size: 13px;
	}
	.link {
		color: var(--c-accent);
		font-weight: 600;
	}
	.link:hover {
		text-decoration: underline;
	}
	@media (max-width: 880px) {
		.auth-layout {
			grid-template-columns: 1fr;
			gap: 24px;
			min-height: 0;
		}
		.pitch {
			padding: 0;
		}
		.pitch-title {
			font-size: 30px;
		}
		.pitch-text {
			font-size: 14px;
		}
	}
</style>
