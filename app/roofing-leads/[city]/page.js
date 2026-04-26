export async function generateMetadata({ params }) {
  const city = params.city.replace(/-/g, " ");

  return {
    title: `Roofing Leads in ${city} | Exclusive Contractor Appointments`,
    description: `Get exclusive roofing leads in ${city}. RoofFlow delivers high-intent homeowners actively requesting roofing estimates in your area.`,
  };
}

export default function CityPage({ params }) {
  const city = params.city.replace(/-/g, " ");

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1>Exclusive Roofing Leads in {city}</h1>

      <p>
        Looking for roofing leads in {city}? RoofFlow delivers homeowners actively
        requesting roofing estimates — not cold traffic, shared lists, or recycled leads.
      </p>

      <h2>How Roofing Leads Work in {city}</h2>
      <ul>
        <li>Homeowners in {city} request roofing estimates</li>
        <li>We filter for intent, urgency, and location</li>
        <li>You receive qualified, appointment-ready opportunities</li>
      </ul>

      <h2>Why Contractors in {city} Choose RoofFlow</h2>
      <p>
        Traditional lead generation in {city} relies on ads and shared lead lists.
        RoofFlow focuses on high-intent homeowners already looking to book inspections.
      </p>

      <h2>What You Get</h2>
      <ul>
        <li>Exclusive territory access in {city}</li>
        <li>No shared or resold leads</li>
        <li>Consistent inbound homeowner demand</li>
      </ul>

      <h2>Get Roofing Leads in {city}</h2>
      <p>
        Start receiving qualified roofing opportunities in {city} within days.
      </p>

      <a href="/apply">Apply for Access in {city}</a>
    </main>
  );
}
