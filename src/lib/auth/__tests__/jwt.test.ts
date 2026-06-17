// @vitest-environment node
// jose's WebCrypto signing checks `payload instanceof Uint8Array`, which fails
// under jsdom's separate realm — and this module has no DOM dependencies anyway.
import { SignJWT, exportJWK, generateKeyPair } from "jose";
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";

const ISS = "https://issuer.example/";
const AUD = "dwelli-web";
const JWKS_URL = "https://issuer.example/.well-known/jwks.json";
const KID = "test-key";

type Key = Awaited<ReturnType<typeof generateKeyPair>>["privateKey"];

let publicKey: Key;
let privateKey: Key;
let publicJwk: Record<string, unknown>;

const fetchMock = vi.fn();

async function sign(
	claims: Record<string, unknown>,
	opts: {
		alg?: string;
		kid?: string;
		key?: Key | Uint8Array;
		issuer?: string;
		audience?: string;
		exp?: number | string;
		sub?: string | null;
	} = {},
): Promise<string> {
	const jwt = new SignJWT(claims)
		.setProtectedHeader({ alg: opts.alg ?? "RS256", kid: opts.kid ?? KID })
		.setIssuedAt()
		.setIssuer(opts.issuer ?? ISS)
		.setAudience(opts.audience ?? AUD)
		.setExpirationTime(opts.exp ?? "5m");
	if (opts.sub !== null) jwt.setSubject(opts.sub ?? "user-1");
	return jwt.sign(opts.key ?? privateKey);
}

function jwksResponse(keys: unknown[]): Response {
	return new Response(JSON.stringify({ keys }), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

async function loadVerify() {
	vi.resetModules();
	return await import("@/lib/auth/jwt");
}

beforeAll(async () => {
	const kp = await generateKeyPair("RS256", { extractable: true });
	publicKey = kp.publicKey;
	privateKey = kp.privateKey;
	publicJwk = {
		...(await exportJWK(publicKey)),
		kid: KID,
		alg: "RS256",
		use: "sig",
	};
});

beforeEach(() => {
	process.env.AUTH_JWKS_URL = JWKS_URL;
	process.env.AUTH_JWT_ISSUER = ISS;
	process.env.AUTH_JWT_AUDIENCE = AUD;
	delete process.env.AUTH_JWT_ALGORITHM;
	fetchMock.mockReset();
	fetchMock.mockResolvedValue(jwksResponse([publicJwk]));
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("verifyAccessJwt", () => {
	it("verifies a well-formed RS256 token and surfaces claims", async () => {
		const { verifyAccessJwt } = await loadVerify();
		const claims = await verifyAccessJwt(await sign({ superadmin: true }));

		expect(claims.sub).toBe("user-1");
		expect(claims.superadmin).toBe(true);
		expect(typeof claims.exp).toBe("number");
	});

	it("defaults superadmin to undefined when the claim is absent", async () => {
		const { verifyAccessJwt } = await loadVerify();
		const claims = await verifyAccessJwt(await sign({}));
		expect(claims.superadmin).toBeUndefined();
	});

	it("rejects a token from the wrong issuer as invalid", async () => {
		const { verifyAccessJwt, InvalidJwtError } = await loadVerify();
		const token = await sign({}, { issuer: "https://evil.example/" });
		await expect(verifyAccessJwt(token)).rejects.toBeInstanceOf(
			InvalidJwtError,
		);
	});

	it("rejects a token for the wrong audience as invalid", async () => {
		const { verifyAccessJwt, InvalidJwtError } = await loadVerify();
		const token = await sign({}, { audience: "some-other-api" });
		await expect(verifyAccessJwt(token)).rejects.toBeInstanceOf(
			InvalidJwtError,
		);
	});

	it("rejects an expired token as invalid", async () => {
		const { verifyAccessJwt, InvalidJwtError } = await loadVerify();
		const token = await sign(
			{},
			{ exp: Math.floor(Date.now() / 1000) - 3600 },
		);
		await expect(verifyAccessJwt(token)).rejects.toBeInstanceOf(
			InvalidJwtError,
		);
	});

	it("rejects a token missing the sub claim", async () => {
		const { verifyAccessJwt, InvalidJwtError } = await loadVerify();
		const token = await sign({}, { sub: null });
		await expect(verifyAccessJwt(token)).rejects.toBeInstanceOf(
			InvalidJwtError,
		);
	});

	it("rejects an HMAC-signed token (no HS* on the allowlist)", async () => {
		const { verifyAccessJwt, InvalidJwtError } = await loadVerify();
		const secret = new TextEncoder().encode(
			"a-very-long-shared-secret-value-32b",
		);
		const token = await sign({}, { alg: "HS256", key: secret });
		await expect(verifyAccessJwt(token)).rejects.toBeInstanceOf(
			InvalidJwtError,
		);
	});

	it("treats a JWKS with no matching key as unavailable, not invalid", async () => {
		const { verifyAccessJwt, JwtVerifierUnavailableError } =
			await loadVerify();
		fetchMock.mockResolvedValue(jwksResponse([]));
		await expect(verifyAccessJwt(await sign({}))).rejects.toBeInstanceOf(
			JwtVerifierUnavailableError,
		);
	});

	it("treats a missing AUTH_JWKS_URL as unavailable", async () => {
		const { verifyAccessJwt, JwtVerifierUnavailableError } =
			await loadVerify();
		delete process.env.AUTH_JWKS_URL;
		await expect(verifyAccessJwt(await sign({}))).rejects.toBeInstanceOf(
			JwtVerifierUnavailableError,
		);
	});

	it("treats an unsupported configured algorithm as unavailable", async () => {
		const { verifyAccessJwt, JwtVerifierUnavailableError } =
			await loadVerify();
		process.env.AUTH_JWT_ALGORITHM = "HS256";
		await expect(verifyAccessJwt(await sign({}))).rejects.toBeInstanceOf(
			JwtVerifierUnavailableError,
		);
	});
});
