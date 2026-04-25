export default function Home() {
  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.h1}>We Book Qualified Roofing Jobs for You</h1>

        <p style={styles.subtext}>
          RoofFlow generates, filters, and delivers high-intent roofing
          appointments directly into your pipeline — so you focus on closing,
          not chasing leads.
        </p>

        <div style={styles.ctaRow}>
          <a href="/apply" style={styles.primaryBtn}>Apply Now</a>
          <a href="#pricing" style={styles.secondaryBtn}>View Pricing</a>
        </div>

        <p style={styles.micro}>
          No junk leads. No PPC waste. Only verified homeowner demand.
        </p>
      </section>

      {/* TRUST */}
      <section style={styles.trust}>
        <p>Trusted by roofing contractors across North America</p>
      </section>

      {/* FEATURES */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Why RoofFlow Wins</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Pre-Qualified Homeowners</h3>
            <p>
              Every lead is filtered by intent, budget, and urgency before it
              reaches you.
            </p>
          </div>

          <div style={styles.card}>
            <h3>Booked Appointments</h3>
            <p>
              We don’t send raw leads — we deliver scheduled inspections and
              phone-ready homeowners.
            </p>
          </div>

          <div style={styles.card}>
            <h3>Exclusive Territories</h3>
            <p>
              You never compete with multiple contractors for the same
              opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={styles.sectionDark}>
        <h2 style={styles.h2}>Results From Contractors</h2>

        <div style={styles.grid}>
          <div style={styles.testimonial}>
            “Closed 7 jobs in the first month. Best lead source I’ve used.”
            <span> — Roofing Contractor, Texas</span>
          </div>

          <div style={styles.testimonial}>
            “No tire-kickers anymore. Every call is ready to move forward.”
            <span> — Roofing Business Owner</span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={styles.section}>
        <h2 style={styles.h2}>Simple, Transparent Pricing</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Starter</h3>
            <p>$499 / month</p>
            <p>5–10 qualified leads</p>
          </div>

          <div style={styles.cardHighlight}>
            <h3>Pro</h3>
            <p>$999 / month</p>
            <p>15–30 booked appointments</p>
            <p>Priority routing</p>
          </div>

          <div style={styles.card}>
            <h3>Elite</h3>
            <p>$1,999 / month</p>
            <p>High-volume + exclusive territory</p>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="/apply" style={styles.primaryBtn}>
            Start Getting Leads
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={styles.sectionDark}>
        <h2 style={styles.h2}>FAQ</h2>

        <div style={styles.faq}>
          <p>
            <b>Are leads exclusive?</b><br />
            Yes — one contractor per territory.
          </p>

          <p>
            <b>Do you guarantee jobs?</b><br />
            We guarantee qualified appointments, not closed sales.
          </p>

          <p>
            <b>How fast do I get leads?</b><br />
            Typically within 24–72 hours after approval.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={styles.hero}>
        <h2 style={styles.h2}>Ready to fill your schedule?</h2>
        <a href="/apply" style={styles.primaryBtn}>Apply & Get Leads</a>
      </section>
    </main>
  );
}

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    background: "#0b1220",
    color: "white",
  },

  hero: {
    textAlign: "center",
    padding: "90px 20px",
  },

  h1: {
    fontSize: "46px",
    marginBottom: "15px",
  },

  h2: {
    fontSize: "32px",
    marginBottom: "20px",
    textAlign: "center",
  },

  subtext: {
    fontSize: "18px",
    maxWidth: "650px",
    margin: "0 auto",
    opacity: 0.8,
  },

  micro: {
    marginTop: "15px",
    fontSize: "12px",
    opacity: 0.5,
  },

  ctaRow: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },

  primaryBtn: {
    padding: "12px 20px",
    background: "#3b82f6",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  secondaryBtn: {
    padding: "12px 20px",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
  },

  section: {
    padding: "70px 20px",
    background: "#0b1220",
  },

  sectionDark: {
    padding: "70px 20px",
    background: "#070b14",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },

  card: {
    background: "#111a2e",
    padding: "20px",
    borderRadius: "10px",
  },

  cardHighlight: {
    background: "#1d4ed8",
    padding: "20px",
    borderRadius: "10px",
    transform: "scale(1.05)",
  },

  testimonial: {
    background: "#111a2e",
    padding: "20px",
    borderRadius: "10px",
    fontStyle: "italic",
  },

  faq: {
    maxWidth: "700px",
    margin: "0 auto",
    lineHeight: "1.6",
    opacity: 0.9,
  },

  trust: {
    textAlign: "center",
    opacity: 0.6,
    paddingBottom: "40px",
  },
};
