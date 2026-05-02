<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { showToast } from '$lib/toast.svelte';
	import { theme, toggleTheme } from '$lib/theme.svelte';

	let { user }: { user: App.Locals['user'] } = $props();

	let mobileOpen = $state(false);

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
		<a class="brand" href={user ? '/' : '/login'} aria-label="ProgressLab Startseite">
			<span class="logo" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 17l4-4 4 4 4-6 6 6" />
					<circle cx="7" cy="13" r="0.6" fill="currentColor" />
					<circle cx="11" cy="17" r="0.6" fill="currentColor" />
					<circle cx="15" cy="11" r="0.6" fill="currentColor" />
					<circle cx="21" cy="17" r="0.6" fill="currentColor" />
				</svg>
			</span>
			<span class="name">ProgressLab</span>
		</a>

		{#if user}
			<button
				type="button"
				class="hamburger"
				aria-expanded={mobileOpen}
				aria-label="Menü"
				onclick={() => (mobileOpen = !mobileOpen)}
			>
				<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
					{#if mobileOpen}
						<path d="M6 6l12 12M18 6l-12 12" />
					{:else}
						<path d="M4 7h16M4 12h16M4 17h16" />
					{/if}
				</svg>
			</button>

			<nav class="links" class:open={mobileOpen} aria-label="Hauptnavigation">
				<a href="/" class:active={isActive('/')} onclick={() => (mobileOpen = false)}>Dashboard</a>
				<a href="/stats" class:active={isActive('/stats')} onclick={() => (mobileOpen = false)}>Statistik</a>
				<a href="/records" class:active={isActive('/records')} onclick={() => (mobileOpen = false)}>Records</a>
				<a href="/sessions" class:active={isActive('/sessions') && !isActive('/sessions/new')} onclick={() => (mobileOpen = false)}>Sessions</a>
				{#if user.role === 'admin'}
					<a href="/admin/exercises" class:active={isActive('/admin')} onclick={() => (mobileOpen = false)}>Übungen</a>
				{/if}
			</nav>

			<div class="user">
				<button
					type="button"
					class="theme-btn"
					onclick={toggleTheme}
					aria-label={theme.value === 'dark' ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
					title={theme.value === 'dark' ? 'Helles Design' : 'Dunkles Design'}
				>
					{#if theme.value === 'dark'}
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
							<circle cx="12" cy="12" r="4" />
							<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
						</svg>
					{/if}
				</button>

				<details class="who">
					<summary>
						<span class="avatar" aria-hidden="true">{user.username.charAt(0).toUpperCase()}</span>
						<span class="username">{user.username}</span>
						{#if user.role === 'admin'}<span class="badge">Admin</span>{/if}
					</summary>
					<div class="menu">
						<button type="button" onclick={logout}>Abmelden</button>
					</div>
				</details>
			</div>
		{:else}
			<nav class="links public">
				<button
					type="button"
					class="theme-btn"
					onclick={toggleTheme}
					aria-label="Theme wechseln"
				>
					{#if theme.value === 'dark'}
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
							<circle cx="12" cy="12" r="4" />
							<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
						</svg>
					{/if}
				</button>
				<a href="/login" class:active={isActive('/login')}>Anmelden</a>
				<a href="/register" class="btn btn-primary register-cta">Registrieren</a>
			</nav>
		{/if}
	</div>
</header>

<style>
	.nav {
		background: color-mix(in srgb, var(--c-surface) 88%, transparent);
		backdrop-filter: saturate(180%) blur(10px);
		-webkit-backdrop-filter: saturate(180%) blur(10px);
		border-bottom: 1px solid var(--c-border);
		position: sticky;
		top: 0;
		z-index: 50;
	}
	.inner {
		max-width: 1040px;
		margin: 0 auto;
		padding: 14px 20px;
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		font-weight: 700;
		flex-shrink: 0;
	}
	.logo {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--c-text);
		color: var(--c-bg);
		border-radius: var(--radius-sm);
	}
	.name {
		font-size: 16px;
		letter-spacing: -0.01em;
	}
	.hamburger {
		display: none;
		background: transparent;
		border: 1px solid var(--c-border);
		border-radius: var(--radius-sm);
		padding: 6px;
		cursor: pointer;
		color: var(--c-text);
		margin-left: auto;
	}
	.links {
		display: flex;
		gap: 2px;
		flex: 1;
		justify-content: flex-start;
		margin-left: 8px;
	}
	.links a {
		padding: 8px 14px;
		border-radius: var(--radius-pill);
		font-size: 14px;
		font-weight: 500;
		color: var(--c-text-muted);
		transition: background 120ms var(--ease), color 120ms var(--ease);
	}
	.links a:hover {
		background: var(--c-bg-alt);
		color: var(--c-text);
	}
	.links a.active {
		background: var(--c-text);
		color: var(--c-bg);
	}
	.links.public {
		flex: 1;
		justify-content: flex-end;
		gap: 8px;
		align-items: center;
	}
	.register-cta {
		padding: 8px 16px;
	}
	.user {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.theme-btn {
		width: 36px;
		height: 36px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--c-border);
		background: var(--c-surface);
		border-radius: var(--radius-pill);
		cursor: pointer;
		color: var(--c-text);
		transition: background 120ms var(--ease), border-color 120ms var(--ease);
	}
	.theme-btn:hover {
		background: var(--c-bg-alt);
		border-color: var(--c-border-strong);
	}
	.who {
		position: relative;
	}
	.who summary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 4px 10px 4px 4px;
		border-radius: var(--radius-pill);
		border: 1px solid var(--c-border);
		background: var(--c-surface);
		cursor: pointer;
		font-size: 13px;
		font-weight: 500;
		list-style: none;
		transition: border-color 120ms var(--ease);
	}
	.who summary::-webkit-details-marker {
		display: none;
	}
	.who summary:hover {
		border-color: var(--c-border-strong);
	}
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: var(--c-accent);
		color: var(--c-accent-fg);
		font-weight: 700;
		font-size: 12px;
	}
	.badge {
		background: var(--c-warning-bg);
		color: var(--c-warning);
		font-size: 10px;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: var(--radius-pill);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.menu {
		position: absolute;
		right: 0;
		top: calc(100% + 6px);
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		min-width: 140px;
		padding: 6px;
		z-index: 60;
	}
	.menu button {
		width: 100%;
		text-align: left;
		padding: 8px 10px;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		color: var(--c-text);
		font-size: 13px;
	}
	.menu button:hover {
		background: var(--c-bg-alt);
	}

	@media (max-width: 760px) {
		.hamburger {
			display: inline-flex;
			order: 3;
		}
		.links {
			display: none;
			flex-basis: 100%;
			order: 99;
			flex-direction: column;
			align-items: stretch;
			padding-top: 8px;
			margin: 0;
		}
		.links.open {
			display: flex;
		}
		.links a {
			padding: 12px 14px;
			border-radius: var(--radius-md);
		}
		.links.public {
			display: flex;
			flex-basis: auto;
			flex-direction: row;
			margin-left: auto;
			padding-top: 0;
		}
		.user {
			order: 2;
			margin-left: auto;
		}
		.username {
			display: none;
		}
	}
</style>
