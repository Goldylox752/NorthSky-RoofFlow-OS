export default function Home() {
  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.h1}>We Book You Qualified Roofing Jobs</h1>
        <p style={styles.subtext}>
          RoofFlow generates, filters, and delivers high-intent roofing leads
          straight into your pipeline — so you focus on closing, not chasing.
        </p>

        <div style={styles.ctaRow}>
          <a href="/apply" style={styles.primaryBtn}>Apply Now</a>
          <a href="#pricing" style={styles.secondaryBtn}>See Pricing</a>
        </div>

        <p style={styles.micro}>
          No junk leads. No pay-per-click waste. Only real homeowner demand.
        </p>
      </section>

      {/* TRUST */}
      <section style={styles.trust}>
        <p>Trusted by roofing contractors across North America</p>
      </section>

      {/* FEATURES */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Why RoofFlow Works</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Pre-Qualified Leads</h3>
            <p>We filter homeowners based on intent, budget, and urgency.</p>
          </div>

          <div style={styles.card}>
            <h3>Booked Appointments</h3>
            <p>Not just leads — we deliver calls and scheduled inspections.</p>
          </div>

          <div style={styles.card}>
            <h3>Exclusive Territory</h3>
            <p>You don’t compete with 10 other contractors on the same lead.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={styles.sectionDark}>
        <h2 style={styles.h2}>What Contractors Say</h2>

        <div style={styles.grid}>
          <div style={styles.testimonial}>
            <p>“Closed 7 jobs in the first month. Best lead source I’ve used.”</p>
            <span>— Roofing Contractor, Texas</span>
          </div>

          <div style={styles.testimonial}>
            <p>“No tire-kickers anymore. Every call is actually ready to buy.”</p>
            <span>— Roofing Company Owner</span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={styles.section}>
        <h2 style={styles.h2}>Simple Pricing</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Starter</h3>
            <p>$499 / month</p>
            <p>5–10 leads</p>
          </div>

          <div style={styles.cardHighlight}>
            <h3>Pro</h3>
            <p>$999 / month</p>
            <p>15–30 leads</p>
            <p>Priority booking</p>
          </div>

          <div style={styles.card}>
            <h3>Elite</h3>
            <p>$1999 / month</p>
            <p>High volume + exclusivity</p>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <a href="/apply" style={styles.primaryBtn}>Start Getting Leads</a>
        </div>
      </section>

      {/* FAQ */}
      <section style={styles.sectionDark}>
        <h2 style={styles.h2}>FAQ</h2>

        <div style={styles.faq}>
          <p><b>Are the leads exclusive?</b><br />Yes — one contractor per territory.</p>
          <p><b>Do you guarantee jobs?</b><br />We guarantee qualified appointments, not closures.</p>
          <p><b>How fast do I get leads?</b><br />Usually within 24–72 hours after approval.</p>
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
    padding: "80px 20px",
  },

  h1: {
    fontSize: "48px",
    marginBottom: "15px",
  },

  h2: {
    fontSize: "32px",
    marginBottom: "20px",
    textAlign: "center",
  },

  subtext: {
    fontSize: "18px",
    maxWidth: "600px",
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
    padding: "60px 20px",
    background: "#0b1220",
  },

  sectionDark: {
    padding: "60px 20px",
    background: "#070b14",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
  },

  trust: {
    textAlign: "center",
    opacity: 0.6,
    paddingBottom: "40px",
  },
};
