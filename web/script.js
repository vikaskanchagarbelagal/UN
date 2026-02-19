/* ================= OUR STORY SECTION ================== */
// Scroll fade-in animation
const fadeElements = document.querySelectorAll('.fade-in');

function handleScroll() {
  fadeElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);


/* ================= OUR PRODUCTS SECTION ================= */
(function attachCardHandlers(){
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    // click/tap flips
    card.addEventListener('click', e => {
      e.stopPropagation();
      card.classList.toggle('flipped');
      const pressed = card.classList.contains('flipped');
      card.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    });

    // keyboard: Enter or Space toggles
    card.addEventListener('keydown', e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle('flipped');
        const pressed = card.classList.contains('flipped');
        card.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      }
    });
  });

  // Close flipped cards when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.card')) {
      document.querySelectorAll('.card.flipped')
          .forEach(c => {
            c.classList.remove('flipped');
            c.setAttribute('aria-pressed', 'false');
          });
    }
  });

  // Optional: close flipped cards on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.card.flipped')
          .forEach(c => {
            c.classList.remove('flipped');
            c.setAttribute('aria-pressed', 'false');
          });
    }
  });

  // "View All Projects" button behavior (you can change to navigate)
  document.getElementById('view-all').addEventListener('click', () => {
    alert('View All Projects — replace this with your navigation logic.');
  });
})();

/* ================= TECH SECTION ================== */
const data = [
    {
        img:"./web/images/firstAR.png",
        quote:'🥽 “Step into fashion before it’s made.” Extended reality experiences that let users visualize, interact with, and experience garments in digital environments.',
        tag:"Immersive Fashion (AR/VR & Virtual Try-On)"
    },
    {
        img:"./web/images/secondDesign.png",
        quote:'💻 “Software that powers the fashion ecosystem.” Our suite of products — including Uplift Null, custom apps, and web platforms — enables smarter design management, collaboration, and operational efficiency.',
        tag:"Digital Platforms & Software Solutions"
    },
    {
        img:"./web/images/thirdAI.png",
        quote:'🧠 “Intelligence behind every decision.” AI-powered tools that enhance design accuracy, fit prediction, and workflow optimization.',
        tag:"AI Fashion Systems"
    },
    {
        img:"./web/images/fourthCollab.png",
        quote:'🧵 “Made with intention, not just production.” Technology-enabled production workflows connecting in-house craftsmanship with collaborative maker networks.',
        tag:"Hybrid Manufacturing Intelligence"
    }
];

const ACTIVE_ANGLE = 0; // visible position on circle
const quoteEl = document.getElementById("techQuote");
const iconsEl = document.getElementById("techIcons");
const orbitEl = document.getElementById("techOrbit");
const section = document.getElementById("techSection");
const rotator = document.querySelector(".tech-rotator");
const mobileLabel = document.getElementById("mobileTechLabel");

let index = 0;
let rotation = 180;
const STEP = 90;

let locked = false;
let animating = false;
let exiting = false;

/* BUILD ICONS */
data.forEach((item,i)=>{
    const div=document.createElement("div");
    div.className="tech-icon";
    div.innerHTML=`<img src="${item.img}"><div>${item.tag}</div>`;
    div.addEventListener("click",()=>goToIndex(i));
    iconsEl.appendChild(div);
});

/* BUILD ORBIT */
data.forEach(item=>{
    const d=document.createElement("div");
    d.className="orbit-item";
    d.innerHTML=`<img src="${item.img}">`;
    d.setAttribute("data-tag", item.tag);
    orbitEl.appendChild(d);
});

const orbitItems = document.querySelectorAll(".orbit-item");
const orbitImages = document.querySelectorAll(".orbit-item img");

function positionOrbit(){

    const radius = orbitEl.offsetWidth / 2 - 100;

    orbitItems.forEach((el,i)=>{

        const angle = i * STEP;

        el.dataset.baseAngle = angle;

        el.style.transform =
            `
                rotate(${angle}deg)
                translate(${radius}px)
                rotate(${-angle}deg)
                translate(-50%, -50%)
            `;
    });
}

positionOrbit();
window.addEventListener("resize", positionOrbit);


/* UPDATE */
function setIndex(i){
    index=i;
    update();
}

function rotate(dir){

    if(animating) return;
    animating=true;

    rotation+=dir*STEP;
    index+=dir;

    update();

    setTimeout(()=>animating=false,500);
}

function update(){

    // change text
    quoteEl.innerText = data[index].quote;

    // activate tech icons
    document.querySelectorAll(".tech-icon")
        .forEach((el,i)=>el.classList.toggle("active", i === index));

    // activate orbit items
    orbitItems.forEach((el,i)=>{
        el.classList.toggle("active", i === index);
    });

    /* -----------------------------  ROTATE CIRCLE (FIXED)  ----------------------------- */
    const targetRotation = ACTIVE_ANGLE + (index * STEP);

    // flip + rotate (anti-clockwise visual)
    rotator.style.transform =
        `translateY(-50%) scaleX(-1) rotate(${-targetRotation}deg)`;

    /* -----------------------------     KEEP IMAGES UPRIGHT  ----------------------------- */
    /* keep images upright correctly */
    orbitImages.forEach((img,i)=>{

        let extraFix = 0;

        // images on left & right side need flip correction
        if(i === 1 || i === 3){
            extraFix = 180;
        }

        img.style.transform =
            `scaleX(-1) rotate(${targetRotation + extraFix}deg)`;

    });

    if(mobileLabel){
        mobileLabel.innerText = data[index].tag;
    }

}

update();

function goToIndex(target){

    if(animating || target === index) return;

    animating = true;

    const diff = target - index;

    rotation += diff * STEP;
    index = target;

    update();

    setTimeout(()=>animating=false,600);
}

/* SCROLL LOCK SYSTEM */
/* ================= SCROLL FREEZE SYSTEM ================= */
function sectionActive() {
    const rect = section.getBoundingClientRect();

    return (
        rect.top <= 0 &&
        rect.bottom >= window.innerHeight
    );
}

function lockScroll() {
    locked = true;
    document.body.style.overflow = "hidden";
}

function unlockScroll() {
    locked = false;
    exiting = true;

    document.body.style.overflow = "";

    // small delay so wheel event doesn't relock
    setTimeout(() => exiting = false, 600);
}

window.addEventListener("wheel", (e) => {

    if (!sectionActive() || exiting) return;

    e.preventDefault();

    if (!locked) lockScroll();

    if (animating) return;

    /* SCROLL DOWN */
    if (e.deltaY > 0) {

        if (index < data.length - 1) {
            rotate(1);
        } else {
            unlockScroll();
            window.scrollBy(0, 5); // escape section
        }

    }

    /* SCROLL UP */
    else {

        if (index > 0) {
            rotate(-1);
        } else {
            unlockScroll();
            window.scrollBy(0, -5);
        }

    }

}, { passive:false }); // ⭐ MUST BE FALSE

/* ===================== GET IN TOUCH ======================== */
const chips = document.querySelectorAll(".chip");
let selectedType = "contact";

/* EMAIL ROUTING */
const emailMap = {
  contact: "contact@untitledneedleworks.com",
  partnership: "ceo@untitledneedleworks.com",
  support: "support@untitledneedleworks.com"
};

/* CHIP SELECTION */
chips.forEach(chip => {
  chip.addEventListener("click", () => {

    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");

    selectedType = chip.dataset.type;
  });
});

/* FORM SUBMIT */
document.getElementById("contactForm")
.addEventListener("submit", function(e){

  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  /* HEALTHY VALIDATION */
  if(!name || !email || !subject || !message){
    alert("Please fill all fields.");
    return;
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!emailRegex.test(email)){
    alert("Please enter a valid email address.");
    return;
  }

  const receiver = emailMap[selectedType];

  const body =
`Name: ${name}
Email: ${email}

${message}`;

  const mailtoLink =
`mailto:${receiver}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoLink;
});

/* ===== STORY MODAL ===== */
document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("storyModal");
  const frame = document.getElementById("storyFrame");
  const closeBtn = document.getElementById("closeStory");
  const buttons = document.querySelectorAll(".view-btn");
  const zoomWrapper = document.getElementById("zoomWrapper");

  let scale = 1;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;

  // Safety check (prevents null errors)
  if (!modal || !frame || !closeBtn || buttons.length === 0) return;

  /* ================= OPEN MODAL ================= */
  buttons.forEach(btn => {

    btn.addEventListener("click", () => {

      const file = btn.dataset.file;
      if (!file) return;

      frame.src = file;

      modal.classList.add("active");
      document.body.classList.add("modal-open");
    });

  });

  function applyZoom(){
    zoomWrapper.style.transform = `scale(${scale})`;
  }

  modal.addEventListener("wheel", (e) => {

    if(!modal.classList.contains("active")) return;

    e.preventDefault();

    const zoomSpeed = 0.0015;

    scale += -e.deltaY * zoomSpeed;
    scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));

    applyZoom();

  },{ passive:false });

  let startDist = 0;

modal.addEventListener("touchstart", (e)=>{
    if(e.touches.length === 2){
        startDist = getDistance(e.touches);
    }
});

modal.addEventListener("touchmove", (e)=>{
    if(e.touches.length === 2){

        e.preventDefault();

        const newDist = getDistance(e.touches);
        const diff = (newDist - startDist) * 0.003;

        scale += diff;
        scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));

        applyZoom();

        startDist = newDist;
    }
},{ passive:false });

  function getDistance(touches){
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  }

  /* ================= CLOSE MODAL ================= */
  function closeStory() {

    modal.classList.remove("active");
    document.body.classList.remove("modal-open");

    scale = 1;
    applyZoom();

    setTimeout(()=>{
        frame.src="";
    },250);
  }

  closeBtn.addEventListener("click", closeStory);

  // click outside container
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeStory();
  });

  // ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeStory();
    }
  });

});
