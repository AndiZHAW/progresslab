<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Chart,
		BarController,
		BarElement,
		LinearScale,
		CategoryScale,
		Tooltip,
		Legend
	} from 'chart.js';
	import { formatDateShort } from '$lib/format';

	Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

	let { weeks }: { weeks: { weekStart: string; volume: number; sessions: number }[] } = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | undefined;

	const labels = $derived(weeks.map((w) => formatDateShort(w.weekStart)));
	const volumeData = $derived(weeks.map((w) => w.volume));

	function readVar(name: string, fallback: string): string {
		if (typeof getComputedStyle === 'undefined') return fallback;
		return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
	}

	onMount(() => {
		if (!canvas) return;
		const accent = readVar('--c-accent', '#0d9488');
		const text = readVar('--c-text-muted', '#57596b');
		const grid = readVar('--c-border', '#e8e1d4');

		chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: 'Volumen (kg)',
						data: volumeData,
						backgroundColor: accent,
						borderRadius: 6,
						maxBarThickness: 32
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (ctx) => `${(ctx.parsed.y ?? 0).toLocaleString('de-CH')} kg`
						}
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						grid: { color: grid },
						ticks: { color: text, font: { size: 11 } }
					},
					x: {
						grid: { display: false },
						ticks: { color: text, font: { size: 11 } }
					}
				}
			}
		});
		return () => chart?.destroy();
	});

	$effect(() => {
		if (!chart) return;
		chart.data.labels = labels;
		chart.data.datasets[0].data = volumeData;
		chart.update('none');
	});
</script>

<div class="wrap">
	{#if weeks.length === 0}
		<div class="empty">Noch keine Daten.</div>
	{:else}
		<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
		<canvas bind:this={canvas} role="img" aria-label={`Wochenvolumen über ${weeks.length} Wochen`}
		></canvas>
		<table class="sr-only">
			<caption>Wochenvolumen (für Screenreader)</caption>
			<thead>
				<tr>
					<th scope="col">Woche ab</th>
					<th scope="col">Volumen (kg)</th>
					<th scope="col">Sessions</th>
				</tr>
			</thead>
			<tbody>
				{#each weeks as w (w.weekStart)}
					<tr>
						<td>{labels[weeks.indexOf(w)]}</td>
						<td>{w.volume}</td>
						<td>{w.sessions}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.wrap {
		position: relative;
		height: 240px;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-lg);
		padding: 14px;
	}
	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--c-text-subtle);
		font-size: 13px;
	}
</style>
