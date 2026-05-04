import LeadForm from "@/components/LeadForm";
import { supabase } from "@/lib/supabase";

export default async function CityPage({ params }) {
  const city = decodeURIComponent(params.city).replace(/-/g, " ");
  const cityKey = city.toLowerCase();

  // =====================
  // FETCH CITY FROM SUPABASE
  // =====================
  const { data: cityData, error } = await supabase
    .from("cities")
    .select("*")
    .eq("city", cityKey)
    .single();

  // fallback if city doesn't exist yet
  const fallbackCity = {
    city: cityKey,
    tier: "basic",
    max_contractors: 2,
    active_contractors: [],
    base_price: 9900,
    lead_multiplier: 1,
  };

  const data = cityData || fallbackCity;

  const spotsLeft =
    data.max_contractors - (data.active_contractors?.length || 0);

  const source = `seo_${cityKey.replace(/\s+/g, "_")}`;

  return (
    <main style={styles.page}>
      <h1 style={styles.h1}>Roofing Leads in {city}</h1>

      <p style={styles.subtext}>
        Live marketplace for roofing demand in {city}.
        Availability updates in real time.
      </p>

      {/* 🏙 LIVE CITY MARKET */}
      <div style={styles.marketBox}>
        <h3>🏙 {city} Territory</h3>

        <p>
          <b>Tier:</b> {data.tier.toUpperCase()}
        </p>

        <p>
          <b>Spots left:</b> {spotsLeft}
        </p>

        <p>
          <b>Base value:</b> ${data.base_price / 100}/mo
        </p>

        <p>
          <b>Lead multiplier:</b> {data.lead_multiplier}x
        </p>
      </div>

      {/* 🧲 LEAD FORM */}
      <div style={styles.formBox}>
        <LeadForm source={source} city={city} />
      </div>

      {/* 💰 CTA */}
      <div style={styles.ctaBox}>
        <h2>Claim {city} Territory</h2>
        <p>Only {spotsLeft} contractor slots remaining.</p>

        <a href="/pricing" style={styles.ctaButton}>
          Secure City Access
        </a>
      </div>

      {/* TRUST */}
      <div style={styles.trust}>
        <p>✔ Live availability from Supabase</p>
        <p>✔ Verified contractors only</p>
        <p>✔ Real-time lead distribution</p>
      </div>
    </main>
  );
}