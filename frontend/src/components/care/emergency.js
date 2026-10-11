export function normPhone(raw) {
  let d = (raw || "").replace(/[^0-9]/g, "");
  if (d.startsWith("0")) d = d.replace(/^0+/, "");
  if (d.length === 10) d = "91" + d;
  return d.length >= 11 ? d : "";
}

export function buildMessage(user, s) {
  const name = user?.name || "Someone I know";
  const regions = (s.regions || []).join(", ") || "unspecified area";
  const symptoms = (s.rel || []).filter((x) => !x.startsWith("None")).join(", ");
  return (
    `🚨 Pain Map emergency alert: ${name} may need urgent help right now. ` +
    `A serious (RED) situation was flagged — pain in ${regions}, severity ${s.sev}/10` +
    (symptoms ? `, symptoms: ${symptoms}` : "") +
    `. Please reach them or call emergency services immediately. (Automated alert — not a medical diagnosis.)`
  );
}

export function dedupe(videos) {
  const seen = new Set();
  return videos.filter((v) => (seen.has(v.id) ? false : seen.add(v.id)));
}

export function emergencyContacts(user) {
  return [
    { name: user?.emergency_contact_name, relation: user?.emergency_contact_relation, phone: normPhone(user?.emergency_contact_phone) },
    { name: user?.emergency_contact2_name, relation: user?.emergency_contact2_relation, phone: normPhone(user?.emergency_contact2_phone) },
  ].filter((c) => c.phone);
}

export const CALMING_REGIONS = ["head", "neck", "chest", "abdomen", "lower_back", "upper_back", "pelvis", "buttocks", "general"];
