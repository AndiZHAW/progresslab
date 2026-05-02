<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';
	import Toaster from '$lib/components/Toaster.svelte';
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

<main class="container">
	{@render children()}
</main>

<footer class="foot">
	<div>ProgressLab · ZHAW Prototyping FS 2026 · Andi Kadolli</div>
</footer>

<style>
	.foot {
		max-width: 960px;
		margin: 24px auto 32px;
		padding: 16px;
		font-size: 12px;
		color: var(--c-text-subtle);
		text-align: center;
		border-top: 1px solid var(--c-border);
	}
</style>
