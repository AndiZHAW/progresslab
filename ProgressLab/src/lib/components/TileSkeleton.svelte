<div class="tile">
	<div class="head">
		<span class="skeleton title"></span>
		<span class="skeleton trend"></span>
	</div>
	<span class="skeleton meta"></span>
	<span class="skeleton spark"></span>
	<span class="skeleton rec"></span>
	<span class="skeleton why"></span>
</div>

<style>
	.tile {
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-lg);
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-height: 168px;
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.title {
		width: 60%;
		height: 16px;
	}
	.trend {
		width: 18px;
		height: 18px;
		border-radius: 50%;
	}
	.meta {
		width: 40%;
		height: 10px;
	}
	.spark {
		width: 100%;
		height: 36px;
		margin-top: 4px;
	}
	.rec {
		width: 70%;
		height: 14px;
		margin-top: 4px;
	}
	.why {
		width: 90%;
		height: 11px;
	}
</style>
