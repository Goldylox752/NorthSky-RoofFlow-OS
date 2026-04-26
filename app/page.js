export default function Home() {
  return (
    <main style={styles.page}>

      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.h1}>
          Exclusive Roofing Leads & Booked Appointments On Demand
        </h1>

        <p style={styles.subtext}>
          RoofFlow delivers high-intent homeowners actively requesting roofing estimates in your area — so you stop chasing leads and start closing jobs.
        </p>

        <div style={styles.ctaRow}>
          <a href="/apply" style={styles.primaryBtn}>Get Roofing Leads</a>
          <a href="#how-it-works" style={styles.secondaryBtn}>How It Works</a>
        </div>

        <p style={styles.micro}>
          No shared leads. No cold traffic. Exclusive territories only.
        </p>
      </section>

      {/* TRUST */}
      <section style={styles.trust}>
        <p>
          Built for roofing contractors across Canada and the U.S. — focused on real homeowner demand, not clicks or form fills.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={styles.section}>
        <h2 style={styles.h2}>How RoofFlow Works</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>1. We Capture Local Demand</h3>
            <p>
              Homeowners actively searching for roofing services submit estimate requests in your area.
            </p>
          </div>

          <div style={styles.card}>
            <h3>2. We Filter & Qualify</h3>
            <p>
              Every lead is screened for intent, timeline, and location before it reaches you.
            </p>
          </div>

          <div style={styles.card}>
            <h3>3. You Get Booked Opportunities</h3>
            <p>
              Receive ready-to-book roofing appointments — not raw, unqualified inquiries.
            </p>
          </div>
        </div>
      </section>

      {/* POSITIONING */}
      <section style={styles.sectionDark}>
        <h2 style={styles.h2}>Why Contractors Switch to RoofFlow</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Google Ads</h3>
            <p>Pay per click with no guarantee of quality or intent.</p>
          </div>

          <div style={styles.card}>
            <h3>Lead Marketplaces</h3>
            <p>Shared leads sold to multiple contractors.</p>
          </div>

          <div style={styles.cardHighlight}>
            <h3>RoofFlow</h3>
            <p>Exclusive, high-intent homeowners requesting roofing estimates.</p>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Contractor Results</h2>

        <div style={styles.grid}>
          <div style={styles.testimonial}>
            “We stopped wasting time on junk leads. Every call has real intent.”
            <span> — Contractor, Alberta</span>
          </div>

          <div style={styles.testimonial}>
            “We started booking inspections within days of joining.”
            <span> — Roofing Business Owner</span>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATION */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Why RoofFlow Wins</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Intent-Based Leads</h3>
            <p>Only homeowners actively requesting roofing estimates.</p>
          </div>

          <div style={styles.card}>
            <h3>Exclusive Territories</h3>
            <p>Limited contractor access per region to reduce competition.</p>
          </div>

          <div style={styles.card}>
            <h3>Appointment-Ready</h3>
            <p>Designed for booked inspections, not raw lead lists.</p>
          </div>
        </div>
      </section>

      {/* SERVICE AREAS (SEO BOOST) */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Service Areas</h2>

        <div style={styles.grid}>
          <a href="/roofing-leads/edmonton">Roofing Leads Edmonton</a>
          <a href="/roofing-leads/calgary">Roofing Leads Calgary</a>
          <a href="/roofing-leads/leduc">Roofing Leads Leduc</a>
          <a href="/roofing-leads/red-deer">Roofing Leads Red Deer</a>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={styles.section}>
        <h2 style={styles.h2}>Simple Monthly Access</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Starter</h3>
            <p>$499 / month</p>
            <p>5–10 qualified requests</p>
          </div>

          <div style={styles.cardHighlight}>
            <h3>Growth</h3>
            <p>$999 / month</p>
            <p>15–30 booked opportunities</p>
          </div>

          <div style={styles.card}>
            <h3>Domination</h3>
            <p>$1,999 / month</p>
            <p>High-volume + exclusive territory control</p>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="/apply" style={styles.primaryBtn}>
            Apply for Access
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={styles.sectionDark}>
        <h2 style={styles.h2}>Frequently Asked Questions</h2>

        <div style={styles.faq}>
          <p><b>Are leads exclusive?</b><br />Yes — never shared with other contractors.</p>
          <p><b>Do you guarantee sales?</b><br />No — we deliver qualified opportunities, not closed deals.</p>
          <p><b>How fast do leads arrive?</b><br />Typically within 24–72 hours.</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={styles.hero}>
        <h2 style={styles.h2}>
          Ready to stop chasing leads?
        </h2>

        <a href="/apply" style={styles.primaryBtn}>
          Get Exclusive Roofing Leads
        </a>

        <p style={styles.micro}>
          Start receiving qualified roofing appointments in your area.
        </p>
      </section>

    </main>
  );
}
