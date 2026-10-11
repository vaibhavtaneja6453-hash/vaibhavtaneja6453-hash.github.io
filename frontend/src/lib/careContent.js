// Calming + self-care content shown on Yellow/Red results. Non-prescriptive and safe.

export const MANDALAS = [
  "https://static.prod-images.emergentagent.com/jobs/3c3db9a1-6a83-42be-a54b-4df1d88913e6/images/34e1e1d44412782e51a61a6ac25c480ba058fa59a8f004eacfbb3d065101c8a3.jpeg",
  "https://static.prod-images.emergentagent.com/jobs/3c3db9a1-6a83-42be-a54b-4df1d88913e6/images/d48fc3afe2b6d58fbcb06a79e98467896dcccaff9dfab5526ad3478ea17abf7e.jpeg",
  "https://static.prod-images.emergentagent.com/jobs/3c3db9a1-6a83-42be-a54b-4df1d88913e6/images/b6f74d49b4d011195196c58a5c1e852c771174c21b703cad201854b693d61a7e.jpeg",
];

export const RELIEF_VIDEOS = {
  head: [
    { id: "T64es5lGZr8", title: "5-minute neck & tension-headache relief" },
    { id: "m0vxH6r2xE8", title: "Home exercises for tension headaches" },
  ],
  chest: [
    { id: "X3ew7bGNpbA", title: "5-minute box breathing to calm down" },
    { id: "ZToicYcHIOU", title: "10-minute calming body scan" },
  ],
  abd: [
    { id: "G3eGUl48sjo", title: "Box breathing for calm & focus" },
    { id: "60Gnd8Wy0gE", title: "Soothing meditation music" },
  ],
  back: [
    { id: "WQ6p2ZDhCS8", title: "9-minute lower-back relief routine" },
    { id: "aMJER9zwIY8", title: "7-minute fast back relief" },
  ],
  limb: [
    { id: "3gbbjlQkWe4", title: "Gentle knee & joint mobility" },
    { id: "ikt6NME0k9E", title: "Beginner knee-strengthening" },
  ],
  general: [
    { id: "X3ew7bGNpbA", title: "5-minute box breathing" },
    { id: "60Gnd8Wy0gE", title: "Relaxing meditation music" },
  ],
};

export const HOME_REMEDIES = {
  head: [
    "Rest in a quiet, dimly lit room and close your eyes for a while.",
    "Sip water slowly — mild dehydration is a common headache trigger.",
    "Place a cool cloth on your forehead, or a warm one on the back of your neck.",
    "Loosen tight hair ties and gently massage your temples and neck.",
  ],
  chest: [
    "Stop any activity and sit upright in a comfortable, supported position.",
    "Loosen tight clothing and take slow, gentle breaths.",
    "Avoid eating, lying flat or exerting yourself until it settles.",
    "If it feels like reflux-type burning, sitting up and sipping water can help.",
  ],
  abd: [
    "Sip warm water slowly and rest in a comfortable position.",
    "Try lying on your side with knees drawn up to ease cramping.",
    "Avoid heavy, oily or spicy food until you feel better.",
    "A warm (not hot) compress on the belly can relax cramps.",
  ],
  back: [
    "Avoid strict bed rest — gentle movement and light walking help most back pain.",
    "Apply a warm compress or take a warm shower to relax the muscles.",
    "Keep good posture and support your lower back when sitting.",
    "Try the gentle stretches in the videos below, staying pain-free.",
  ],
  limb: [
    "Remember R.I.C.E: Rest, Ice (about 20 min), Compression and Elevation.",
    "Avoid putting full weight on the joint until the pain eases.",
    "Use a cool pack for a fresh injury; gentle heat for stiff, older aches.",
    "Move the joint slowly within a comfortable, pain-free range.",
  ],
  general: [
    "Pause, sit down and take slow, steady breaths.",
    "Drink some water and rest in a comfortable position.",
    "Note what makes the pain better or worse to tell your doctor.",
    "Use the calming mandala and breathing guide below to ease tension.",
  ],
};

export const RED_WAIT_TIPS = [
  "Stay as calm and still as you can — sit or lie in the position that is easiest to breathe in.",
  "Unlock your door and keep your phone beside you so help can reach you quickly.",
  "Do not drive yourself, and avoid eating or drinking until help arrives.",
  "If someone is nearby, ask them to stay with you until help comes.",
];

// Deep, body-part-specific assessment + remedies + relevant follow-along videos.
export const REGION_CONTENT = {
  head: {
    assess: "Head/scalp pain is most often tension, migraine, eye strain, dehydration or lack of sleep.",
    remedies: [
      "Rest in a quiet, dark room and close your eyes for a while.",
      "Sip water slowly — mild dehydration is a very common trigger.",
      "Cool cloth on the forehead, or a warm one on the back of the neck.",
      "Gently massage the temples, jaw and neck; loosen tight hair ties.",
    ],
    videos: [{ id: "T64es5lGZr8", title: "Neck & tension-headache relief (5 min)" }, { id: "m0vxH6r2xE8", title: "Home exercises for tension headaches" }],
  },
  neck: {
    assess: "Neck pain is usually muscle strain from posture, screens or sleeping position.",
    remedies: [
      "Keep screens at eye level and take a posture break every 30 minutes.",
      "Apply a warm compress to loosen tight neck muscles.",
      "Slow neck rotations and chin tucks within a pain-free range.",
      "Avoid sleeping on your stomach; use a supportive pillow.",
    ],
    videos: [{ id: "T64es5lGZr8", title: "5-minute neck pain relief" }, { id: "m0vxH6r2xE8", title: "Exercises for neck tension & headaches" }],
  },
  shoulder: {
    assess: "Shoulder pain often comes from rotator-cuff strain, posture or overuse.",
    remedies: [
      "Avoid overhead lifting until the pain settles.",
      "Warm compress before gentle movement; ice after activity if sore.",
      "Pendulum swings and cross-body stretches, staying pain-free.",
      "Keep the shoulder gently moving — total rest can stiffen it.",
    ],
    videos: [{ id: "IXf8N9tb88c", title: "5-minute shoulder pain relief" }, { id: "n31NiZuWmQ4", title: "10-minute shoulder mobility routine" }],
  },
  upper_arm: {
    assess: "Upper-arm / biceps pain is usually a muscle or biceps-tendon strain from lifting, pulling or overuse.",
    remedies: [
      "Rest from heavy lifting and gripping for a few days.",
      "Ice the front of the arm for about 15 minutes after activity.",
      "Once settled, do slow biceps stretches and light eccentric (slow-lowering) curls.",
      "Gentle self-massage along the biceps can ease tightness.",
    ],
    videos: [{ id: "hupVGQkI7pw", title: "Fix biceps tendon pain (follow along)" }, { id: "SOGea7fY9aM", title: "Biceps tendon rehab exercises" }],
  },
  forearm: {
    assess: "Forearm / elbow pain is often tendon overload ('tennis elbow') from repetitive gripping or typing.",
    remedies: [
      "Reduce repetitive gripping; check your desk and wrist posture.",
      "Wrist extensor and flexor stretches, 20–30 seconds each.",
      "Light eccentric wrist curls and gentle grip squeezes.",
      "Cross-friction self-massage along the forearm muscles.",
    ],
    videos: [{ id: "HmNo65rcP4U", title: "Tennis elbow / forearm pain relief" }, { id: "4vk3i22z3Ko", title: "Forearm & elbow stretches (Doctor Jo)" }],
  },
  hand: {
    assess: "Hand / wrist pain is commonly strain, repetitive use or joint irritation.",
    remedies: [
      "Rest the hand and avoid repetitive gripping or typing bursts.",
      "Gentle wrist and finger stretches; open and close the fist slowly.",
      "Cool pack for a fresh flare, gentle warmth for stiff aches.",
      "Keep the wrist in a neutral position while working.",
    ],
    videos: [{ id: "4vk3i22z3Ko", title: "Wrist & forearm stretches" }, { id: "C5yr4HNfQ-8", title: "Wrist pain relief exercises" }],
  },
  chest: {
    assess: "Any chest pain should be taken seriously. It can be muscle/rib strain or reflux — but heart causes must be ruled out.",
    remedies: [
      "Stop activity and sit upright, supported and calm.",
      "Loosen tight clothing and breathe slowly and gently.",
      "If it is reflux-type burning, sit up and sip water; avoid lying flat.",
      "Do not exert yourself — get new or severe chest pain checked.",
    ],
    videos: [{ id: "X3ew7bGNpbA", title: "Box breathing to stay calm (5 min)" }, { id: "ZToicYcHIOU", title: "10-minute calming body scan" }],
  },
  upper_back: {
    assess: "Upper-back pain is usually posture and muscle tension around the shoulder blades.",
    remedies: [
      "Sit tall; bring screens to eye level and take breaks.",
      "Warm compress between the shoulder blades.",
      "Shoulder-blade squeezes and gentle thoracic-extension stretches.",
      "Roll the shoulders and open the chest through the day.",
    ],
    videos: [{ id: "n31NiZuWmQ4", title: "Upper back & posture mobility" }, { id: "T64es5lGZr8", title: "Neck & upper-back relief" }],
  },
  abdomen: {
    assess: "Belly pain has many causes — often digestive (gas, indigestion, cramps).",
    remedies: [
      "Sip warm water slowly and rest in a comfortable position.",
      "Lie on your side with knees drawn up to ease cramps.",
      "Avoid heavy, oily or spicy food for now.",
      "A warm (not hot) compress on the belly can relax cramping.",
    ],
    videos: [{ id: "G3eGUl48sjo", title: "Gentle box breathing for calm" }, { id: "60Gnd8Wy0gE", title: "Soothing meditation music" }],
  },
  lower_back: {
    assess: "Lower-back pain is most often muscle or ligament strain and usually improves with gentle movement.",
    remedies: [
      "Avoid strict bed rest — keep gently moving and walk a little.",
      "Warm shower or compress to relax the muscles.",
      "Pelvic tilts, knee-to-chest and lumbar rotations, pain-free.",
      "Support your lower back when sitting; lift with your legs.",
    ],
    videos: [{ id: "WQ6p2ZDhCS8", title: "9-minute lower-back relief routine" }, { id: "aMJER9zwIY8", title: "7-minute fast back relief" }],
  },
  pelvis: {
    assess: "Pelvis / groin / hip pain can be muscle strain, hip-joint irritation or a groin pull.",
    remedies: [
      "Rest from sprinting, kicking or deep squats for now.",
      "Warm compress, then gentle hip-opening stretches.",
      "Hip rotations and a figure-4 (piriformis) stretch, pain-free.",
      "Avoid movements that pinch or sharply hurt the groin.",
    ],
    videos: [{ id: "3Ymjw7TSzrE", title: "Hip & hamstring mobility (follow along)" }, { id: "aMJER9zwIY8", title: "Lower back & hip relief" }],
  },
  buttocks: {
    assess: "Buttock pain often comes from the glute muscles or an irritated nerve (sciatica-type).",
    remedies: [
      "Avoid sitting for long stretches; stand and move regularly.",
      "Warm compress to the glute, then gentle stretching.",
      "Figure-4 / piriformis stretch and gentle knee-to-chest.",
      "If pain shoots down the leg, keep stretches gentle and get it checked.",
    ],
    videos: [{ id: "3Ymjw7TSzrE", title: "Glute, hip & piriformis stretches" }, { id: "WQ6p2ZDhCS8", title: "Lower-back & glute relief routine" }],
  },
  thigh: {
    assess: "Thigh pain is usually a hamstring or quad muscle strain from activity.",
    remedies: [
      "Rest, then gentle hamstring/quad stretches once the sharp pain eases.",
      "Ice for a fresh strain; gentle heat for ongoing tightness.",
      "Avoid sudden sprints or deep stretches that reproduce sharp pain.",
      "Light walking keeps blood flowing and aids recovery.",
    ],
    videos: [{ id: "3Ymjw7TSzrE", title: "15-minute hamstring flexibility" }, { id: "RCtMzDjL_Bo", title: "Unlock tight hamstrings (follow along)" }],
  },
  knee: {
    assess: "Knee pain often comes from the surrounding muscles, overuse or minor joint irritation.",
    remedies: [
      "Remember R.I.C.E: Rest, Ice, Compression, Elevation for a flare.",
      "Avoid deep squats and stairs until the pain eases.",
      "Gentle quad sets and straight-leg raises to support the knee.",
      "Keep moving within a comfortable, pain-free range.",
    ],
    videos: [{ id: "3gbbjlQkWe4", title: "Gentle knee & hip strengthening" }, { id: "ikt6NME0k9E", title: "Beginner knee-pain exercises" }],
  },
  shin_calf: {
    assess: "Shin / calf pain is often muscle tightness, cramp or overuse from walking or running.",
    remedies: [
      "For a cramp, gently stretch and massage the calf.",
      "Warm compress for tightness; ice a fresh strain.",
      "Standing calf and soleus stretches against a wall, heel down.",
      "Stay hydrated and ease back into activity gradually.",
    ],
    videos: [{ id: "kubv4YY6LYo", title: "Fix calf pain: stretches & exercises" }, { id: "fQeLWPhfRh4", title: "Calf stretch variations" }],
  },
  foot: {
    assess: "Foot / heel pain is commonly plantar fasciitis, arch strain or overuse.",
    remedies: [
      "Roll the arch over a bottle or ball for a few minutes.",
      "Seated plantar-fascia stretch: pull the toes back, hold 20–30 sec.",
      "Calf stretches against a wall to offload the heel.",
      "Wear supportive footwear; avoid barefoot on hard floors.",
    ],
    videos: [{ id: "N690s67xT5Y", title: "Plantar fasciitis / foot pain relief" }, { id: "5vq2F_ufgJE", title: "Foot & heel strengthening stretches" }],
  },
  general: {
    assess: "Let's look at what you told us and take safe, calming steps.",
    remedies: [
      "Pause, sit down and take slow, steady breaths.",
      "Drink some water and rest in a comfortable position.",
      "Note what makes the pain better or worse to tell your doctor.",
      "Use the calming mandala and breathing guide below to ease tension.",
    ],
    videos: [{ id: "X3ew7bGNpbA", title: "5-minute box breathing" }, { id: "60Gnd8Wy0gE", title: "Relaxing meditation music" }],
  },
};

export function regionKeys(regions) {
  const keys = [];
  const push = (k) => { if (!keys.includes(k)) keys.push(k); };
  (regions || []).forEach((rn) => {
    const r = rn.toLowerCase();
    if (r.includes("upper arm")) push("upper_arm");
    else if (r.includes("forearm")) push("forearm");
    else if (r.includes("shoulder")) push("shoulder");
    else if (r.includes("hand")) push("hand");
    else if (r.includes("neck")) push("neck");
    else if (r.includes("head")) push("head");
    else if (r.includes("chest")) push("chest");
    else if (r.includes("upper back")) push("upper_back");
    else if (r.includes("lower back")) push("lower_back");
    else if (r.includes("abdomen")) push("abdomen");
    else if (r.includes("pelvis") || r.includes("groin")) push("pelvis");
    else if (r.includes("buttocks")) push("buttocks");
    else if (r.includes("thigh")) push("thigh");
    else if (r.includes("knee")) push("knee");
    else if (r.includes("shin") || r.includes("calf")) push("shin_calf");
    else if (r.includes("foot")) push("foot");
  });
  return keys.length ? keys : ["general"];
}
