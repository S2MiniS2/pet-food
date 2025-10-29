"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingProfile() {
  const r = useRouter();
  const [f, setF] = useState({
    name: "",
    species: "dog",
    weightKg: 7,
    lifeStage: "adult",
    activity: "normal",
    conditions: [] as string[],
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        species: f.species,
        weightKg: f.weightKg,
        lifeStage: f.lifeStage,
        activity: f.activity,
        conditions: f.conditions,
        neutered: false,
        name: f.name,
        notes: f.notes,
      }),
    });
    if (res.ok) r.push("/mode");
    else alert("프로필 저장 실패");
    setSaving(false);
  }

  return (
    <main style={{ padding: 24, display: "grid", gap: 12, maxWidth: 560 }}>
      <h1>프로필 입력</h1>
      <input
        placeholder="이름"
        value={f.name}
        onChange={(e) => setF({ ...f, name: e.target.value })}
      />
      <label>
        체중(kg)
        <input
          type="number"
          value={f.weightKg}
          onChange={(e) => setF({ ...f, weightKg: +e.target.value })}
        />
      </label>
      <label>
        생애단계
        <select
          value={f.lifeStage}
          onChange={(e) => setF({ ...f, lifeStage: e.target.value })}
        >
          <option value="puppy">puppy</option>
          <option value="adult">adult</option>
          <option value="senior">senior</option>
        </select>
      </label>
      <label>
        활동량
        <select
          value={f.activity}
          onChange={(e) => setF({ ...f, activity: e.target.value })}
        >
          <option value="very_low">very_low</option>
          <option value="low">low</option>
          <option value="normal">normal</option>
          <option value="high">high</option>
          <option value="athlete">athlete</option>
        </select>
      </label>
      <label>
        특이사항(쉼표로 구분)
        <input
          placeholder="ckd, obesity"
          onChange={(e) =>
            setF({
              ...f,
              conditions: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </label>
      <textarea
        placeholder="메모"
        value={f.notes}
        onChange={(e) => setF({ ...f, notes: e.target.value })}
      />
      <button onClick={save} disabled={saving}>
        {saving ? "저장중" : "저장"}
      </button>
    </main>
  );
}
