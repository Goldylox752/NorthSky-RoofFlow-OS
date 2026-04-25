export default function LeadCard({
  lead,
  status = "new",
  onAccept,
  onReject,
  loading = false,
}) {
  if (!lead) return null;

  const isDisabled = loading;

  return (
    <div style={styles.card}>
      {/* LEAD INFO */}
      <div style={styles.info}>
        <h3 style={styles.name}>{lead.name || "Unknown Lead"}</h3>

        <p style={styles.text}>📞 {lead.phone || "No phone"}</p>
        <p style={styles.text}>📍 {lead.city || "No city"}</p>
      </div>

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button
          onClick={onAccept}
          disabled={isDisabled}
          style={{
            ...styles.accept,
            ...(isDisabled && styles.disabled),
          }}
          aria-label="Accept lead"
        >
          {loading ? "Accepting..." : "Accept"}
        </button>

        <button
          onClick={onReject}
          disabled={isDisabled}
          style={{
            ...styles.reject,
            ...(isDisabled && styles.disabled),
          }}
          aria-label="Reject lead"
        >
          {loading ? "Rejecting..." : "Reject"}
        </button>
      </div>

      {/* STATUS */}
      <div style={styles.footer}>
        <span style={styles.statusLabel}>Status:</span>
        <span style={styles.statusValue}>{status}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#121a2b",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #24314d",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },

  info: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },

  name: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
  },

  text: {
    margin: 0,
    fontSize: 13,
    opacity: 0.8,
  },

  actions: {
    display: "flex",
    gap: 8,
  },

  accept: {
    background: "#22c55e",
    border: "none",
    padding: "6px 12px",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },

  reject: {
    background: "#ef4444",
    border: "none",
    padding: "6px 12px",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },

  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  footer: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 10,
    fontSize: 11,
    opacity: 0.7,
    minWidth: 70,
  },

  statusLabel: {
    fontSize: 10,
    opacity: 0.6,
  },

  statusValue: {
    fontSize: 12,
    fontWeight: 500,
  },
};
