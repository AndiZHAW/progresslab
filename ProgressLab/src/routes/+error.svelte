<script lang="ts">
	import { page } from '$app/state';

	const title = $derived(page.status === 404 ? 'Seite nicht gefunden' : 'Etwas ist schiefgelaufen');
	const message = $derived(
		page.status === 404
			? 'Diese Route gibt es in ProgressLab nicht.'
			: page.error?.message || 'Bitte versuche es später erneut.'
	);
</script>

<svelte:head>
	<title>{page.status} · ProgressLab</title>
</svelte:head>

<section class="error-state" aria-labelledby="error-title">
	<div class="status">{page.status}</div>
	<h1 id="error-title">{title}</h1>
	<p>{message}</p>
	<div class="actions">
		<a class="btn btn-primary" href="/">Zum Dashboard</a>
		<a class="btn btn-secondary" href="/login">Neu anmelden</a>
	</div>
</section>

<style>
	.error-state {
		min-height: min(560px, 70vh);
		display: grid;
		place-content: center;
		text-align: center;
		gap: 14px;
		padding: 56px 16px;
	}
	.status {
		margin: 0 auto;
		width: 72px;
		height: 72px;
		display: grid;
		place-items: center;
		border-radius: 24px;
		background: var(--c-ink);
		color: white;
		font-weight: 800;
		letter-spacing: 0;
		box-shadow: var(--shadow-soft);
	}
	h1 {
		margin: 0;
		font-size: clamp(28px, 4vw, 44px);
		line-height: 1.05;
	}
	p {
		margin: 0;
		color: var(--c-text-muted);
	}
	.actions {
		display: flex;
		justify-content: center;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 8px;
	}
</style>
