export default function LeadCard({
  lead,
  status = "new",
  onAccept,
  onReject,
  loading = false,
}) {
  if (!lead) return null;

  return (
    <div style={styles.card}>
      {/* LEAD INFO */}
      <div style={styles.info}>
        <h3 style={styles.name}>{lead.name || "Unknown Lead"}</h3>

        <p style={styles.text}>
          📞 {lead.phone || "No phone"}
        </p>

        <p style={styles.text}>
          📍 {lead.city || "No city"}
        </p>
      </div>

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button
          onClick={onAccept}
          style={{
            ...styles.accept,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
          aria-label="Accept lead"
        >
          {loading ? "..." : "Accept"}
        </button>

        <button
          onClick={onReject}
          style={{
            ...styles.reject,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
          aria-label="Reject lead"
        >
          {loading ? "..." : "Reject"}
        </button>
      </div>

      {/* STATUS */}
      <small style={styles.status}>
        Status: {status}
      </small>
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
  },

  name: {
    margin: 0,
    fontSize: 16,
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
  },

  reject: {
    background: "#ef4444",
    border: "none",
    padding: "6px 12px",
    color: "white",
    borderRadius: 6,
  },

  status: {
    fontSize: 11,
    opacity: 0.7,
    marginLeft: 10,
  },
};
