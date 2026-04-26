export default function Home() {
  return (
    <main style={styles.page}>

      {/* HERO — OUTCOME-FIRST POSITIONING */}
      <section style={styles.hero}>
        <h1 style={styles.h1}>
          Fill Your Roofing Schedule With Qualified Homeowner Requests
        </h1>

        <p style={styles.subtext}>
          RoofFlow is a demand generation system for roofing contractors. We source, filter, and deliver homeowners actively requesting roofing estimates directly into your pipeline — so you spend less time chasing and more time closing.
        </p>

        <div style={styles.ctaRow}>
          <a href="/apply" style={styles.primaryBtn}>Get Qualified Leads</a>
          <a href="#how-it-works" style={styles.secondaryBtn}>How It Works</a>
        </div>

        <p style={styles.micro}>
          Exclusive territories. Pre-qualified homeowners. No shared lists.
        </p>
      </section>

      {/* TRUST STRIP — LEGITIMACY SIGNAL */}
      <section style={styles.trust}>
        <p>
          Built for roofing contractors across North America — focused on high-intent homeowner demand, not cold traffic or ad clicks.
        </p>
      </section>

      {/* HOW IT WORKS — CRITICAL TRUST LAYER */}
      <section id="how-it-works" style={styles.section}>
        <h2 style={styles.h2}>How RoofFlow Works</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>1. We Capture Demand</h3>
            <p>
              Homeowners actively request roofing estimates through targeted acquisition channels.
            </p>
          </div>

          <div style={styles.card}>
            <h3>2. We Filter & Qualify</h3>
            <p>
              Each request is screened for intent, urgency, and service location before approval.
            </p>
          </div>

          <div style={styles.card}>
            <h3>3. You Receive Booked Opportunities</h3>
            <p>
              Qualified homeowner appointments are delivered directly into your pipeline.
            </p>
          </div>
        </div>
      </section>

      {/* WHY IT BEATS ADS — POSITIONING LAYER */}
      <section style={styles.sectionDark}>
        <h2 style={styles.h2}>Why Contractors Switch From Ads & Lead Lists</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Google Ads</h3>
            <p>
              High cost per click, unpredictable lead quality, and heavy competition.
            </p>
          </div>

          <div style={styles.card}>
            <h3>Facebook Leads</h3>
            <p>
              Low intent homeowners and inconsistent purchase urgency.
            </p>
          </div>

          <div style={styles.cardHighlight}>
            <h3>RoofFlow</h3>
            <p>
              Homeowners already requesting roofing estimates — filtered before delivery.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST + EARLY PROOF */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Early Contractor Results</h2>

        <div style={styles.grid}>
          <div style={styles.testimonial}>
            “We stopped wasting time on junk leads. Every call is now serious intent.”
            <span> — Roofing Contractor, Alberta</span>
          </div>

          <div style={styles.testimonial}>
            “Within days we were booking inspections instead of chasing homeowners.”
            <span> — Roofing Business Owner</span>
          </div>
        </div>

        <p style={{ textAlign: "center", opacity: 0.7, marginTop: 15 }}>
          Pilot program results from active contractor partners.
        </p>
      </section>

      {/* VALUE SYSTEM EXPLAINER (TRUST ENGINE) */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Why RoofFlow Is Different</h2>

        <div style styles.grid}>
          <div style={styles.card}>
            <h3>Intent-Based Leads</h3>
            <p>We don’t sell clicks or forms — only verified homeowner intent.</p>
          </div>

          <div style={styles.card}>
            <h3>Exclusive Territories</h3>
            <p>Each region is limited to reduce competition and improve close rates.</p>
          </div>

          <div style={styles.card}>
            <h3>Appointment-Ready Opportunities</h3>
            <p>We prioritize real inspection opportunities, not raw inquiries.</p>
          </div>
        </div>
      </section>

      {/* PRICING — SIMPLIFIED TRUST FORMAT */}
      <section id="pricing" style={styles.section}>
        <h2 style={styles.h2}>Simple Monthly Access</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Starter</h3>
            <p>$499 / month</p>
            <p>5–10 qualified homeowner requests</p>
          </div>

          <div style={styles.cardHighlight}>
            <h3>Growth</h3>
            <p>$999 / month</p>
            <p>15–30 booked roofing opportunities</p>
            <p>Priority territory routing</p>
          </div>

          <div style={styles.card}>
            <h3>Domination</h3>
            <p>$1,999 / month</p>
            <p>High-volume + exclusive regional access</p>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="/apply" style={styles.primaryBtn}>
            Apply for Access
          </a>
        </div>
      </section>

      {/* FAQ — OBJECTION HANDLING */}
      <section style={styles.sectionDark}>
        <h2 style={styles.h2}>Frequently Asked Questions</h2>

        <div style={styles.faq}>
          <p>
            <b>Are leads exclusive?</b><br />
            Yes — we limit contractor access per territory to reduce competition.
          </p>

          <p>
            <b>Do you guarantee sales?</b><br />
            We guarantee qualified homeowner appointments, not closed deals.
          </p>

          <p>
            <b>How fast do leads arrive?</b><br />
            Typically within 24–72 hours after activation.
          </p>
        </div>
      </section>

      {/* FINAL CTA — STRONG CLOSE */}
      <section style={styles.hero}>
        <h2 style={styles.h2}>
          Ready to put your schedule on autopilot?
        </h2>

        <a href="/apply" style={styles.primaryBtn}>
          Get Access Now
        </a>

        <p style={styles.micro}>
          Start receiving qualified roofing opportunities in your territory.
        </p>
      </section>

    </main>
  );
}
