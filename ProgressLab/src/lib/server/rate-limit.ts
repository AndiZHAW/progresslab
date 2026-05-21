type Bucket = {
	count: number;
	resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
	key: string,
	maxAttempts = 8,
	windowMs = 60_000
): { ok: boolean; retryAfter: number } {
	const now = Date.now();
	const bucket = buckets.get(key);

	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return { ok: true, retryAfter: 0 };
	}

	bucket.count += 1;
	return {
		ok: bucket.count <= maxAttempts,
		retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
	};
}

export function clearRateLimit(key: string): void {
	buckets.delete(key);
}
