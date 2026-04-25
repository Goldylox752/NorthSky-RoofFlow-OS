export default function StatsBar({ leads }) {

  const total = leads.length;
  const accepted = leads.filter(l => l.status === "accepted").length;
  const rejected = leads.filter(l => l.status === "rejected").length;

  return (
    <div style={styles.bar}>
      <div>Total: {total}</div>
      <div>Accepted: {accepted}</div>
      <div>Rejected: {rejected}</div>
    </div>
  );
}

const styles = {
  bar: {
    display: "flex",
    gap: 20,
    marginBottom: 20,
    padding: 12,
    background: "#121a2b",
    borderRadius: 10,
    border: "1px solid #24314d"
  }
};
