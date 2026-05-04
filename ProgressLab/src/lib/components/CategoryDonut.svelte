<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Chart,
		DoughnutController,
		ArcElement,
		Tooltip,
		Legend
	} from 'chart.js';

	Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

	let { data }: { data: { push: number; pull: number; legs: number } } = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | undefined;

	function readVar(name: string, fallback: string): string {
		if (typeof getComputedStyle === 'undefined') return fallback;
		return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
	}

	const total = $derived(data.push + data.pull + data.legs);

	onMount(() => {
		if (!canvas) return;
		const accent = readVar('--c-accent', '#0d9488');
		const text = readVar('--c-text-muted', '#57596b');
		const surface = readVar('--c-surface', '#ffffff');

		chart = new Chart(canvas, {
			type: 'doughnut',
			data: {
				labels: ['Push', 'Pull', 'Legs'],
				datasets: [
					{
						data: [data.push, data.pull, data.legs],
						backgroundColor: [
							accent,
							'color-mix(in srgb, ' + accent + ' 65%, white)',
							'color-mix(in srgb, ' + accent + ' 35%, white)'
						],
						borderColor: surface,
						borderWidth: 2,
						hoverOffset: 4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '62%',
				plugins: {
					legend: {
						position: 'bottom',
						labels: { color: text, font: { size: 12 }, boxWidth: 10, padding: 14 }
					},
					tooltip: {
						callbacks: {
							label: (ctx) => {
								const value = ctx.parsed as number;
								const pct = total > 0 ? ((value / total) * 100).toFixed(0) : '0';
								return ` ${ctx.label}: ${value.toLocaleString('de-CH')} kg (${pct} %)`;
							}
						}
					}
				}
			}
		});
		return () => chart?.destroy();
	});

	$effect(() => {
		if (!chart) return;
		chart.data.datasets[0].data = [data.push, data.pull, data.legs];
		chart.update('none');
	});
</script>

<div class="wrap">
	{#if total === 0}
		<div class="empty">Noch keine Daten.</div>
	{:else}
		<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
		<canvas
			bind:this={canvas}
			role="img"
			aria-label="Volumen-Verteilung nach Push, Pull und Legs"
		></canvas>
		<table class="sr-only">
			<caption>Volumen pro Kategorie (für Screenreader)</caption>
			<thead>
				<tr>
					<th scope="col">Kategorie</th>
					<th scope="col">Volumen (kg)</th>
					<th scope="col">Anteil</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Push</td>
					<td>{data.push}</td>
					<td>{Math.round((data.push / total) * 100)} %</td>
				</tr>
				<tr>
					<td>Pull</td>
					<td>{data.pull}</td>
					<td>{Math.round((data.pull / total) * 100)} %</td>
				</tr>
				<tr>
					<td>Legs</td>
					<td>{data.legs}</td>
					<td>{Math.round((data.legs / total) * 100)} %</td>
				</tr>
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
