<script lang="ts">
	import RecommendationCard from '$lib/components/RecommendationCard.svelte';
	import ProgressChart from '$lib/components/ProgressChart.svelte';
	import SessionList from '$lib/components/SessionList.svelte';
	import { showToast } from '$lib/toast.svelte';
	import { formatDate } from '$lib/format';
	import type { PlannedRecommendationDTO } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function initialPlannedRecommendation() {
		return data.plannedRecommendation;
	}

	function initialWeight() {
		return data.recommendation.weight?.toString() ?? '';
	}

	function initialReps() {
		return data.recommendation.reps.toString();
	}

	function initialRpe() {
		return data.recommendation.rpeTarget.toString();
	}

	let plannedRecommendation = $state<PlannedRecommendationDTO | null>(
		initialPlannedRecommendation()
	);
	let planning = $state(false);
	let clearingPlan = $state(false);
	let manualOpen = $state(false);
	let planError = $state('');
	let manualWeight = $state<string | number>(initialWeight());
	let manualReps = $state<string | number>(initialReps());
	let manualRpe = $state<string | number>(initialRpe());

	function planPayload(source: 'coach' | 'manual') {
		return {
			exerciseId: data.exercise.id,
			weight:
				data.exercise.isBodyweight && source === 'coach'
					? null
					: source === 'manual'
						? String(manualWeight).trim()
							? Number(manualWeight)
							: null
						: data.recommendation.weight,
			reps: source === 'manual' ? Number(manualReps) : data.recommendation.reps,
			rpeTarget: source === 'manual' ? Number(manualRpe) : data.recommendation.rpeTarget,
			reason:
				source === 'manual'
					? 'Vom User fuer die naechste Session angepasst'
					: data.recommendation.reason,
			source
		};
	}

	function validateManualPlan(): string {
		const weight = String(manualWeight).trim() ? Number(manualWeight) : null;
		const reps = Number(manualReps);
		const rpe = Number(manualRpe);

		if (!data.exercise.isBodyweight && (weight === null || weight < 0 || weight > 1000)) {
			return 'Gewicht muss zwischen 0 und 1000 kg liegen.';
		}
		if (!Number.isInteger(reps) || reps < 1 || reps > 100) {
			return 'Reps muessen eine ganze Zahl zwischen 1 und 100 sein.';
		}
		if (!Number.isFinite(rpe) || rpe < 1 || rpe > 10) {
			return 'RPE-Ziel muss zwischen 1 und 10 liegen.';
		}
		return '';
	}

	async function savePlan(source: 'coach' | 'manual') {
		planError = '';
		if (source === 'manual') {
			const validationError = validateManualPlan();
			if (validationError) {
				planError = validationError;
				return;
			}
		}

		planning = true;
		try {
			const res = await fetch('/api/planned-recommendations', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(planPayload(source))
			});
			const body = await res.json().catch(() => ({}));
			if (!res.ok) {
				planError = body.message ?? 'Empfehlung konnte nicht geplant werden';
				return;
			}
			plannedRecommendation = body;
			manualOpen = false;
			showToast(source === 'manual' ? 'Plan angepasst' : 'Empfehlung geplant');
		} catch {
			planError = 'Verbindung fehlgeschlagen';
		} finally {
			planning = false;
		}
	}

	async function clearPlan() {
		planError = '';
		clearingPlan = true;
		try {
			const res = await fetch(`/api/planned-recommendations/${data.exercise.id}`, {
				method: 'DELETE'
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				planError = body.message ?? 'Plan konnte nicht entfernt werden';
				return;
			}
			plannedRecommendation = null;
			showToast('Plan entfernt', 'info');
		} catch {
			planError = 'Verbindung fehlgeschlagen';
		} finally {
			clearingPlan = false;
		}
	}
</script>

<svelte:head>
	<title>{data.exercise.name} - ProgressLab</title>
</svelte:head>

<div class="head">
	<a href="/" class="back" aria-label="Zurueck zum Dashboard">‹</a>
	<div class="title-block">
		<h1>{data.exercise.name}</h1>
		<div class="muted small">
			<span class="cat-tag">{data.exercise.category}</span>
			{#if data.exercise.muscleGroup}
				<span>· {data.exercise.muscleGroup}</span>
			{/if}
			{#if data.exercise.isBodyweight}
				<span>· Bodyweight</span>
			{/if}
			{#if data.sessions.length > 0}
				<span>· {data.sessions.length} Sessions</span>
			{/if}
		</div>
	</div>
	<div class="spacer"></div>
	<a class="btn btn-primary" href={`/sessions/new/${data.exercise.id}`}>Session loggen</a>
</div>

<RecommendationCard recommendation={data.recommendation} />

<section class="coach-explain" aria-labelledby="coach-explain-title">
	<div>
		<h2 id="coach-explain-title">Warum diese Empfehlung?</h2>
		<p>
			ProgressLab wertet die letzte Session nach Gewicht, Reps und durchschnittlicher RPE aus.
			Leichte Sätze steigern das Ziel, mittlere Belastung hält das Gewicht, sehr hohe RPE löst einen
			Deload aus.
		</p>
	</div>
	<div class="rule-grid" aria-label="Coach-Regeln">
		<span>RPE ≤ 7: steigern</span>
		<span>RPE 7-8.9: halten</span>
		<span>RPE ≥ 9: Deload</span>
	</div>
</section>

<div class="actions">
	<button class="btn btn-primary" disabled={planning} onclick={() => savePlan('coach')}>
		{plannedRecommendation?.source === 'coach' ? 'Coach-Plan erneuern' : 'Empfehlung akzeptieren'}
	</button>
	<button
		class="btn btn-secondary"
		type="button"
		onclick={() => {
			manualOpen = !manualOpen;
			planError = '';
		}}
	>
		Manuell anpassen
	</button>
	<a class="btn btn-ghost" href={`/sessions/new/${data.exercise.id}`}>Jetzt loggen</a>
</div>

{#if plannedRecommendation}
	<section class="plan-status" role="status">
		<div>
			<span class="eyebrow">Naechste Session geplant</span>
			<strong>
				{#if plannedRecommendation.weight === null}
					BW x {plannedRecommendation.reps} Reps
				{:else}
					{plannedRecommendation.weight} kg x {plannedRecommendation.reps} Reps
				{/if}
				@ RPE {plannedRecommendation.rpeTarget}
			</strong>
			<p class="muted small">
				{plannedRecommendation.source === 'manual'
					? 'Manuell angepasst. Der Logger uebernimmt diese Werte als Startpunkt.'
					: 'Coach-Empfehlung akzeptiert. Der Logger uebernimmt diese Werte als Startpunkt.'}
			</p>
		</div>
		<button
			class="btn btn-secondary small-btn"
			type="button"
			disabled={clearingPlan}
			onclick={clearPlan}
		>
			Plan entfernen
		</button>
	</section>
{/if}

{#if manualOpen}
	<section class="card manual-plan" aria-labelledby="manual-plan-title">
		<div>
			<span class="eyebrow">Kontrollierte Anpassung</span>
			<h2 id="manual-plan-title">Empfehlung feinjustieren</h2>
			<p class="muted small">
				Nur Gewicht, Reps und RPE-Ziel werden fuer den naechsten Logger gespeichert.
			</p>
		</div>
		<div class="manual-grid">
			{#if !data.exercise.isBodyweight}
				<label>
					<span class="label">Gewicht (kg)</span>
					<input
						class="input"
						type="number"
						min="0"
						max="1000"
						step="0.5"
						bind:value={manualWeight}
					/>
				</label>
			{/if}
			<label>
				<span class="label">Reps</span>
				<input class="input" type="number" min="1" max="100" step="1" bind:value={manualReps} />
			</label>
			<label>
				<span class="label">RPE-Ziel</span>
				<input class="input" type="number" min="1" max="10" step="0.5" bind:value={manualRpe} />
			</label>
		</div>
		<button
			class="btn btn-primary"
			type="button"
			disabled={planning}
			onclick={() => savePlan('manual')}
		>
			Anpassung speichern
		</button>
	</section>
{/if}

{#if planError}
	<div class="error-banner" role="alert">{planError}</div>
{/if}

{#if data.pr.topWeight || data.pr.estimated1RM}
	<section class="block">
		<h2>Persönliche Records</h2>
		<div class="pr-grid">
			{#if data.pr.topWeight}
				<div class="pr-mini">
					<div class="pr-lbl">Top-Gewicht</div>
					<div class="pr-val">{data.pr.topWeight.weight} kg x {data.pr.topWeight.reps}</div>
					<div class="pr-date">{formatDate(data.pr.topWeight.date)}</div>
				</div>
			{/if}
			{#if data.pr.estimated1RM}
				<div class="pr-mini accent">
					<div class="pr-lbl">Geschätztes 1RM</div>
					<div class="pr-val">{data.pr.estimated1RM.value} kg</div>
					<div class="pr-date">aus {data.pr.estimated1RM.weight} x {data.pr.estimated1RM.reps}</div>
				</div>
			{/if}
			{#if data.pr.topReps}
				<div class="pr-mini">
					<div class="pr-lbl">Top-Reps</div>
					<div class="pr-val">
						{data.pr.topReps.reps} x {data.exercise.isBodyweight
							? 'BW'
							: `${data.pr.topReps.weight} kg`}
					</div>
					<div class="pr-date">{formatDate(data.pr.topReps.date)}</div>
				</div>
			{/if}
			{#if data.pr.bestVolume}
				<div class="pr-mini">
					<div class="pr-lbl">Bestes Session-Volumen</div>
					<div class="pr-val">{data.pr.bestVolume.value.toLocaleString('de-CH')} kg</div>
					<div class="pr-date">{formatDate(data.pr.bestVolume.date)}</div>
				</div>
			{/if}
		</div>
	</section>
{/if}

<section class="block">
	<h2>Verlauf</h2>
	<p class="muted small">Top-Gewicht und Ø RPE pro Session</p>
	<ProgressChart sessions={data.sessions} />
</section>

<section class="block">
	<h2>Letzte Sessions</h2>
	<div class="card">
		<SessionList
			sessions={data.sessions.slice(0, 8)}
			emptyText="Noch keine Sessions fuer diese Uebung."
		/>
	</div>
</section>

<style>
	.head {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 22px;
		flex-wrap: wrap;
	}
	.back {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		font-size: 22px;
		color: var(--c-text);
		flex-shrink: 0;
	}
	.back:hover {
		background: var(--c-bg-alt);
	}
	.title-block {
		min-width: 0;
	}
	.cat-tag {
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		font-size: 11px;
		background: var(--c-bg-alt);
		padding: 2px 8px;
		border-radius: var(--radius-pill);
	}
	.small {
		font-size: 12px;
	}
	.coach-explain {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(220px, 0.55fr);
		gap: 14px;
		margin-top: 14px;
		padding: 16px;
		border: 1px solid var(--c-border);
		border-radius: var(--radius-lg);
		background: var(--c-surface);
	}
	.coach-explain h2 {
		margin: 0 0 5px;
		font-size: 15px;
	}
	.coach-explain p {
		color: var(--c-text-muted);
		font-size: 13px;
		line-height: 1.5;
	}
	.rule-grid {
		display: grid;
		gap: 6px;
	}
	.rule-grid span {
		padding: 8px 10px;
		border-radius: var(--radius-md);
		background: var(--c-bg-alt);
		font-size: 12px;
		font-weight: 700;
		color: var(--c-text-muted);
	}
	.actions {
		display: flex;
		gap: 10px;
		margin: 18px 0;
		flex-wrap: wrap;
	}
	.actions .btn {
		flex: 1;
		min-width: 170px;
	}
	.plan-status {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin: 12px 0 18px;
		padding: 14px 16px;
		border: 1px solid color-mix(in srgb, var(--c-accent) 35%, var(--c-border));
		border-radius: var(--radius-lg);
		background: var(--c-accent-soft);
	}
	.plan-status strong {
		display: block;
		margin-top: 2px;
		font-size: 18px;
	}
	.eyebrow {
		display: inline-flex;
		font-size: 10px;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--c-text-subtle);
	}
	.small-btn {
		flex-shrink: 0;
	}
	.manual-plan {
		display: grid;
		gap: 14px;
		margin-bottom: 14px;
	}
	.manual-plan h2 {
		font-size: 20px;
	}
	.manual-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 10px;
	}
	.manual-grid label {
		display: grid;
		gap: 6px;
	}
	.block {
		margin-top: 30px;
	}
	.block h2 {
		margin-bottom: 4px;
	}
	.block .muted {
		margin-bottom: 12px;
	}
	.pr-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		gap: 10px;
	}
	.pr-mini {
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.pr-mini.accent {
		background: var(--c-accent-soft);
		border: 1px solid color-mix(in srgb, var(--c-accent) 35%, transparent);
		position: relative;
		padding-left: 19px;
	}
	.pr-mini.accent::before {
		content: '';
		position: absolute;
		left: 0;
		top: 14px;
		bottom: 14px;
		width: 3px;
		border-radius: 0 2px 2px 0;
		background: var(--c-accent);
	}
	.pr-mini.accent .pr-lbl {
		color: var(--c-accent-hover);
	}
	:global([data-theme='dark']) .pr-mini.accent .pr-lbl {
		color: var(--c-accent);
	}
	.pr-mini.accent .pr-date {
		color: var(--c-text-muted);
	}
	.pr-lbl {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		color: var(--c-text-subtle);
	}
	.pr-val {
		font-size: 18px;
		font-weight: 800;
		letter-spacing: 0;
	}
	.pr-date {
		font-size: 11px;
		color: var(--c-text-subtle);
	}
	@media (max-width: 640px) {
		.head .btn {
			width: 100%;
		}
		.coach-explain,
		.manual-grid {
			grid-template-columns: 1fr;
		}
		.plan-status {
			align-items: stretch;
			flex-direction: column;
		}
		.plan-status .btn {
			width: 100%;
		}
	}
</style>
