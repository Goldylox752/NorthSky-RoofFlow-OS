export default function LeadCard({
  lead,
  status = "new",
  onAccept,
  onReject,
  loadingAction = null, // "accept" | "reject" | null
}) {
  if (!lead) return null;

  const isAccepting = loadingAction === "accept";
  const isRejecting = loadingAction === "reject";
  const isDisabled = isAccepting || isRejecting;

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "#60a5fa";
      case "processing":
        return "#fbbf24";
      case "accepted":
        return "#22c55e";
      case "rejected":
        return "#ef4444";
      default:
        return "#94a3b8";
    }
  };

  return (
    <div style={styles.card}>
      {/* LEAD INFO */}
      <div style={styles.info}>
        <h3 style={styles.name}>
          {lead.name || "Unknown Lead"}
        </h3>

        <p style={styles.text}>📞 {lead.phone || "No phone"}</p>
        <p style={styles.text}>📍 {lead.city || "No city"}</p>

        {lead.score && (
          <p style={styles.text}>🔥 Score: {lead.score}/10</p>
        )}
      </div>

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button
          onClick={() => onAccept?.(lead)}
          disabled={isDisabled}
          style={{
            ...styles.accept,
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          {isAccepting ? "Accepting..." : "Accept"}
        </button>

        <button
          onClick={() => onReject?.(lead)}
          disabled={isDisabled}
          style={{
            ...styles.reject,
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          {isRejecting ? "Rejecting..." : "Reject"}
        </button>
      </div>

      {/* STATUS */}
      <div style={styles.footer}>
        <span style={styles.statusLabel}>Status</span>
        <span
          style={{
            ...styles.statusValue,
            color: getStatusColor(status),
          }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}