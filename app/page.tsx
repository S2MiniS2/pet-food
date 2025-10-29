import { supabase } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
export default async function Home() {
  const month = new Date().toISOString().slice(0, 7);
  const r = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    }/api/calendar?month=${month}`,
    { cache: "no-store" }
  );
  const logs = await r.json();
  return (
    <main style={{ padding: 20 }}>
      <a href="/feed/new">+ 기록</a>
      <pre>{JSON.stringify(logs, null, 2)}</pre>
    </main>
  );
}

export default async function Home() {
  const { data: pet } = await supabase
    .from("pet_profile")
    .select("id,name")
    .limit(1);
  if (!pet?.length)
    return <meta httpEquiv="refresh" content="0; url=/onboarding/profile" />;
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const r = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    }/api/calendar?month=${month}`,
    { cache: "no-store" }
  );
  const logs = await r.json();
  return (
    <main style={{ padding: 24 }}>
      <h1>기록</h1>
      <Link href="/recommend">추천받기</Link>
      <pre>{JSON.stringify(logs, null, 2)}</pre>
    </main>
  );
}
