export function routeLead(lead, contractors = []) {
  if (!contractors.length) return null;

  // simple scoring: lowest load wins
  const sorted = contractors.sort(
    (a, b) => (a.activeLeads || 0) - (b.activeLeads || 0)
  );

  return sorted[0];
}