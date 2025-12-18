// script.js
const balanceCanvas = document.getElementById('shareCanvas');
const ctx = balanceCanvas.getContext('2d');
const historyList = document.getElementById('historyList');

/* ---------- AUTO LANGUAGE (BROWSER) ---------- */
const langCode = navigator.language.slice(0, 2);
const i18n = {
  en: {
    title: "Today’s Balance",
    hint: "Select your current state. UN will translate it into a balanced outfit direction.",
    subscribe: "Subscribe for Weekly Updates",
    compute: "Check Today’s Balance"
  },
  fr: {
    title: "Équilibre du Jour",
    hint: "Sélectionnez votre état actuel. UN traduit en équilibre vestimentaire.",
    subscribe: "S’abonner aux mises à jour",
    compute: "Voir l’équilibre"
  }
};
const T = i18n[langCode] || i18n.en;

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".input h2").innerText = T.title;
  document.querySelector(".section-hint").innerText = T.hint;
  document.querySelector("#subscribe h3").innerText = T.subscribe;
  document.querySelector(".compute").innerText = T.compute;
});

/* ---------- STYLE DATABASE ---------- */
const styleDatabase = {
  men: {
    Calm: {
      colors: ["Muted Green", "Soft Grey", "Off-White", "Navy", "Beige"],
      fabrics: {
        Casual: ["Soft cotton", "Light knit", "Linen"],
        Formal: ["Cotton shirt", "Wool blend", "Structured blazer"],
        Outdoor: ["Breathable cotton", "Soft fleece", "Layered cotton"]
      }
    },
    Stressed: {
      colors: ["Soft Blue", "Grey", "Beige", "Olive", "Charcoal"],
      fabrics: {
        Casual: ["Breathable cotton", "Soft knit"],
        Formal: ["Structured cotton", "Wool blazer"],
        Outdoor: ["Layered cotton", "Soft fleece"]
      }
    },
    Energetic: {
      colors: ["White", "Light Yellow", "Soft Orange", "Sky Blue", "Coral"],
      fabrics: {
        Casual: ["Light cotton", "Linen", "Soft jersey"],
        Formal: ["Cotton shirt", "Tailored trousers"],
        Outdoor: ["Breathable cotton", "Soft jacket"]
      }
    }
  },
  women: {
    Calm: {
      colors: ["Muted Green", "Soft Grey", "Off-White", "Lavender", "Blush"],
      fabrics: {
        Casual: ["Soft cotton", "Flowy linen", "Knit dress"],
        Formal: ["Silk blouse", "Structured blazer", "Tailored trousers"],
        Outdoor: ["Breathable cotton", "Layered linen", "Soft knit"]
      }
    },
    Stressed: {
      colors: ["Soft Blue", "Grey", "Beige", "Dusty Rose", "Charcoal"],
      fabrics: {
        Casual: ["Breathable cotton", "Soft knit"],
        Formal: ["Structured cotton", "Wool blazer"],
        Outdoor: ["Layered cotton", "Soft fleece"]
      }
    },
    Energetic: {
      colors: ["White", "Light Yellow", "Soft Orange", "Peach", "Sky Blue"],
      fabrics: {
        Casual: ["Light cotton", "Linen", "Flowy dress"],
        Formal: ["Silk blouse", "Tailored skirt", "Tailored trousers"],
        Outdoor: ["Breathable cotton", "Soft jacket"]
      }
    }
  },
  neutral: {
    Calm: {
      colors: ["Muted Green", "Soft Grey", "Off-White", "Beige", "Navy"],
      fabrics: {
        Casual: ["Soft cotton", "Light knit", "Linen"],
        Formal: ["Structured cotton", "Tailored blazer"],
        Outdoor: ["Breathable cotton", "Layered knit"]
      }
    },
    Stressed: {
      colors: ["Soft Blue", "Grey", "Beige", "Charcoal", "Olive"],
      fabrics: {
        Casual: ["Soft cotton", "Light knit"],
        Formal: ["Structured cotton", "Tailored blazer"],
        Outdoor: ["Layered cotton", "Soft fleece"]
      }
    },
    Energetic: {
      colors: ["White", "Light Yellow", "Soft Orange", "Sky Blue", "Peach"],
      fabrics: {
        Casual: ["Light cotton", "Flowy dress", "Linen"],
        Formal: ["Tailored shirt", "Tailored trousers"],
        Outdoor: ["Breathable cotton", "Soft jacket"]
      }
    }
  }
};

// Color HEX map for color boxes
const colorHexMap = {
  "Muted Green": "#8DA399",
  "Soft Grey": "#C0C0C0",
  "Off-White": "#F9F9F4",
  "Navy": "#1A3E6E",
  "Beige": "#D9C6B3",
  "Soft Blue": "#A3C4F3",
  "Grey": "#888888",
  "Olive": "#808000",
  "Charcoal": "#333333",
  "White": "#FFFFFF",
  "Light Yellow": "#FFF9C4",
  "Soft Orange": "#F5B995",
  "Sky Blue": "#87CEEB",
  "Coral": "#FF6F61",
  "Lavender": "#E6E6FA",
  "Blush": "#F4C2C2",
  "Dusty Rose": "#DCAE96",
  "Peach": "#FFDAB9"
};

/* ---------- CLIMATE (NO API) ---------- */
function inferClimate(mood, energy, activity) {
  if (activity === "Outdoor" && energy === "High") return "Breathable layers recommended";
  if (energy === "Low" || mood === "Tired") return "Soft layering suggested";
  if (activity === "Formal") return "Structured layers suggested";
  return "Season-neutral balance";
}

/* ---------- SCROLL ---------- */
function scrollToApp() {
  document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
}

/* ---------- THEME TOGGLE ---------- */
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem("un_theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}

(function restoreTheme() {
  const saved = localStorage.getItem("un_theme");
  if (saved === "light") document.body.classList.add("light");
})();

/* ---------- RANDOM COLOR PICKER ---------- */
function getRandomColors(arr, n) {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < n; i++) {
    if (copy.length === 0) break;
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

/* ---------- MAIN GENERATOR ---------- */
function generate() {
  const name = document.getElementById('userName').value || "You";
  const rawMood = document.getElementById('mood').value || "Calm";
  const energy = document.getElementById('energy').value || "Medium";
  const activity = document.getElementById('activity').value || "Casual";
  const gender = document.getElementById('gender').value || "neutral";

  /* ---------- MOOD NORMALIZER (SAFE FALLBACK) ---------- */
  const moodFallbackMap = {
    Tired: "Calm",
    Anxious: "Stressed",
    Focused: "Calm"
  };
  const mood = moodFallbackMap[rawMood] || rawMood;

  const styleSet =
    (styleDatabase[gender] && styleDatabase[gender][mood]) ||
    (styleDatabase.neutral && styleDatabase.neutral[mood]);

  const colors = getRandomColors(styleSet.colors, 3);
  const fabrics = styleSet.fabrics[activity] || styleSet.fabrics["Casual"];
  const fabric = fabrics[Math.floor(Math.random() * fabrics.length)];

  const climateNote = inferClimate(mood, energy, activity);

  drawCanvas(name, colors, fabric, climateNote);
  saveToHistory(mood, colors, fabric);

  /* ---------- NON-BLOCKING LOG TO GOOGLE SHEET ---------- */
  if (window.UN_CONFIG?.SHEET_ENDPOINT) {
    fetch(window.UN_CONFIG.SHEET_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        key: window.UN_CONFIG.API_KEY,
        type: "log",
        name,
        mood,
        energy,
        activity,
        colors,
        fabric,
        climate: climateNote
      })
    })
    .catch(() => {
      // silent fail – never break canvas rendering
    });
  }

  document.querySelector(".share").classList.add("visible");
  setTimeout(() => {
    document.querySelector(".share").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 300);
}


/* ---------- DRAW CANVAS ---------- */
function drawCanvas(name, colors, fabric, climateNote) {
  let y = 36;
  const lineGap = 22;
  balanceCanvas.width = 600;
  balanceCanvas.height = 600;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 600, 600);
  bg.addColorStop(0, "#0b0b0b");
  bg.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 600, 600);

  // Border
  ctx.strokeStyle = "#444";
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(14, 14, 572, 572);
  ctx.setLineDash([]);

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";

  ctx.font = "22px UN";
  ctx.fillText("U ⚡︎ N", 300, y); y += 28;

  ctx.font = "18px UN";
  ctx.fillText("TODAY’S BALANCE", 300, y); y += 36;

  ctx.font = "14px UN";
  ctx.fillText("Color Palette for today's outfit", 300, y); y += lineGap;

  // Draw color boxes
  const boxSize = 16;
  const spacing = 80;
  let startX = 300 - ((colors.length - 1) * spacing) / 2;

  colors.forEach((color, idx) => {
    // Box
    ctx.fillStyle = colorHexMap[color] || "#fff";
    ctx.fillRect(startX + idx * spacing - boxSize / 2, y, boxSize, boxSize);
    // Name
    ctx.fillStyle = "#fff";
    ctx.font = "16px UN";
    ctx.fillText(color, startX + idx * spacing, y + 28);
  });

  y += 60;

  ctx.font = "14px UN";
  ctx.fillText("Type of Outfit", 300, y); y += lineGap;

  ctx.font = "16px UN";
  ctx.fillText(fabric, 300, y); y += 30;

  ctx.font = "14px UN";
  ctx.fillText(climateNote, 300, y); y += 26;

  ctx.fillText("Designed to neutralize pressure without adding noise.", 300, y); y += 22;
  ctx.fillText("— The 0 Effect", 300, y); y += 28;

  ctx.beginPath();
  ctx.moveTo(120, y);
  ctx.lineTo(480, y);
  ctx.stroke();

  y += 26;
  ctx.font = "13px UN";
  ctx.fillText(`Made for ${name} with balance`, 300, y); y += 18;
  ctx.fillText("@untitledneedleworks #upliftnull", 300, y);

  // Trim canvas
  const finalHeight = y + 28;
  const img = ctx.getImageData(0, 0, 600, finalHeight);
  balanceCanvas.height = finalHeight;
  ctx.putImageData(img, 0, 0);

  document.querySelector(".share").classList.add("visible");
  setTimeout(() => {
    document.querySelector(".share").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 300);
}

// Save image locally
document.getElementById('saveBtn').addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = "TodaysBalance.png";
    a.href = balanceCanvas.toDataURL("image/png");
    a.click();
});

// WhatsApp share
document.getElementById('whatsappBtn').addEventListener('click', () => {
    const text = "Check out my Today's Balance!";
    const whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappURL, "_blank");
});

// Twitter/X share
document.getElementById('twitterBtn').addEventListener('click', () => {
    const text = encodeURIComponent("Check out my Today's Balance! #upliftnull @untitledneedleworks");
    const url = encodeURIComponent(window.location.href);
    const twitterURL = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterURL, "_blank");
});

// Instagram share (opens profile)
document.getElementById('instagramBtn').addEventListener('click', () => {
    window.open("https://www.instagram.com/untitledneedleworks/", "_blank");
});

/* ---------- HISTORY ---------- */
function saveToHistory(mood, colors, fabric) {
  const entry = `${mood} — ${colors[0]} / ${fabric}`;
  let history = JSON.parse(localStorage.getItem("un_history")) || [];
  history.unshift(entry);
  history = history.slice(0, 3);
  localStorage.setItem("un_history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  (JSON.parse(localStorage.getItem("un_history")) || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}
renderHistory();

/* ---------- SAVE ---------- */
document.getElementById('saveBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = "TodaysBalance.png";
  a.href = balanceCanvas.toDataURL("image/png");
  a.click();
});

/* ---------- SUBSCRIBE ---------- */
function subscribeEmail() {
  const emailInput = document.getElementById('email');
  const email = emailInput.value.trim();
  if (!email || !email.includes("@")) {
    alert("Enter a valid email");
    return;
  }

  fetch(window.UN_CONFIG.SHEET_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      key: window.UN_CONFIG.API_KEY,
      type: "subscribe",
      email
    })
  })
  .then(res => res.json())
  .then(() => {
    alert("Subscribed! UN will stay balanced.");
    emailInput.value = "";
  })
  .catch(() => {
    alert("Subscription failed. Try again.");
  });
}
