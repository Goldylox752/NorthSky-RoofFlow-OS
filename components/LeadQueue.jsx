import LeadCard from "./LeadCard";

export default function LeadQueue({ leads, setLeads }) {

  async function updateStatus(id, status) {

    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status } : l
      )
    );

    await fetch("/api/leads/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
  }

  return (
    <div style={styles.queue}>

      {leads.length === 0 && (
        <p>No assigned leads yet...</p>
      )}

      {leads.map((item) => (
        <LeadCard
          key={item.id}
          lead={item.lead}
          status={item.status}
          onAccept={() => updateStatus(item.id, "accepted")}
          onReject={() => updateStatus(item.id, "rejected")}
        />
      ))}

    </div>
  );
}

const styles = {
  queue: {
    display: "grid",
    gap: 12
  }
};
