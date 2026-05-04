import Link from "next/link";

export async function generateMetadata({ params }) {
  const city = params.city.replace(/-/g, " ");

  return {
    title: `Roofing Leads in ${city} | RoofFlow Exclusive Contractor Appointments`,
    description: `Get exclusive roofing leads in ${city}. RoofFlow connects contractors with high-intent homeowners actively requesting roofing estimates.`,
  };
}

export default function CityPage({ params }) {
  const city = params.city.replace(/-/g, " ");

  return (
    <main style={styles.main}>
      <div style={styles.container}>

        {/* HERO */}
        <h1 style={styles.h1}>
          Exclusive Roofing Leads in {city}
        </h1>

        <p style={styles.subtext}>
          RoofFlow delivers high-intent homeowners in {city} directly to contractors.
          No shared lists. No cold traffic. Just booked opportunities.
        </p>

        {/* CTA */}
        <div style={styles.ctaBox}>
          <Link href="/apply" style={styles.button}>
            Apply for {city} Access
          </Link>
        </div>

        {/* SECTION 1 */}
        <div style={styles.section}>
          <h2>How Roofing Leads Work in {city}</h2>
          <ul style={styles.list}>
            <li>Homeowners in {city} request roofing estimates</li>
            <li>AI filters for urgency + intent</li>
            <li>Only qualified opportunities are delivered</li>
          </ul>
        </div>

        {/* SECTION 2 */}
        <div style={styles.section}>
          <h2>Why Contractors in {city} Switch to RoofFlow</h2>
          <p style={styles.text}>
            Traditional lead providers in {city} sell shared, low-intent leads.
            RoofFlow focuses only on homeowners actively looking to hire.
          </p>
        </div>

        {/* SECTION 3 */}
        <div style={styles.section}>
          <h2>What You Get</h2>
          <ul style={styles.list}>
            <li>Exclusive territory access in {city}</li>
            <li>No shared or recycled leads</li>
            <li>AI-qualified high-intent homeowners</li>
            <li>Real-time delivery system</li>
          </ul>
        </div>

        {/* URGENCY BLOCK */}
        <div style={styles.urgency}>
          ⚡ Limited contractor slots available in {city}
        </div>

        {/* FINAL CTA */}
        <div style={styles.finalCta}>
          <h2>Start Receiving Roofing Leads in {city}</h2>
          <p style={styles.text}>
            Applications are reviewed manually to maintain lead quality and exclusivity.
          </p>

          <Link href="/apply" style={styles.button}>
            Apply Now
          </Link>
        </div>

      </div>
    </main>
  );
}

const styles = {
  main: {
    background: "#0b1220",
    color: "white",
    fontFamily: "system-ui",
    padding: "60px 20px",
  },

  container: {
    maxWidth: "850px",
    margin: "0 auto",
  },

  h1: {
    fontSize: "42px",
    marginBottom: "15px",
  },

  subtext: {
    opacity: 0.8,
    fontSize: "18px",
    marginBottom: "30px",
  },

  ctaBox: {
    marginBottom: "40px",
  },

  button: {
    display: "inline-block",
    padding: "14px 18px",
    background: "#4da3ff",
    color: "white",
    borderRadius: "8px",
    fontWeight: "bold",
    textDecoration: "none",
  },

  section: {
    marginTop: "40px",
  },

  text: {
    opacity: 0.8,
    lineHeight: "1.6",
  },

  list: {
    opacity: 0.85,
    lineHeight: "1.8",
  },

  urgency: {
    marginTop: "40px",
    padding: "15px",
    background: "#1b2a44",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "bold",
  },

  finalCta: {
    marginTop: "60px",
    textAlign: "center",
  },
};