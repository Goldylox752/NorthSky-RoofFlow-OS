export function scoreLead({ email, phone, answers = {} }) {
  let score = 0;

  // EMAIL QUALITY
  if (email?.includes("@gmail.com")) score += 10;
  if (email?.includes("@company") || email?.includes(".ca") || email?.includes(".com")) score += 20;

  // PHONE VALIDITY
  if (phone && phone.replace(/\D/g, "").length >= 10) score += 25;

  // BUSINESS QUALITY SIGNALS (add later from form)
  if (answers.monthly_jobs === "10+") score += 30;
  if (answers.lead_spend === "$500+") score += 25;

  // 🚨 NEGATIVE FILTERS (tire kicker detection)
  if (answers.monthly_jobs === "0-5") score -= 40;
  if (answers.lead_spend === "$0") score -= 50;

  return score;
}
