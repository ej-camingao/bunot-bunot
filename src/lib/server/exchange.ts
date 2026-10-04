import { EXCHANGE_SEED, PARTICIPANTS } from '$app/env/private';

export type Participant = {
	name: string;
	code: string;
};

/** Mulberry32 — small seeded PRNG for deterministic shuffles. */
function mulberry32(seed: number): () => number {
	let t = seed >>> 0;
	return () => {
		t += 0x6d2b79f5;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}

function hashSeed(seed: string): number {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

function shuffleInPlace<T>(items: T[], random: () => number): void {
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[items[i], items[j]] = [items[j], items[i]];
	}
}

/**
 * Build a single-cycle assignment: each person gives to the next in a
 * seeded shuffle; the last gives to the first. Guarantees no self-gifts
 * when there are 2+ participants, and everyone gives/receives exactly once.
 */
export function buildAssignments(names: string[], seed: string): Map<string, string> {
	if (names.length < 2) {
		throw new Error('Need at least two participants for an exchange.');
	}

	const order = [...names];
	const random = mulberry32(hashSeed(seed));
	shuffleInPlace(order, random);

	const assignments = new Map<string, string>();
	for (let i = 0; i < order.length; i++) {
		const giver = order[i];
		const giftee = order[(i + 1) % order.length];
		assignments.set(giver, giftee);
	}
	return assignments;
}

export function parseParticipants(raw: string): Participant[] {
	const trimmed = raw.trim();
	if (!trimmed) {
		throw new Error('PARTICIPANTS env var is empty.');
	}

	const seen = new Set<string>();
	const participants: Participant[] = [];

	for (const entry of trimmed.split(',')) {
		const piece = entry.trim();
		if (!piece) continue;

		const colon = piece.lastIndexOf(':');
		if (colon <= 0 || colon === piece.length - 1) {
			throw new Error(`Invalid PARTICIPANTS entry "${piece}". Use Name:code.`);
		}

		const name = piece.slice(0, colon).trim();
		const code = piece.slice(colon + 1).trim();

		if (!name || !code) {
			throw new Error(`Invalid PARTICIPANTS entry "${piece}". Use Name:code.`);
		}

		const key = name.toLowerCase();
		if (seen.has(key)) {
			throw new Error(`Duplicate participant name: ${name}`);
		}
		seen.add(key);
		participants.push({ name, code });
	}

	if (participants.length < 2) {
		throw new Error('Need at least two participants in PARTICIPANTS.');
	}

	return participants;
}

function getConfig() {
	const participants = parseParticipants(PARTICIPANTS);
	const seed = EXCHANGE_SEED?.trim();
	if (!seed) {
		throw new Error('EXCHANGE_SEED env var is empty.');
	}
	return { participants, seed };
}

export function getParticipantNames(): string[] {
	return getConfig().participants.map((p) => p.name);
}

export function findParticipant(name: string): Participant | undefined {
	const needle = name.trim().toLowerCase();
	return getConfig().participants.find((p) => p.name.toLowerCase() === needle);
}

export function verifyCode(name: string, code: string): boolean {
	const participant = findParticipant(name);
	if (!participant) return false;
	return participant.code === code.trim();
}

export function getGiftee(name: string): string | undefined {
	const { participants, seed } = getConfig();
	const participant = findParticipant(name);
	if (!participant) return undefined;

	const names = participants.map((p) => p.name);
	const assignments = buildAssignments(names, seed);
	return assignments.get(participant.name);
}

/** Dev helper: full map for validating a cycle. */
export function getAllAssignments(): Map<string, string> {
	const { participants, seed } = getConfig();
	return buildAssignments(
		participants.map((p) => p.name),
		seed
	);
}
