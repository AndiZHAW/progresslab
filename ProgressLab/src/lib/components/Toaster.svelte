<script lang="ts">
	import { toasts } from '$lib/toast.svelte';
</script>

<div class="toaster">
	{#each toasts.items as t (t.id)}
		<div
			class="toast"
			data-kind={t.kind}
			role={t.kind === 'error' ? 'alert' : 'status'}
			aria-live={t.kind === 'error' ? 'assertive' : 'polite'}
			aria-atomic="true"
		>
			<span class="dot" aria-hidden="true">
				{#if t.kind === 'success'}✓{:else if t.kind === 'error'}!{:else}i{/if}
			</span>
			<span>{t.message}</span>
		</div>
	{/each}
</div>

<style>
	.toaster {
		position: fixed;
		top: calc(78px + env(safe-area-inset-top));
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: min(420px, calc(100vw - 32px));
		align-items: center;
		z-index: 1000;
		pointer-events: none;
	}
	.toast {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: #1b7a2f;
		color: #fff;
		padding: 10px 16px;
		max-width: 100%;
		border-radius: 999px;
		font-size: 13px;
		font-weight: 600;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
		animation: slide 220ms ease;
	}
	.toast[data-kind='error'] {
		background: #b23a2f;
	}
	.toast[data-kind='info'] {
		background: #222;
	}
	.dot {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		font-size: 11px;
		font-weight: 800;
	}
	@keyframes slide {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (max-width: 760px) {
		.toaster {
			top: calc(66px + env(safe-area-inset-top));
			right: 12px;
			left: auto;
			width: min(300px, calc(100vw - 24px));
			align-items: flex-end;
			transform: none;
		}
		.toast {
			width: fit-content;
			padding: 9px 13px;
			border-radius: 999px;
		}
	}
</style>
