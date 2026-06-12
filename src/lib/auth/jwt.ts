import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export type AccessClaims = {
	sub: string;
	exp: number;
	iat?: number;
	superadmin?: boolean;
	[claim: string]: unknown;
};

export class InvalidJwtError extends Error {
	constructor(reason: string, options?: ErrorOptions) {
		super(`Invalid JWT: ${reason}`, options);
		this.name = "InvalidJwtError";
	}
}

export class JwtVerifierUnavailableError extends Error {
	constructor(reason: string, options?: ErrorOptions) {
		super(`JWT verifier unavailable: ${reason}`, options);
		this.name = "JwtVerifierUnavailableError";
	}
}

let remoteJwks: ReturnType<typeof createRemoteJWKSet> | undefined;

const ALLOWED_ALGORITHMS = new Set([
	"RS256",
	"RS384",
	"RS512",
	"ES256",
	"ES384",
	"ES512",
]);

function requiredEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new JwtVerifierUnavailableError(`missing ${name}`);
	}
	return value;
}

function jwtAlgorithm(): string {
	const algorithm = process.env.AUTH_JWT_ALGORITHM ?? "RS256";
	if (!ALLOWED_ALGORITHMS.has(algorithm)) {
		throw new JwtVerifierUnavailableError(
			`unsupported AUTH_JWT_ALGORITHM: ${algorithm}`,
		);
	}
	return algorithm;
}

function jwks() {
	if (!remoteJwks) {
		try {
			remoteJwks = createRemoteJWKSet(
				new URL(requiredEnv("AUTH_JWKS_URL")),
			);
		} catch (cause) {
			if (cause instanceof JwtVerifierUnavailableError) throw cause;
			throw new JwtVerifierUnavailableError("invalid AUTH_JWKS_URL", {
				cause,
			});
		}
	}
	return remoteJwks;
}

export async function verifyAccessJwt(token: string): Promise<AccessClaims> {
	let raw: JWTPayload;
	try {
		const verified = await jwtVerify(token, jwks(), {
			issuer: requiredEnv("AUTH_JWT_ISSUER"),
			audience: requiredEnv("AUTH_JWT_AUDIENCE"),
			algorithms: [jwtAlgorithm()],
		});
		raw = verified.payload;
	} catch (cause) {
		if (cause instanceof JwtVerifierUnavailableError) throw cause;
		if (isVerifierInfrastructureError(cause)) {
			throw new JwtVerifierUnavailableError(
				cause instanceof Error
					? cause.message
					: "verification unavailable",
				{ cause },
			);
		}
		throw new InvalidJwtError(
			cause instanceof Error ? cause.message : "verification failed",
			{ cause },
		);
	}

	const sub = typeof raw.sub === "string" ? raw.sub : undefined;
	const exp = typeof raw.exp === "number" ? raw.exp : undefined;
	if (!sub) throw new InvalidJwtError("missing sub");
	if (!exp) throw new InvalidJwtError("missing exp");

	const superadmin =
		typeof raw.superadmin === "boolean" ? raw.superadmin : undefined;

	return {
		...raw,
		sub,
		exp,
		superadmin,
	};
}

function isVerifierInfrastructureError(cause: unknown): boolean {
	const code =
		typeof cause === "object" && cause !== null
			? (cause as { code?: unknown }).code
			: undefined;

	return (
		code === "ERR_JWKS_INVALID" ||
		code === "ERR_JWKS_NO_MATCHING_KEY" ||
		code === "ERR_JWKS_TIMEOUT" ||
		code === "ERR_JWK_INVALID" ||
		code === "ERR_JWKS_MULTIPLE_MATCHING_KEYS"
	);
}
