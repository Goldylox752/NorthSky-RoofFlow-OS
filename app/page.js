export default function Home() {
  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.h1}>
          We Book High-Intent Roofing Jobs for You
        </h1>

        <p style={styles.subtext}>
          RoofFlow generates, filters, and delivers qualified homeowners
          directly into your pipeline — so you close jobs, not chase leads.
        </p>

        <div style={styles.ctaRow}>
          <a href="/apply" style={styles.primaryBtn}>Apply Now</a>
          <a href="#pricing" style={styles.secondaryBtn}>See Pricing</a>
        </div>

        <p style={styles.micro}>
          No junk leads. No shared lists. No wasted ad spend.
        </p>
      </section>

      {/* TRUST */}
      <section style={styles.trust}>
        <p>Trusted by roofing contractors across North America</p>
      </section>

      {/* FEATURES */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Why Contractors Use RoofFlow</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Pre-Qualified Homeowners</h3>
            <p>
              Every lead is filtered by intent, budget, and urgency before
              it ever hits your dashboard.
            </p>
          </div>

          <div style={styles.card}>
            <h3>Booked Appointments</h3>
            <p>
              We don’t sell raw leads — we deliver scheduled inspections
              and ready-to-buy homeowners.
            </p>
          </div>

          <div style={styles.card}>
            <h3>Exclusive Territory</h3>
            <p>
              One contractor per area. No competition, no bidding wars.
            </p>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section style={styles.sectionDark}>
        <h2 style={styles.h2}>Real Contractor Results</h2>

        <div style={styles.grid}>
          <div style={styles.testimonial}>
            “Closed 7 jobs in the first month. Easily the highest quality leads I’ve had.”
            <span> — Roofing Contractor, Texas</span>
          </div>

          <div style={styles.testimonial}>
            “Every call is serious now. No more tire-kickers wasting time.”
            <span> — Roofing Company Owner</span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={styles.section}>
        <h2 style={styles.h2}>Simple Monthly Pricing</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Starter</h3>
            <p>$499 / month</p>
            <p>5–10 qualified appointments</p>
          </div>

          <div style={styles.cardHighlight}>
            <h3>Growth</h3>
            <p>$999 / month</p>
            <p>15–30 booked appointments</p>
            <p>Priority routing</p>
          </div>

          <div style={styles.card}>
            <h3>Domination</h3>
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
            Usually within 24–72 hours after approval.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={styles.hero}>
        <h2 style={styles.h2}>Ready to fill your schedule?</h2>
        <a href="/apply" style={styles.primaryBtn}>
          Apply & Get Leads
        </a>
      </section>
    </main>
  );
}
