import LeadForm from "@/components/LeadForm";

export default function CityPage({ params }) {
  const city = decodeURIComponent(params.city)
    .replace(/-/g, " ");

  return (
    <main style={styles.page}>
      <h1 style={styles.h1}>
        Roofing Leads in {city}
      </h1>

      <p style={styles.subtext}>
        Get a free roofing estimate from verified contractors in {city}.
      </p>

      <div style={styles.formBox}>
        <LeadForm source={`seo_${city}`} />
      </div>
    </main>
  );
}

const styles = {
  page: {
    padding: "60px 20px",
    color: "white",
    background: "#0b1220",
    minHeight: "100vh",
  },

  h1: {
    fontSize: 34,
    marginBottom: 10,
  },

  subtext: {
    opacity: 0.7,
    marginBottom: 30,
    maxWidth: 600,
  },

  formBox: {
    maxWidth: 500,
    background: "#111a2e",
    padding: 20,
    borderRadius: 12,
  },
};
