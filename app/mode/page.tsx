"use client";
import { useRouter } from "next/navigation";
export default function Mode() {
  const r = useRouter();
  return (
    <main style={{ padding: 24, display: "grid", gap: 12 }}>
      <h1>급여 방식 선택</h1>
      <button onClick={() => r.push("/recipes/new")}>커스텀</button>
      <button onClick={() => r.push("/recommend")}>추천받기</button>
    </main>
  );
}
