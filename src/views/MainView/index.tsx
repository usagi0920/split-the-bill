"use client"
import { useState } from "react";

export function MainView() {

    const [amount, setAmount] = useState("");

    const half = Number(amount) / 2;

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", textAlign: "center" }}>
      <h1>割り勘ツール</h1>
      <input
        type="number"
        placeholder="金額を入力"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <p>1人あたり：{amount ? half : ""} 円</p>
    </div>
  )}