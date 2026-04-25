"use client";

import { useState } from "react";
import LeadCard from "./LeadCard";

export default function LeadQueue({ leads = [], setLeads }) {
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  async function updateStatus(id, status) {
    setError("");
    setLoadingId(id);

    // 💾 snapshot for rollback
    const previousLeads = [...leads];

    // ⚡ optimistic update
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id ? { ...lead, status } : lead
      )
    );

    try {
      const res = await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        throw new Error("Failed to update lead");
      }
    } catch (err) {
      // 🔄 rollback
      setLeads(previousLeads);
      setError("Update failed. Please try again.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div style={styles.queue}>
      {error && <p style={styles.error}>{error}</p>}

      {leads.length === 0 ? (
        <p style={styles.empty}>No assigned leads yet...</p>
      ) : (
        leads.map((item) => (
          <LeadCard
            key={item.id}
            lead={item.lead}
            status={item.status}
            loading={loadingId === item.id}
            onAccept={() => updateStatus(item.id, "accepted")}
            onReject={() => updateStatus(item.id, "rejected")}
          />
        ))
      )}
    </div>
  );
}

const styles = {
  queue: {
    display: "grid",
    gap: 12,
  },

  empty: {
    opacity: 0.7,
    fontSize: 13,
  },

  error: {
    color: "#ff6b6b",
    fontSize: 13,
  },
};
