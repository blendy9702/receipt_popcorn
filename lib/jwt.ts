import * as jose from "jose";

export const AUTH_TOKEN_COOKIE = "auth_token";

const JWT_EXPIRY_HOURS = 24;
export type AuthRole = "admin" | "parent" | "child";
export type AuthTokenPayload = { username: string; role?: AuthRole };

function getSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ?? "frontend_jwt_secret_change_in_production";
  return new TextEncoder().encode(secret);
}

export async function createAuthToken(
  username: string,
  role?: string | null,
): Promise<string> {
  const normalizedRole =
    role === "admin" || role === "parent" || role === "child" ? role : undefined;

  return new jose.SignJWT({
    sub: username,
    ...(normalizedRole ? { role: normalizedRole } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRY_HOURS}h`)
    .sign(getSecret());
}

export async function verifyAuthToken(
  token: string,
): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecret());
    const username = payload.sub;
    if (typeof username !== "string" || !username.trim()) {
      return null;
    }

    const role =
      payload.role === "admin" ||
      payload.role === "parent" ||
      payload.role === "child"
        ? payload.role
        : undefined;

    return { username: username.trim(), ...(role ? { role } : {}) };
  } catch {
    return null;
  }
}
