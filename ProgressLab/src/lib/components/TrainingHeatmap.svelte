<script lang="ts">
	type Day = { date: string; sessions: number };

	let { days }: { days: Day[] } = $props();

	const dayMs = 86400000;

	const grid = $derived.by(() => {
		if (days.length === 0)
			return { weeks: [] as Day[][], months: [] as { label: string; col: number }[] };

		const cellsByDate = new Map(days.map((d) => [d.date, d]));
		const first = new Date(days[0].date);
		const monday = new Date(first);
		const dow = (first.getDay() + 6) % 7;
		monday.setDate(first.getDate() - dow);

		const totalCols = Math.ceil((days.length + dow) / 7);
		const weeks: Day[][] = [];
		const months: { label: string; col: number }[] = [];
		const monthNames = [
			'Jan',
			'Feb',
			'Mär',
			'Apr',
			'Mai',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Okt',
			'Nov',
			'Dez'
		];
		let lastMonth = -1;

		for (let col = 0; col < totalCols; col++) {
			const week: Day[] = [];
			for (let row = 0; row < 7; row++) {
				const cellDate = new Date(+monday + (col * 7 + row) * dayMs);
				const key = cellDate.toISOString().slice(0, 10);
				const cell = cellsByDate.get(key);
				if (!cell) {
					week.push({ date: key, sessions: -1 });
				} else {
					week.push(cell);
				}
				if (row === 0) {
					const m = cellDate.getMonth();
					if (m !== lastMonth) {
						months.push({ label: monthNames[m], col });
						lastMonth = m;
					}
				}
			}
			weeks.push(week);
		}
		return { weeks, months };
	});

	function levelClass(sessions: number): string {
		if (sessions < 0) return 'l-empty';
		if (sessions === 0) return 'l-0';
		if (sessions === 1) return 'l-1';
		if (sessions === 2) return 'l-2';
		if (sessions === 3) return 'l-3';
		return 'l-4';
	}

	function formatTooltip(d: Day): string {
		if (d.sessions < 0) return '';
		const date = new Date(d.date).toLocaleDateString('de-CH', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
		if (d.sessions === 0) return `${date} – keine Session`;
		if (d.sessions === 1) return `${date} – 1 Session`;
		return `${date} – ${d.sessions} Sessions`;
	}

	const totalDays = $derived(days.filter((d) => d.sessions > 0).length);
</script>

<div
	class="wrap"
	role="figure"
	aria-label={`Heatmap mit ${totalDays} Trainingstagen in den letzten 12 Monaten`}
>
	<div class="head">
		<span class="muted small">{totalDays} Trainingstage in den letzten 12 Monaten</span>
		<div class="legend" aria-hidden="true">
			<span class="lbl">Weniger</span>
			<span class="cell l-0"></span>
			<span class="cell l-1"></span>
			<span class="cell l-2"></span>
			<span class="cell l-3"></span>
			<span class="cell l-4"></span>
			<span class="lbl">Mehr</span>
		</div>
	</div>

	<div class="scroll">
		<div class="grid-wrap">
			<div class="months" style:grid-template-columns={`repeat(${grid.weeks.length}, 14px)`}>
				{#each grid.months as m (m.col)}
					<span class="month" style:grid-column-start={m.col + 1}>{m.label}</span>
				{/each}
			</div>
			<div class="grid">
				<div class="dows" aria-hidden="true">
					<span></span>
					<span>Mo</span>
					<span></span>
					<span>Mi</span>
					<span></span>
					<span>Fr</span>
					<span></span>
				</div>
				<div class="weeks" style:grid-template-columns={`repeat(${grid.weeks.length}, 14px)`}>
					{#each grid.weeks as week, ci (ci)}
						<div class="week">
							{#each week as cell (cell.date)}
								{#if cell.sessions < 0}
									<span class="cell l-empty" aria-hidden="true"></span>
								{:else}
									<span
										class="cell {levelClass(cell.sessions)}"
										title={formatTooltip(cell)}
										role="img"
										aria-label={formatTooltip(cell)}
									></span>
								{/if}
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.wrap {
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-lg);
		padding: 16px;
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		flex-wrap: wrap;
		gap: 10px;
	}
	.legend {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.legend .lbl {
		font-size: 11px;
		color: var(--c-text-subtle);
	}
	.legend .cell {
		width: 12px;
		height: 12px;
	}
	.small {
		font-size: 12px;
	}
	.scroll {
		overflow-x: auto;
	}
	.grid-wrap {
		display: inline-flex;
		flex-direction: column;
		gap: 4px;
		min-width: 100%;
	}
	.months {
		display: grid;
		gap: 2px;
		padding-left: 28px;
		font-size: 10px;
		color: var(--c-text-subtle);
		height: 14px;
	}
	.month {
		grid-row: 1;
	}
	.grid {
		display: flex;
		gap: 4px;
	}
	.dows {
		display: grid;
		grid-template-rows: repeat(7, 14px);
		gap: 2px;
		font-size: 9px;
		color: var(--c-text-subtle);
		text-align: right;
		min-width: 24px;
	}
	.dows span {
		line-height: 14px;
	}
	.weeks {
		display: grid;
		gap: 2px;
	}
	.week {
		display: grid;
		grid-template-rows: repeat(7, 14px);
		gap: 2px;
	}
	.cell {
		width: 14px;
		height: 14px;
		border-radius: 3px;
		background: var(--c-bg-alt);
		transition: transform 80ms var(--ease);
	}
	.cell:hover {
		transform: scale(1.25);
	}
	.cell.l-empty {
		background: transparent;
		pointer-events: none;
	}
	.cell.l-0 {
		background: var(--c-bg-alt);
	}
	.cell.l-1 {
		background: color-mix(in srgb, var(--c-accent) 30%, var(--c-bg-alt));
	}
	.cell.l-2 {
		background: color-mix(in srgb, var(--c-accent) 55%, var(--c-bg-alt));
	}
	.cell.l-3 {
		background: color-mix(in srgb, var(--c-accent) 80%, var(--c-bg-alt));
	}
	.cell.l-4 {
		background: var(--c-accent);
	}
</style>
