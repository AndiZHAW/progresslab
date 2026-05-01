<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { showToast } from '$lib/toast.svelte';

	let { user }: { user: App.Locals['user'] } = $props();

	const isActive = $derived((href: string) => {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	});

	async function logout() {
		const res = await fetch('/api/auth/logout', { method: 'POST' });
		if (res.ok) {
			showToast('Abgemeldet', 'info');
			await invalidateAll();
			await goto('/login');
		}
	}
</script>

<header class="nav">
	<div class="inner">
		<a class="brand" href={user ? '/' : '/login'}>
			<span class="logo">PL</span>
			<span class="name">ProgressLab</span>
		</a>

		{#if user}
			<nav class="links" aria-label="Hauptnavigation">
				<a href="/" class:active={isActive('/')} aria-current={isActive('/') ? 'page' : undefined}>
					Dashboard
				</a>
				<a
					href="/sessions"
					class:active={isActive('/sessions')}
					aria-current={isActive('/sessions') ? 'page' : undefined}
				>
					Sessions
				</a>
				{#if user.role === 'admin'}
					<a
						href="/admin/exercises"
						class:active={isActive('/admin')}
						aria-current={isActive('/admin') ? 'page' : undefined}
					>
						Übungen
					</a>
				{/if}
			</nav>

			<div class="user">
				<span class="who">
					{user.username}
					{#if user.role === 'admin'}<span class="badge">Admin</span>{/if}
				</span>
				<button type="button" class="btn-logout" onclick={logout}>Abmelden</button>
			</div>
		{:else}
			<nav class="links" aria-label="Hauptnavigation">
				<a href="/login" class:active={isActive('/login')}>Anmelden</a>
				<a href="/register" class:active={isActive('/register')}>Registrieren</a>
			</nav>
		{/if}
	</div>
</header>

<style>
	.nav {
		background: var(--c-surface);
		border-bottom: 1px solid var(--c-border);
		position: sticky;
		top: 0;
		z-index: 50;
	}
	.inner {
		max-width: 960px;
		margin: 0 auto;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-weight: 700;
	}
	.logo {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: var(--c-accent);
		color: var(--c-accent-fg);
		border-radius: 6px;
		font-size: 11px;
		letter-spacing: 0.06em;
	}
	.name {
		font-size: 16px;
	}
	.links {
		display: flex;
		gap: 4px;
		flex: 1;
		flex-wrap: wrap;
	}
	.links a {
		padding: 8px 12px;
		border-radius: var(--radius-pill);
		font-size: 14px;
		font-weight: 600;
		color: var(--c-text-muted);
	}
	.links a:hover {
		background: var(--c-bg);
		color: var(--c-text);
	}
	.links a.active {
		background: var(--c-accent);
		color: var(--c-accent-fg);
	}
	.user {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 13px;
	}
	.who {
		color: var(--c-text-muted);
		display: inline-flex;
		gap: 6px;
		align-items: center;
	}
	.badge {
		background: var(--c-warning-bg);
		color: var(--c-warning);
		font-size: 10px;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: var(--radius-pill);
	}
	.btn-logout {
		border: 1px solid var(--c-border);
		background: var(--c-surface);
		padding: 6px 12px;
		border-radius: var(--radius-pill);
		font-size: 12px;
		cursor: pointer;
		color: var(--c-text-muted);
	}
	.btn-logout:hover {
		border-color: var(--c-text-muted);
		color: var(--c-text);
	}
	@media (max-width: 640px) {
		.inner {
			gap: 8px;
			flex-wrap: wrap;
		}
		.links {
			order: 3;
			flex-basis: 100%;
		}
	}
</style>
