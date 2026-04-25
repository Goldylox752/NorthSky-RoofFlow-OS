import { useMemo } from "react";

export default function StatsBar({ leads = [] }) {
  // ⚡ Single-pass reduction (faster than multiple filters)
  const stats = useMemo(() => {
    return leads.reduce(
      (acc, lead) => {
        acc.total += 1;

        if (lead.status === "accepted") acc.accepted += 1;
        else if (lead.status === "rejected") acc.rejected += 1;
        else acc.pending += 1;

        return acc;
      },
      { total: 0, accepted: 0, rejected: 0, pending: 0 }
    );
  }, [leads]);

  return (
    <div style={styles.bar}>
      <Stat label="Total" value={stats.total} />
      <Stat label="Accepted" value={stats.accepted} color="#22c55e" />
      <Stat label="Rejected" value={stats.rejected} color="#ef4444" />
      <Stat label="Pending" value={stats.pending} color="#f59e0b" />
    </div>
  );
}

// 📊 Reusable stat component
function Stat({ label, value, color = "#ffffff" }) {
  return (
    <div style={styles.stat}>
      <span style={styles.label}>{label}</span>
      <span style={{ ...styles.value, color }}>{value}</span>
    </div>
  );
}

const styles = {
  bar: {
    display: "flex",
    gap: 18,
    padding: 14,
    marginBottom: 20,
    background: "#121a2b",
    border: "1px solid #24314d",
    borderRadius: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },

  stat: {
    display: "flex",
    flexDirection: "column",
    minWidth: 90,
  },

  label: {
    fontSize: 12,
    opacity: 0.7,
  },

  value: {
    fontSize: 18,
    fontWeight: 700,
  },
};
