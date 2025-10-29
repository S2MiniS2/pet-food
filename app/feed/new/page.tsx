"use client";
import { useState } from "react";
export default function NewFeed() {
  const [b, setB] = useState({
    pet_id: "",
    ts: new Date().toISOString().slice(0, 10),
    meal: "breakfast",
    item_type: "product",
    item_id: "",
    amount_g: 0,
    note: "",
  });
  async function save() {
    const r = await fetch("/api/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    if (r.ok) location.href = "/";
    else alert("실패");
  }
  return (
    <main style={{ padding: 20, display: "grid", gap: 8 }}>
      <input
        placeholder="pet_id"
        value={b.pet_id}
        onChange={(e) => setB({ ...b, pet_id: e.target.value })}
      />
      <input
        type="date"
        value={b.ts}
        onChange={(e) => setB({ ...b, ts: e.target.value })}
      />
      <select
        value={b.meal}
        onChange={(e) => setB({ ...b, meal: e.target.value })}
      >
        <option>breakfast</option>
        <option>lunch</option>
        <option>dinner</option>
        <option>snack</option>
      </select>
      <select
        value={b.item_type}
        onChange={(e) => setB({ ...b, item_type: e.target.value })}
      >
        <option>product</option>
        <option>recipe</option>
      </select>
      <input
        placeholder="item_id"
        value={b.item_id}
        onChange={(e) => setB({ ...b, item_id: e.target.value })}
      />
      <input
        type="number"
        placeholder="amount_g"
        value={b.amount_g}
        onChange={(e) => setB({ ...b, amount_g: +e.target.value })}
      />
      <input
        placeholder="note"
        value={b.note}
        onChange={(e) => setB({ ...b, note: e.target.value })}
      />
      <button onClick={save}>저장</button>
    </main>
  );
}
