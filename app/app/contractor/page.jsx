"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContractorPage() {
  const [wallet, setWallet] = useState(0);
  const [leads, setLeads] = useState([]);

  const contractorId = "demo-id"; // later from auth

  useEffect(() => {
    loadWallet();
    loadLeads();
  }, []);

  async function loadWallet() {
    const { data } = await supabase
      .from("contractors")
      .select("balance_cents")
      .eq("id", contractorId)
      .single();

    setWallet(data?.balance_cents || 0);
  }

  async function loadLeads() {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("assigned_contractor_id", contractorId)
      .order("created_at", { ascending: false });

    setLeads(data || []);
  }

  return (
    <div>
      <h1>Contractor Portal</h1>

      <div>Wallet: ${(wallet / 100).toFixed(2)}</div>

      <h2>Your Leads</h2>

      {leads.map((l) => (
        <div key={l.id} style={card}>
          <p>{l.city}</p>
          <p>Status: {l.status}</p>
          <p>Price: ${(l.price || 0) / 100}</p>
        </div>
      ))}
    </div>
  );
}

const card = {
  background: "#111827",
  padding: 10,
  marginTop: 10,
};