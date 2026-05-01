<script lang="ts">
	import { toasts } from '$lib/toast.svelte';
</script>

<div class="toaster" aria-live="polite" aria-atomic="true">
	{#each toasts.items as t (t.id)}
		<div class="toast" data-kind={t.kind}>
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
		top: 16px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		gap: 8px;
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
		border-radius: 10px;
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
</style>
