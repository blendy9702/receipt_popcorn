import * as jose from "jose";

export const AUTH_TOKEN_COOKIE = "auth_token";

const JWT_EXPIRY_HOURS = 24;

function getSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ?? "frontend_jwt_secret_change_in_production";
  return new TextEncoder().encode(secret);
}

export async function createAuthToken(username: string): Promise<string> {
  return new jose.SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRY_HOURS}h`)
    .sign(getSecret());
}

export async function verifyAuthToken(
  token: string,
): Promise<{ username: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecret());
    const username = payload.sub;
    if (typeof username !== "string" || !username.trim()) {
      return null;
    }
    return { username: username.trim() };
  } catch {
    return null;
  }
}
