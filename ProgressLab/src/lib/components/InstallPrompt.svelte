<script lang="ts">
	import { onMount } from 'svelte';

	type BeforeInstallPromptEvent = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	};

	const DISMISS_KEY = 'pl_install_dismissed';
	let prompt: BeforeInstallPromptEvent | null = $state(null);
	let visible = $state(false);

	onMount(() => {
		if (typeof window === 'undefined') return;
		if (localStorage.getItem(DISMISS_KEY)) return;

		const handler = (e: Event) => {
			e.preventDefault();
			prompt = e as BeforeInstallPromptEvent;
			visible = true;
		};
		window.addEventListener('beforeinstallprompt', handler);
		return () => window.removeEventListener('beforeinstallprompt', handler);
	});

	async function install() {
		if (!prompt) return;
		await prompt.prompt();
		const { outcome } = await prompt.userChoice;
		if (outcome === 'accepted') localStorage.setItem(DISMISS_KEY, '1');
		visible = false;
		prompt = null;
	}

	function dismiss() {
		localStorage.setItem(DISMISS_KEY, '1');
		visible = false;
	}
</script>

{#if visible && prompt}
	<div class="banner" role="dialog" aria-label="App installieren">
		<div class="info">
			<strong>App installieren</strong>
			<span class="muted">Schneller Zugriff direkt vom Home-Screen.</span>
		</div>
		<div class="actions">
			<button type="button" class="btn btn-ghost small" onclick={dismiss}>Später</button>
			<button type="button" class="btn btn-primary small" onclick={install}>Installieren</button>
		</div>
	</div>
{/if}

<style>
	.banner {
		position: fixed;
		bottom: 16px;
		left: 16px;
		right: 16px;
		max-width: 480px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
		z-index: 60;
		animation: slide-up 240ms var(--ease);
	}
	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}
	.info strong {
		font-size: 14px;
	}
	.info .muted {
		font-size: 12px;
	}
	.actions {
		display: flex;
		gap: 6px;
		flex-shrink: 0;
	}
	.btn.small {
		padding: 8px 14px;
		font-size: 13px;
	}
	@media (max-width: 640px) {
		.banner {
			bottom: calc(104px + env(safe-area-inset-bottom));
			border-radius: 22px;
		}
	}
</style>
