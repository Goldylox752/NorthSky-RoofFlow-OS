/* =========================================
   NORTHSKY AI - MINIMAL WORKING ENGINE
   index.js (SAFE + EXECUTES IN BROWSER)
========================================= */

/* ========== CONFIG ========== */
const CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_KEY: "YOUR_SUPABASE_ANON_KEY",
  DRONE_URL: "https://northsky-drones.vercel.app"
};

let supabase = null;

/* ========== INIT ========== */
(function init() {

  // wait until supabase script exists
  if (window.supabase) {
    supabase = window.supabase.createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_KEY
    );
    console.log("✅ Supabase connected");
  } else {
    console.warn("⚠️ Supabase not loaded");
  }

  // expose functions globally (THIS is what fixes “not committing”)
  window.unlockAccess = unlockAccess;
  window.submitLead = submitLead;

  console.log("🚀 Index.js running");
})();


/* ========== SESSION ========== */
function sessionId() {
  let id = localStorage.getItem("session_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("session_id", id);
  }

  return id;
}


/* ========== PAYWALL ========== */
function isPaid() {
  return localStorage.getItem("paid_access") === "true";
}

function unlockAccess() {
  localStorage.setItem("paid_access", "true");

  const paywall = document.getElementById("paywall");
  const app = document.getElementById("app");

  if (paywall) paywall.style.display = "none";
  if (app) app.classList.remove("hidden");

  console.log("🔓 Access unlocked");
}


/* ========== LEAD SUBMIT (FIXED DOM HOOKS) ========== */
async function submitLead() {

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const cityEl = document.getElementById("city");

  if (!nameEl || !emailEl || !cityEl) {
    alert("Missing form fields in HTML");
    return;
  }

  const name = nameEl.value;
  const email = emailEl.value;
  const city = cityEl.value;

  if (!name || !email || !city) {
    alert("Fill all fields");
    return;
  }

  const payload = {
    name,
    email,
    city,
    session_id: sessionId(),
    created_at: new Date().toISOString()
  };

  console.log("📩 Lead captured", payload);

  // save to supabase (if connected)
  if (supabase) {
    await supabase.from("leads").insert([payload]);
  }

  // redirect
  setTimeout(() => {
    window.location.href = CONFIG.DRONE_URL;
  }, 600);
}


/* ========== AUTO CHECK ON LOAD ========== */
window.addEventListener("load", () => {

  console.log("📦 index.js loaded");

  if (isPaid()) {
    const paywall = document.getElementById("paywall");
    const app = document.getElementById("app");

    if (paywall) paywall.style.display = "none";
    if (app) app.classList.remove("hidden");
  }
});