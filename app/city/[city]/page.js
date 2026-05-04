import LeadForm from "@/components/LeadForm";

export default function CityPage({ params }) {
  const city = params.city;

  return (
    <main style={styles.page}>
      <h1>Roofing Leads in {city}</h1>

      <p>Exclusive contractor demand marketplace.</p>

      <div style={styles.box}>
        <LeadForm city={city} />
      </div>
    </main>
  );
}

const styles = {
  page: {
    background: "#0b1220",
    color: "white",
    minHeight: "100vh",
    padding: 40,
  },
  box: {
    marginTop: 20,
    padding: 20,
    background: "#111a2e",
  },
};