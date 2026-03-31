import { cookies } from "next/headers";
import { HomeDashboard } from "@/components/home-dashboard";
import { AUTH_TOKEN_COOKIE, verifyAuthToken } from "@/lib/jwt";

export default async function Home() {
  const initialToday = new Date().toISOString().slice(0, 10);
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  const payload = token ? await verifyAuthToken(token) : null;

  return (
    <HomeDashboard
      initialToday={initialToday}
      username={payload?.username ?? "Popcorn"}
    />
  );
}
