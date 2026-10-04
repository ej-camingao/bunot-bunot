/**
 * Dev helper: print the full assignment cycle for the current env seed.
 * Run with: node --env-file=.env scripts/check.mjs
 */

function mulberry32(seed) {
	let t = seed >>> 0;
	return () => {
		t += 0x6d2b79f5;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}

function hashSeed(seed) {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

function buildAssignments(names, seed) {
	const order = [...names];
	const random = mulberry32(hashSeed(seed));
	for (let i = order.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[order[i], order[j]] = [order[j], order[i]];
	}
	const assignments = new Map();
	for (let i = 0; i < order.length; i++) {
		assignments.set(order[i], order[(i + 1) % order.length]);
	}
	return assignments;
}

function parseParticipants(raw) {
	return raw
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((piece) => {
			const colon = piece.lastIndexOf(':');
			return piece.slice(0, colon).trim();
		});
}

const participants = process.env.PARTICIPANTS ?? '';
const seed = process.env.EXCHANGE_SEED ?? '';

if (!participants || !seed) {
	console.error('Set PARTICIPANTS and EXCHANGE_SEED (e.g. node --env-file=.env scripts/check.mjs).');
	process.exit(1);
}

const names = parseParticipants(participants);
const map = buildAssignments(names, seed);

console.log(`Seed: ${seed}`);
console.log(`Participants (${names.length}): ${names.join(', ')}`);
console.log('Assignments:');

const start = names[0];
let current = start;
const seen = new Set();

do {
	seen.add(current);
	const next = map.get(current);
	if (!next) {
		console.error(`Missing assignment for ${current}`);
		process.exit(1);
	}
	console.log(`  ${current} → ${next}`);
	if (current === next) {
		console.error(`Self-gift detected: ${current}`);
		process.exit(1);
	}
	current = next;
} while (current !== start && !seen.has(current));

if (current !== start || seen.size !== names.length) {
	console.error('Not a valid single cycle covering everyone.');
	process.exit(1);
}

console.log('Valid single cycle covering everyone.');
