<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let selectedName = $state('');
	let code = $state('');
	let submitting = $state(false);

	const activeName = $derived(selectedName || form?.name || '');
	const revealed = $derived(Boolean(form?.giftee));
	const announcement = $derived(
		form?.giftee
			? `You're getting a gift for ${form.giftee}.`
			: form?.error
				? form.error
				: ''
	);
</script>

<svelte:head>
	<title>Bunot2x 2026</title>
	<meta name="description" content="Bunot2x gift exchange — pick your name, enter your code, and open your gift tag." />
	<meta name="theme-color" content="#1F3B2D" />
</svelte:head>

<a class="skip" href="#gift-tag">Skip to gift tag</a>

<main class="page">
	<header class="intro">
		<p class="kicker">Squad Party</p>
		<h1>Bunot2x 2026</h1>
		<p class="lede">Pick your name, enter your code, and open your gift tag.</p>
	</header>

	<section class="stage info-stage" aria-label="Party details">
		<div class="twine" aria-hidden="true"></div>
		<div class="tag-scene">
			<div class="info-tag">
				<span class="hole" aria-hidden="true"></span>
				<dl class="party-details">
					<div>
						<dt>Location</dt>
						<dd>&nbsp;</dd>
					</div>
					<div>
						<dt>Time</dt>
						<dd>&nbsp;</dd>
					</div>
					<div>
						<dt>Theme</dt>
						<dd>&nbsp;</dd>
					</div>
				</dl>
			</div>
		</div>
	</section>

	<div class="stage" class:revealed id="gift-tag">
		<div class="twine" aria-hidden="true"></div>
		<div class="tag-scene">
			<div class="tag" class:flipped={revealed}>
				<div class="face front">
					<span class="hole" aria-hidden="true"></span>

					{#if form?.error}
						<p class="error" role="alert">{form.error}</p>
					{/if}

					<form
						method="POST"
						action="?/reveal"
						class="form"
						use:enhance={() => {
							submitting = true;
							return async ({ result, update }) => {
								await update();
								submitting = false;
								if (result.type === 'failure') code = '';
							};
						}}
					>
						<fieldset class="names" disabled={submitting || revealed}>
							<legend>Who are you?</legend>
							<div class="pills" role="radiogroup" aria-label="Your name">
								{#each data.names as name (name)}
									<label class="pill">
										<input
											type="radio"
											name="name"
											value={name}
											checked={activeName === name}
											required
											onchange={() => {
												selectedName = name;
											}}
										/>
										<span>{name}</span>
									</label>
								{/each}
							</div>
						</fieldset>

						<div class="field">
							<label for="code">Your code</label>
							<input
								id="code"
								name="code"
								type="text"
								inputmode="numeric"
								autocomplete="off"
								autocapitalize="off"
								spellcheck="false"
								placeholder="e.g. 4821…"
								maxlength="12"
								required
								disabled={submitting || revealed}
								bind:value={code}
							/>
						</div>

						<button type="submit" class="cta" disabled={submitting || revealed || !activeName}>
							{submitting ? 'Opening…' : 'Open my tag'}
						</button>
					</form>
				</div>

				<div class="face back" aria-live="polite">
					<span class="hole" aria-hidden="true"></span>
					<span class="seal" aria-hidden="true"></span>
					{#if form?.giftee}
						<p class="back-label">You're getting a gift for</p>
						<p class="giftee">{form.giftee}</p>
						<p class="secret-note">Keep it secret. Close this page when you're done.</p>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<p class="sr-only" aria-live="polite">{announcement}</p>
</main>

<style>
	.skip {
		position: absolute;
		left: var(--space-4);
		top: var(--space-4);
		z-index: 10;
		padding: var(--space-2) var(--space-3);
		border-radius: 8px;
		background: var(--frost);
		color: var(--pine);
		font-weight: 600;
		text-decoration: none;
		transform: translateY(-200%);
	}

	.skip:focus-visible {
		transform: translateY(0);
	}

	.page {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-6);
		width: min(100%, 26.5rem);
		margin: 0 auto;
		padding: max(var(--space-6), env(safe-area-inset-top))
			max(var(--space-4), env(safe-area-inset-right))
			max(var(--space-7), env(safe-area-inset-bottom))
			max(var(--space-4), env(safe-area-inset-left));
		min-height: 100dvh;
	}

	.intro {
		text-align: center;
		max-width: 22rem;
	}

	.kicker {
		margin: 0 0 var(--space-2);
		font-size: var(--step--1);
		color: color-mix(in srgb, var(--frost) 72%, var(--pine));
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--step-3);
		font-weight: 550;
		font-variation-settings: 'SOFT' 50, 'WONK' 1;
		line-height: 1.15;
		letter-spacing: -0.02em;
		color: var(--frost);
		text-wrap: balance;
	}

	.lede {
		margin: var(--space-3) 0 0;
		color: color-mix(in srgb, var(--frost) 78%, var(--pine));
		font-size: var(--step-0);
	}

	.stage {
		width: 100%;
		perspective: 1200px;
	}

	.info-stage {
		perspective: none;
	}

	.twine {
		width: 2px;
		height: 2.25rem;
		margin: 0 auto;
		background: linear-gradient(to bottom, transparent, var(--twine) 20%, var(--twine));
		border-radius: 1px;
	}

	.tag-scene {
		position: relative;
	}

	.info-tag {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-height: 12rem;
		padding: var(--space-6) var(--space-5) var(--space-5);
		border-radius: var(--radius-tag);
		background:
			linear-gradient(160deg, color-mix(in srgb, var(--kraft) 88%, white) 0%, var(--kraft) 45%, var(--kraft-deep) 100%);
		color: var(--ink);
		box-shadow:
			0 18px 36px var(--tag-shadow),
			inset 0 1px 0 rgba(255, 255, 255, 0.22);
	}

	.info-tag::before {
		content: '';
		position: absolute;
		inset: 10px;
		border: 1px dashed color-mix(in srgb, var(--ink) 18%, transparent);
		border-radius: 10px;
		pointer-events: none;
	}

	.party-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin: var(--space-4) 0 0;
		padding: 0;
	}

	.party-details > div {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.party-details dt {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--step-0);
		font-weight: 550;
		font-variation-settings: 'SOFT' 40, 'WONK' 1;
	}

	.party-details dt::after {
		content: ':';
	}

	.party-details dd {
		margin: 0;
		min-height: 1.35em;
		border-bottom: 1px solid color-mix(in srgb, var(--ink) 18%, transparent);
		font-size: var(--step-0);
		line-height: 1.35;
	}

	.tag {
		position: relative;
		display: grid;
		min-height: 24rem;
		transform-style: preserve-3d;
		transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.tag.flipped {
		transform: rotateY(180deg);
	}

	.face {
		grid-area: 1 / 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-6) var(--space-5) var(--space-5);
		border-radius: var(--radius-tag);
		background:
			linear-gradient(160deg, color-mix(in srgb, var(--kraft) 88%, white) 0%, var(--kraft) 45%, var(--kraft-deep) 100%);
		color: var(--ink);
		box-shadow:
			0 18px 36px var(--tag-shadow),
			inset 0 1px 0 rgba(255, 255, 255, 0.22);
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
	}

	.front {
		position: relative;
		z-index: 1;
		pointer-events: auto;
	}

	.back {
		position: absolute;
		inset: 0;
		z-index: 0;
		/* Mobile Safari still hit-tests backface-hidden faces; disable until flipped. */
		pointer-events: none;
	}

	.tag.flipped .front {
		pointer-events: none;
	}

	.tag.flipped .back {
		pointer-events: auto;
	}

	.face::before {
		content: '';
		position: absolute;
		inset: 10px;
		border: 1px dashed color-mix(in srgb, var(--ink) 18%, transparent);
		border-radius: 10px;
		pointer-events: none;
	}

	.face.back {
		transform: rotateY(180deg);
		align-items: center;
		justify-content: center;
		text-align: center;
		padding-top: var(--space-7);
	}

	.hole {
		position: absolute;
		top: 0.85rem;
		left: 50%;
		width: 1.1rem;
		height: 1.1rem;
		transform: translateX(-50%);
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #3a5a48, var(--pine) 70%);
		box-shadow:
			inset 0 1px 2px rgba(0, 0, 0, 0.35),
			0 0 0 3px color-mix(in srgb, var(--kraft-deep) 80%, var(--ink));
		z-index: 2;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		margin-top: var(--space-3);
	}

	.names {
		margin: 0;
		padding: 0;
		border: 0;
		min-inline-size: 0;
	}

	.names legend {
		padding: 0;
		margin-bottom: var(--space-3);
		font-family: var(--font-display);
		font-size: var(--step-1);
		font-weight: 550;
		font-variation-settings: 'SOFT' 40, 'WONK' 1;
	}

	.pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.pill {
		position: relative;
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		padding: 0.55rem 0.95rem;
		border-radius: var(--radius-pill);
		border: 1.5px solid color-mix(in srgb, var(--ink) 22%, transparent);
		background: color-mix(in srgb, var(--kraft) 70%, white);
		color: var(--ink);
		cursor: pointer;
		transition: background 0.15s ease, border-color 0.15s ease;
	}

	.pill:hover {
		border-color: color-mix(in srgb, var(--ink) 45%, transparent);
	}

	.pill:has(input:checked) {
		background: var(--ink);
		border-color: var(--ink);
		color: var(--kraft);
	}

	.pill:has(input:focus-visible) {
		box-shadow: var(--focus);
	}

	.pill input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0.001;
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		border: 0;
		background: transparent;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field label {
		font-size: var(--step-0);
		font-weight: 600;
	}

	.field input {
		min-height: 48px;
		padding: 0.7rem 0.9rem;
		border: 1.5px solid color-mix(in srgb, var(--ink) 25%, transparent);
		border-radius: 10px;
		background: color-mix(in srgb, var(--kraft) 55%, white);
		color: var(--ink);
	}

	.field input::placeholder {
		color: color-mix(in srgb, var(--ink) 45%, transparent);
	}

	.field input:disabled,
	.cta:disabled,
	.names:disabled .pill {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.cta {
		min-height: 48px;
		padding: 0.8rem 1.1rem;
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--ink);
		color: var(--kraft);
		font-weight: 700;
		letter-spacing: 0.01em;
	}

	.cta:hover:not(:disabled) {
		background: color-mix(in srgb, var(--ink) 88%, black);
	}

	.error {
		margin: var(--space-4) 0 0;
		padding: var(--space-3);
		border-radius: 10px;
		background: color-mix(in srgb, var(--berry) 14%, var(--kraft));
		color: var(--berry);
		font-size: var(--step--1);
		font-weight: 600;
		line-height: 1.4;
	}

	.seal {
		position: absolute;
		top: 2.4rem;
		right: 1.4rem;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 50%;
		background:
			radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--berry) 70%, white), var(--berry) 55%, #6f1c18);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
	}

	.back-label {
		margin: 0;
		font-size: var(--step-0);
		color: color-mix(in srgb, var(--ink) 78%, transparent);
	}

	.giftee {
		margin: var(--space-2) 0 0;
		max-width: 100%;
		font-family: var(--font-display);
		font-size: clamp(2rem, 8vw, var(--step-4));
		font-weight: 600;
		font-variation-settings: 'SOFT' 60, 'WONK' 1;
		line-height: 1.1;
		letter-spacing: -0.02em;
		color: var(--ink);
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	.secret-note {
		margin: var(--space-5) 0 0;
		max-width: 16rem;
		font-size: var(--step--1);
		line-height: 1.45;
		color: color-mix(in srgb, var(--ink) 70%, transparent);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.tag {
			transition: none;
		}

		.tag.flipped {
			transform: none;
		}

		.tag .front {
			opacity: 1;
			pointer-events: auto;
		}

		.tag.flipped .front {
			opacity: 0;
			pointer-events: none;
		}

		.tag .back {
			opacity: 0;
			transform: none;
			pointer-events: none;
		}

		.tag.flipped .back {
			opacity: 1;
			pointer-events: auto;
		}
	}
</style>
