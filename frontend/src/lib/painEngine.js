// Pain Map rule-based safety + pattern engine (ported from the prototype).
export const DESC = ["Sharp", "Dull ache", "Throbbing", "Burning", "Cramping", "Stabbing", "Tingling", "Pressure / tight", "Stiff", "Radiating"];
export const ONSET = ["Suddenly (seconds–minutes)", "Over hours", "Over days", "Gradually over weeks+", "I don't know"];
export const DUR = ["Under 1 day", "1–3 days", "4–14 days", "More than 2 weeks", "I don't know"];
export const PAT = ["Constant", "Comes and goes", "Getting worse", "Getting better", "I don't know"];
export const TRIG = ["Movement", "Resting", "Eating", "Breathing in", "Cough / sneeze", "Stress", "Lifting / injury", "Nothing obvious", "I don't know"];
export const REL = ["Fever", "Nausea / vomiting", "Shortness of breath", "Sweating", "Dizziness / fainting", "Numbness / tingling", "Weakness", "Swelling", "Redness / warmth", "Vision changes", "Confusion", "Stiff neck", "Pain spreading to arm / jaw", "Recent injury", "None of these"];
export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Unknown"];
export const RELATIONS = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Relative", "Doctor", "Neighbour", "Other"];

// region: [key, front name, back name, shape(e/r), x, y, w, h, pair?]
export const R = [
  ["head", "Head", "Back of head", "e", 100, 32, 22, 26],
  ["neck", "Neck", "Neck", "r", 91, 56, 18, 16],
  ["chest", "Chest", "Upper back", "r", 68, 74, 64, 48],
  ["abd", "Abdomen", "Lower back", "r", 72, 124, 56, 44],
  ["pel", "Pelvis / groin", "Buttocks", "r", 70, 170, 60, 32],
  ["sh", "Shoulder", "Shoulder", "e", 54, 84, 14, 12, 1],
  ["ua", "Upper arm", "Upper arm", "r", 38, 96, 16, 50, 1],
  ["fa", "Forearm", "Forearm", "r", 32, 148, 16, 50, 1],
  ["hand", "Hand", "Hand", "e", 40, 212, 9, 12, 1],
  ["th", "Thigh", "Thigh", "r", 72, 206, 25, 80, 1],
  ["kn", "Knee", "Back of knee", "e", 84, 294, 12, 10, 1],
  ["sn", "Shin", "Calf", "r", 74, 306, 21, 68, 1],
  ["ft", "Foot", "Foot", "e", 85, 392, 12, 9, 1],
];

export function regionsForView(view) {
  const back = view === "back";
  const out = [];
  R.forEach(([k, f, b, t, x, y, w, h, pair]) => {
    const sides = pair ? [0, 1] : [null];
    sides.forEach((sd) => {
      let X = x;
      if (sd === 1) X = t === "e" ? 200 - x : 200 - x - w;
      const side = sd === null ? "" : sd === 0 ? (back ? "Left " : "Right ") : (back ? "Right " : "Left ");
      const name = side + (back ? b : f);
      out.push({ id: k + (sd ?? ""), name, t, x: X, y, w, h });
    });
  });
  return out;
}

export const AQ = {
  head: ["Head or neck", ["Sensitive to light or noise", "Pain behind the eyes", "Worst headache of my life", "After a head injury", "None of these"]],
  chest: ["Chest", ["Worse when breathing in", "Worse when pressing on the area", "Burning after eating", "Feels like squeezing pressure", "None of these"]],
  abd: ["Belly or pelvis", ["Pain in lower right side", "Worse after eating", "Bloating or gas", "Burning when passing urine", "Blood in vomit or stool", "None of these"]],
  back: ["Back or spine", ["Pain goes down the leg", "Numbness in legs or groin", "Trouble controlling urine or stool", "After lifting or an awkward movement", "Worse in the morning", "None of these"]],
  limb: ["Arm, leg or joint", ["Cannot put weight on it or move it", "Looks bent or out of shape", "Swollen joint", "Clicking or locking", "After a fall or twist", "None of these"]],
};

export function groups(regions) {
  const g = regions.join(" ").toLowerCase();
  const o = [];
  if (/head|neck/.test(g)) o.push("head");
  if (/chest/.test(g)) o.push("chest");
  if (/abdomen|pelvis/.test(g)) o.push("abd");
  if (/(upper|lower) back|buttocks/.test(g)) o.push("back");
  if (/shoulder|arm|hand|thigh|knee|shin|calf|foot/.test(g)) o.push("limb");
  return o;
}

export function axAll(s) {
  return groups(s.regions).flatMap((k) => s["ax_" + k] || []);
}

export function analyse(s) {
  const rel = s.rel, reg = s.regions.join(" ").toLowerCase(), has = (x) => rel.includes(x);
  const age = +s.age, sev = s.sev, why = [];
  let lvl = "G";
  const up = (l, w) => { if (l === "R" || (l === "Y" && lvl === "G")) lvl = l; why.push(w); };
  const sudden = s.onset.startsWith("Suddenly"), chest = /chest/.test(reg), head = /head/.test(reg), abd = /abdomen/.test(reg);

  if (has("Shortness of breath") && (chest || has("Sweating") || has("Pain spreading to arm / jaw")))
    up("R", "Chest pain or pressure with breathlessness, sweating or spreading pain can be a heart emergency.");
  else if (chest && (has("Pain spreading to arm / jaw") || has("Sweating") || sev >= 7))
    up("R", "Severe or spreading chest pain needs urgent assessment.");
  if (has("Shortness of breath")) up("R", "Trouble breathing needs urgent care.");
  if (head && ((sudden && sev >= 7) || (has("Stiff neck") && has("Fever")) || has("Confusion") || has("Vision changes") || has("Weakness")))
    up("R", "This headache pattern (sudden and severe, stiff neck with fever, confusion, vision change or weakness) is a red flag.");
  if (has("Confusion") || (has("Dizziness / fainting") && sev >= 6)) up("R", "Confusion or fainting with pain is a red flag.");
  if (has("Weakness") && has("Numbness / tingling")) up("R", "Weakness with numbness can signal a nerve or stroke problem.");
  if ((abd && sev >= 8) || (abd && has("Fever") && has("Nausea / vomiting"))) up("R", "Severe belly pain, or pain with fever and vomiting, needs same-day care.");
  if (sev >= 9) up("R", "Pain at 9–10 out of 10 should be checked urgently.");
  if (sudden && sev >= 7) up("R", "Sudden, severe pain should be checked urgently.");

  const ax = axAll(s), hx = (v) => ax.includes(v);
  if (hx("Worst headache of my life")) up("R", 'A "worst headache of my life" is a red flag.');
  if (hx("After a head injury") && (has("Nausea / vomiting") || has("Confusion") || has("Dizziness / fainting") || sev >= 6))
    up("R", "Head pain after an injury with vomiting, confusion, dizziness or strong pain needs urgent checking.");
  if (hx("Feels like squeezing pressure") && chest) up(sev >= 6 ? "R" : "Y", "Squeezing chest pressure should be checked urgently.");
  if (hx("Blood in vomit or stool")) up("R", "Blood in vomit or stool needs urgent care.");
  if (hx("Pain in lower right side") && (has("Fever") || sev >= 6)) up("R", "Lower right belly pain with fever or strong pain needs same-day care.");
  if (hx("Numbness in legs or groin") || hx("Trouble controlling urine or stool")) up("R", "Back pain with numbness in the groin or legs, or trouble controlling urine or stool, is an emergency.");
  if (hx("Looks bent or out of shape")) up("R", "A limb that looks bent or out of shape needs urgent care.");

  if (lvl !== "R") {
    if (hx("Cannot put weight on it or move it") || (hx("Swollen joint") && hx("After a fall or twist")))
      up("Y", "A limb you cannot use, or a swollen joint after a fall, should be checked soon (it may need an X-ray).");
    if (hx("Pain goes down the leg")) up("Y", "Pain going down the leg can mean an irritated nerve. Get it checked if it lasts.");
    if (hx("Burning when passing urine")) up("Y", "Burning when passing urine can be a urine infection. Get it checked.");
    if (sev >= 5) up("Y", "Moderate to strong pain (" + sev + "/10).");
    if (s.dur.startsWith("More than")) up("Y", "Pain lasting over 2 weeks should be reviewed by a doctor.");
    if (has("Fever") || has("Swelling") || has("Redness / warmth") || has("Numbness / tingling")) up("Y", "Fever, swelling, redness or numbness alongside pain is worth getting checked.");
    if ((age < 5 || age >= 65) && sev >= 4) up("Y", "At this age, pain is safer to get checked early.");
    if (s.pat === "Getting worse") up("Y", "The pain is getting worse.");
    if (chest && lvl === "G") up("Y", "Any chest pain is worth a medical check.");
  }
  if (lvl === "G") why.push("No warning signs found from your answers.");

  const pat = [], d = s.desc.join(" ").toLowerCase() + " " + (s.text || "").toLowerCase();
  if (/sharp|stab/.test(d) && s.trig.some((t) => /Movement|Lifting/.test(t))) pat.push("Sharp pain that changes with movement is often linked to a muscle, joint or ligament strain.");
  if (/dull|stiff/.test(d)) pat.push("A dull ache or stiffness often comes from muscle tension, overuse or posture.");
  if (/throb/.test(d)) pat.push("Throbbing is often linked to inflammation, pressure or tension (common in headaches).");
  if (/burn|tingl/.test(d) || has("Numbness / tingling")) pat.push("Burning or tingling can mean an irritated nerve.");
  if (/cramp/.test(d)) pat.push("Cramping is often a muscle spasm or a digestive cause.");
  if (/pressure|tight/.test(d) && chest) pat.push("Pressure in the chest should always be taken seriously.");
  if (head) pat.push("Head pain is commonly tension, migraine, tiredness or dehydration.");
  if ((/back/.test(reg) && !/upper back/.test(reg)) || /lower back/.test(reg)) pat.push("Back pain is often from muscle strain or posture.");
  if (/knee|shin|calf|thigh|foot|shoulder|arm/.test(reg) && has("Recent injury")) pat.push("Pain in a limb or joint after an injury may be a sprain, strain or bruise.");
  if (abd && s.trig.includes("Eating")) pat.push("Belly pain related to eating often points to a digestive cause.");
  if (hx("Sensitive to light or noise")) pat.push("Sensitivity to light or noise with head pain often fits a migraine-type pattern.");
  if (hx("Burning after eating") && chest) pat.push("Burning after eating can be acid reflux, but chest pain should still be checked.");
  if (hx("Worse when breathing in") || hx("Worse when pressing on the area")) pat.push("Pain that changes with breathing or pressing often comes from chest wall muscles. Still get new chest pain checked.");
  if (hx("After lifting or an awkward movement")) pat.push("Back pain after lifting is commonly a muscle or ligament strain.");
  if (hx("Clicking or locking")) pat.push("Clicking or locking in a joint can come from cartilage or joint irritation.");
  if (hx("Bloating or gas")) pat.push("Bloating with belly pain often points to a digestive cause.");
  if (!pat.length) pat.push("Your answers do not match one clear pattern. A doctor can help narrow it down.");

  const next = {
    G: "Rest, keep track of changes, and use the diary. See a doctor if it lasts, worsens or new symptoms appear.",
    Y: "Book a doctor visit in the next few days. Share the summary below. Seek help sooner if it worsens.",
    R: "Contact a doctor or emergency service now. Do not wait or travel alone if you feel unwell.",
  }[lvl];

  return { lvl, why, pat, next };
}

export function summary(s, r) {
  return `PAIN MAP SUMMARY (${new Date().toLocaleDateString()})
Age: ${s.age} | Sex: ${s.sex}
Location: ${s.regions.join(", ")}
Feels like: ${s.desc.join(", ") || "-"}${s.text ? ' | "' + s.text + '"' : ""}
Severity: ${s.sev}/10
Onset: ${s.onset || "-"}
Duration: ${s.dur || "-"}
Pattern: ${s.pat || "-"}
Triggers: ${s.trig.join(", ") || "-"}
Other symptoms: ${s.rel.join(", ") || "-"}
Area-specific: ${axAll(s).join(", ") || "-"}
Safety level: ${{ G: "Green", Y: "Yellow", R: "Red" }[r.lvl]}
(Self-reported, not a diagnosis.)`;
}

export const LEVEL_LABEL = { G: "Green · Monitor", Y: "Yellow · See a doctor soon", R: "Red · Get help now" };
export const LEVEL_FULL = {
  G: "Green: monitor and keep track",
  Y: "Yellow: understand it and get care soon",
  R: "Red: get professional help now",
};
