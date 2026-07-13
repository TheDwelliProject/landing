/**
 * Expands the wizard's "label × count" entry into the distinct labels the
 * backend requires (unit labels are unique per property).
 */

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The next free number in the `"<base> <n>"` sequence among existing labels.
 * Only plain-digit suffixes participate ("Flat 03" and "Flat A" don't; a
 * bare "Flat" doesn't block numbering — it is a distinct label).
 */
export function nextStartNumber(base: string, existing: string[]): number {
	const pattern = new RegExp(`^${escapeRegExp(base)} (\\d+)$`);
	let max = 0;
	for (const label of existing) {
		const match = pattern.exec(label);
		if (!match) continue;
		const n = Number(match[1]);
		if (String(n) !== match[1]) continue; // zero-padded → not ours
		if (n > max) max = n;
	}
	return max + 1;
}

/**
 * A single unit keeps the bare label; multiples are numbered "base 1",
 * "base 2", … continuing past any existing "base n" units so re-adding the
 * same base later doesn't collide.
 */
export function expandLabels(
	base: string,
	count: number,
	existing: string[],
): string[] {
	if (count === 1) return [base];
	const start = nextStartNumber(base, existing);
	return Array.from({ length: count }, (_, i) => `${base} ${start + i}`);
}
