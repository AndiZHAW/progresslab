<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';
	import Toaster from '$lib/components/Toaster.svelte';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>ProgressLab</title>
</svelte:head>

<Nav user={data.user} />
<Toaster />
<InstallPrompt />

<main class="container">
	{@render children()}
</main>

<footer class="foot">
	<div class="foot-inner">
		<span>© 2026 ProgressLab</span>
		<span class="dot">·</span>
		<span>ZHAW Prototyping FS 2026</span>
		<span class="dot">·</span>
		<span>Andi Kadolli</span>
	</div>
</footer>

<style>
	.foot {
		max-width: 1040px;
		margin: 16px auto 32px;
		padding: 18px 20px 0;
		font-size: 12px;
		color: var(--c-text-subtle);
		border-top: 1px solid var(--c-border);
	}
	.foot-inner {
		display: flex;
		gap: 8px;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
	}
	.dot {
		opacity: 0.5;
	}
</style>
