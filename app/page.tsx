import { cookies } from "next/headers";
import { HomeDashboard } from "@/components/home-dashboard";
import { AUTH_TOKEN_COOKIE, verifyAuthToken } from "@/lib/jwt";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  const payload = token ? await verifyAuthToken(token) : null;

  return <HomeDashboard username={payload?.username} />;
}
