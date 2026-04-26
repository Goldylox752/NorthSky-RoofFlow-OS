"use client";

import { useState, useMemo } from "react";

export default function Apply() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("growth");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSubmit, setLastSubmit] = useState(0);
  const [website, setWebsite] = useState(""); // honeypot

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);

  const disposableDomains = new Set([
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "yopmail.com",
    "trashmail.com",
  ]);

  const isDisposableEmail = (email) => {
    const domain = email.split("@")[1];
    return disposableDomains.has(domain);
  };

  const normalizePhone = (v) => v.replace(/\D/g, "");

  const formatPhone = (value) => {
    const digits = normalizePhone(value).slice(0, 10);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const cleanedPhone = useMemo(() => normalizePhone(phone), [phone]);
  const isValidPhone = cleanedPhone.length === 10;

  const leadScore = useMemo(() => {
    let score = 0;

    if (isValidEmail(email)) score += 40;
    if (isValidPhone) score += 40;

    const domain = email.split("@")[1];
    const trustedDomains = ["gmail.com", "yahoo.com", "hotmail.com"];

    if (!trustedDomains.includes(domain)) score += 10;
    if (email.startsWith("info@") || email.startsWith("admin@")) score += 10;

    return Math.min(score, 100);
  }, [email, isValidPhone]);

  const isQualified = leadScore >= 80;

  const handleNext = () => {
    setError("");

    if (!isValidEmail(email)) {
      return setError("Enter a valid business email.");
    }

    if (isDisposableEmail(email)) {
      return setError("Disposable emails are not allowed.");
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    const now = Date.now();
    if (now - lastSubmit < 10000) {
      setLoading(false);
      return setError("Please wait before submitting again.");
    }
    setLastSubmit(now);

    if (website) {
      setLoading(false);
      return setError("Bot detected.");
    }

    if (!isValidPhone) {
      setLoading(false);
      return setError("Enter a valid phone number.");
    }

    if (!isQualified) {
      setLoading(false);
      return setError("Application not approved.");
    }

    try {
      const payload = {
        email,
        phone: cleanedPhone,
        plan,
        lead_score: leadScore,
        source: "apply_form",
      };

      // Lead capture (non-blocking)
      try {
        await fetch("/api/leads/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn("Lead capture failed:", err);
      }

      // Checkout
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed");
      }

      if (!data?.url) {
        throw new Error("Missing checkout URL");
      }

      window.location.href = data.url;

    } catch (err) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-8">

        {/* Honeypot */}
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />

        <h1 className="text-2xl font-bold">
          Apply for Exclusive Roofing Leads
        </h1>

        <p className="text-sm text-gray-600 mt-2">
          Limited contractor access per territory.
        </p>

        <p className={`mt-3 text-sm font-bold ${isQualified ? "text-green-600" : "text-red-500"}`}>
          {isQualified ? "Pre-Qualified" : "Qualification Required"}
        </p>

        <p className="text-xs text-gray-500 mt-1">Step {step} of 2</p>

        <div className="mt-5">
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="starter">Starter — $499/mo</option>
            <option value="growth">Growth — $999/mo</option>
            <option value="domination">Domination — $1999/mo</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {step === 1 && (
            <>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Business Email"
                className="w-full border rounded-lg p-2"
              />

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-black text-white py-2 rounded-lg"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="Phone Number"
                className="w-full border rounded-lg p-2"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg"
              >
                {loading ? "Processing..." : "Secure My Territory"}
              </button>
            </>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

        </form>
      </div>
    </div>
  );
}