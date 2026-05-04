"use client";

import { useEffect, useState } from "react";

export default function ContractorDashboard() {
  const [leads, setLeads] = useState([]);
  const contractorId = "demo-contractor-1"; // replace with auth later

  useEffect(() => {
    fetch(`/api/leads?contractorId=${contractorId}`)
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []));
  }, []);

  const claimLead = async (leadId) => {
    await fetch("/api/lead/claim", {
      method: "POST",
      body: JSON.stringify({ leadId, contractorId }),
    });

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: "claimed" } : l
      )
    );
  };

  return (
    <div style={{ padding: 40, color: "white", background: "#0b1220" }}>
      <h1>Contractor Portal</h1>

      {leads.map((l) => (
        <div key={l.id} style={card}>
          <p>📍 {l.city}</p>
          <p>⚡ Score: {l.score}</p>
          <p>💰 ${l.price / 100}</p>

          <button onClick={() => claimLead(l.id)}>
            Claim Lead
          </button>
        </div>
      ))}
    </div>
  );
}

const card = {
  background: "#111827",
  padding: 12,
  marginTop: 10,
};