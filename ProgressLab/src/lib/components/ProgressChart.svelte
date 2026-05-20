<script lang="ts">
	import { onMount } from 'svelte';
	import type { SessionDTO } from '$lib/types';
	import { topWeight, avgRpe, formatDateShort } from '$lib/format';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Tooltip,
		Legend,
		Filler
	} from 'chart.js';

	Chart.register(
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Tooltip,
		Legend,
		Filler
	);

	let { sessions }: { sessions: SessionDTO[] } = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | undefined;

	const sorted = $derived([...sessions].sort((a, b) => +new Date(a.date) - +new Date(b.date)));
	const labels = $derived(sorted.map((s) => formatDateShort(s.date)));
	const weights = $derived(sorted.map((s) => topWeight(s.sets)));
	const rpes = $derived(sorted.map((s) => +avgRpe(s.sets).toFixed(1)));

	onMount(() => {
		if (!canvas) return;
		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Top-Gewicht (kg)',
						data: weights,
						borderColor: '#111',
						backgroundColor: 'rgba(17,17,17,0.06)',
						fill: true,
						tension: 0.3,
						pointRadius: 3,
						yAxisID: 'y'
					},
					{
						label: 'Ø RPE',
						data: rpes,
						borderColor: '#b23a2f',
						backgroundColor: 'transparent',
						pointRadius: 3,
						pointStyle: 'circle',
						pointBackgroundColor: '#fff',
						pointBorderColor: '#b23a2f',
						pointBorderWidth: 1.5,
						borderDash: [4, 3],
						tension: 0.3,
						yAxisID: 'y1'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				plugins: {
					legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
					tooltip: { mode: 'index', intersect: false }
				},
				scales: {
					y: {
						type: 'linear',
						position: 'left',
						title: { display: true, text: 'Gewicht (kg)', font: { size: 10 } },
						grid: { color: '#eee' }
					},
					y1: {
						type: 'linear',
						position: 'right',
						min: 1,
						max: 10,
						title: { display: true, text: 'RPE', font: { size: 10 } },
						grid: { drawOnChartArea: false }
					}
				}
			}
		});
		return () => chart?.destroy();
	});

	$effect(() => {
		if (!chart) return;
		chart.data.labels = labels;
		chart.data.datasets[0].data = weights;
		chart.data.datasets[1].data = rpes;
		chart.update('none');
	});
</script>

<div class="wrap">
	{#if sessions.length === 0}
		<div class="empty">Noch keine Sessions erfasst.</div>
	{:else}
		<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
		<canvas
			bind:this={canvas}
			role="img"
			aria-label={`Verlauf von Top-Gewicht und Ø RPE über ${sessions.length} Sessions`}
		></canvas>
		<table class="sr-only">
			<caption>Verlaufsdaten als Tabelle (für Screenreader)</caption>
			<thead>
				<tr>
					<th scope="col">Datum</th>
					<th scope="col">Top-Gewicht (kg)</th>
					<th scope="col">Ø RPE</th>
				</tr>
			</thead>
			<tbody>
				{#each sorted as s, i (s.id ?? i)}
					<tr>
						<td>{labels[i]}</td>
						<td>{weights[i]}</td>
						<td>{rpes[i]}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.wrap {
		position: relative;
		height: 220px;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		padding: 10px;
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
