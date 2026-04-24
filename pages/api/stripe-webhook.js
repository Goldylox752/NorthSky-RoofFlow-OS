import { PLAN_RULES } from "../../engine/planRules";

function getPlanFromSession(session) {
  const linkId =
    session.payment_link ||
    session.payment_link_id ||
    session.metadata?.plan ||
    session.metadata?.link_id;

  const match = Object.entries(PLAN_RULES).find(
    ([plan, config]) => config.stripeLink === linkId
  );

  return match ? match[0] : "starter";
}