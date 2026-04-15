const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// -----------------------------
// SEARCH TERMS (HIGH INTENT)
// -----------------------------
const SEARCHES = [
  "roofing contractor",
  "roof repair",
  "emergency roof repair",
  "storm damage roof repair",
  "roof replacement"
];

// Example cities (expand later dynamically)
const CITIES = [
  "Toronto",
  "Calgary",
  "Edmonton",
  "Vancouver",
  "Chicago",
  "Dallas",
  "New York"
];

// -----------------------------
// FETCH GOOGLE PLACES
// -----------------------------
async function fetchPlaces(query) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;

  const { data } = await axios.get(url, {
    params: {
      query,
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });

  return data.results || [];
}

// -----------------------------
// GET DETAILS (phone etc.)
// -----------------------------
async function getPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json`;

  const { data } = await axios.get(url, {
    params: {
      place_id: placeId,
      fields: "name,formatted_phone_number,formatted_address,rating,user_ratings_total",
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });

  return data.result;
}

// -----------------------------
// SIMPLE LEAD SCORING
// -----------------------------
function scoreLead(place) {
  let score = 50;

  if (place.rating >= 4.5) score += 20;
  if (place.user_ratings_total > 50) score += 20;
  if (place.user_ratings_total > 200) score += 10;

  return Math.min(score, 100);
}

// -----------------------------
// MAIN ENGINE
// -----------------------------
async function runGoogleLeadEngine() {
  for (const city of CITIES) {
    for (const search of SEARCHES) {
      const query = `${search} in ${city}`;

      console.log("Searching:", query);

      const places = await fetchPlaces(query);

      for (const place of places) {
        const details = await getPlaceDetails(place.place_id);

        if (!details) continue;

        const score = scoreLead(details);

        const lead = {
          name: details.name,
          phone: details.formatted_phone_number || null,
          address: details.formatted_address,
          rating: details.rating || null,
          reviews_count: details.user_ratings_total || 0,
          category: search,
          source: "google_maps",
          score,
          created_at: new Date().toISOString()
        };

        // skip weak leads
        if (score < 60) continue;

        // prevent duplicates
        const { data: existing } = await supabase
          .from("leads")
          .select("id")
          .eq("phone", lead.phone)
          .single();

        if (!existing) {
          await supabase.from("leads").insert([lead]);
          console.log("Saved lead:", lead.name, lead.score);
        }
      }
    }
  }
}

module.exports = { runGoogleLeadEngine };
