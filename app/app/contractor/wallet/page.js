"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Wallet() {
  const contractorId = "demo";

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const load = async () => {
    const { data: contractor } = await supabase
      .from("contractors")
      .select("balance_cents")
      .eq("id", contractorId)
      .single();

    setBalance(contractor?.balance_cents || 0);

    const { data: tx } = await supabase
      .from("transactions")
      .select("*")
      .eq("contractor_id", contractorId)
      .order("created_at", { ascending: false });

    setTransactions(tx || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main style={{ padding: 40, color: "white", background: "#0b1220" }}>
      <h1>Wallet</h1>

      <h2>Balance: ${(balance / 100).toFixed(2)}</h2>

      <button
        onClick={async () => {
          const amount = prompt("Top up amount ($)");
          await fetch("/api/wallet/topup", {
            method: "POST",
            body: JSON.stringify({
              contractorId,
              amount_cents: Number(amount) * 100,
            }),
          });

          load();
        }}
      >
        Top Up
      </button>

      <h3>Transactions</h3>

      {transactions.map((t) => (
        <div key={t.id} style={{ marginTop: 10 }}>
          <p>{t.type}</p>
          <p>${(t.amount_cents / 100).toFixed(2)}</p>
        </div>
      ))}
    </main>
  );
}