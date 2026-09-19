const $ = (selector, root = document) => root.querySelector(selector); const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const preloader = $("#preloader");
const landingScreen = $("#landingScreen");
const openInvBtn = $("#openInvBtn");
const introVideo = $("#introVideo");
const music = $("#weddingMusic");
const musicToggle = $("#musicToggle");
const heroVideo = $("#heroVideo");
const rsvpForm = $("#rsvpForm");
const formStatus = $("#formStatus");
let siteEntered = false;

window.addEventListener("load", () => {
  setTimeout(() => { preloader.classList.add("hidden"); }, 400);
});

openInvBtn.addEventListener("click", () => {
  openInvBtn.style.display = "none";
  startMusic();
  if (introVideo) {
    introVideo.play().catch(() => { enterSite(); });
    introVideo.addEventListener('ended', enterSite);
  } else {
    enterSite();
  }
});

function enterSite() {
  if (siteEntered) return;
  siteEntered = true;
  landingScreen.classList.add("hidden");
  document.querySelector(".invitation").classList.add("site-ready");
  document.body.classList.remove("locked");

  if (heroVideo) {
    heroVideo.play().catch(() => {});
  }

  startMusic();
}

function startMusic() {
  music.play().then(() => {
    musicToggle.classList.add("playing");
    musicToggle.setAttribute("aria-label", "إيقاف الموسيقى");
  }).catch((error) => {
    console.log("Autoplay was prevented:", error);
  });
}

musicToggle.addEventListener("click", async () => {
  try {
    if (music.paused) {
      await music.play();
      musicToggle.classList.add("playing");
    } else {
      music.pause();
      musicToggle.classList.remove("playing");
    }
  } catch(error) {
    console.error(error);
  }
});

// العد التنازلي لموعد العرس: 30 سبتمبر 2026 الساعة 8:00 مساءً
const weddingDate = new Date("2026-09-30T20:00:00");
function updateCountdown(){
  const now = new Date();
  const difference = weddingDate.getTime() - now.getTime();
  if(difference <= 0) return;

  let totalSeconds = Math.floor(difference / 1000);
  
  const d = Math.floor(totalSeconds / 86400);
  totalSeconds -= d * 86400;
  
  const h = Math.floor(totalSeconds / 3600);
  totalSeconds -= h * 3600;
  
  const m = Math.floor(totalSeconds / 60);
  totalSeconds -= m * 60;
  
  const s = totalSeconds;

  $("#days").textContent = String(d).padStart(2, "0");
  $("#hours").textContent = String(h).padStart(2, "0");
  $("#minutes").textContent = String(m).padStart(2, "0");
  $("#seconds").textContent = String(s).padStart(2, "0"); } updateCountdown(); setInterval(updateCountdown, 1000);  const revealObserver = new IntersectionObserver((entries, observer) => {   entries.forEach((entry) => {     if(entry.isIntersecting){       entry.target.classList.add("visible");       observer.unobserve(entry.target);     }   }); }, { threshold:.12 });  $$(".reveal").forEach((element) => { revealObserver.observe(element); });

let attendanceChoice = "yes";
$$(".attendance-button").forEach((button) => {   button.addEventListener("click", () => {     $$
(".attendance-button").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    attendanceChoice = button.dataset.choice;
  });
});

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = $("#guestName").value.trim();
  if(!name) return;

  const submitButton = $(".send-rsvp", rsvpForm);
  submitButton.disabled = true;
  formStatus.textContent = "جارٍ إرسال التأكيد...";

  try {
    const response = await fetch("https://formspree.io/f/xoevvrkb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        الأسماء: name,
        حالة_الحضور: attendanceChoice === "yes" ? "سيحضر" : "يعتذر عن الحضور"
      })
    });

    if (!response.ok) {
      throw new Error("Failed to submit RSVP");
    }

    formStatus.textContent = attendanceChoice === "yes" ? `شكرًا ${name} 🤍 تم تسجيل حضورك معنا.` : `شكرًا لتواصلك ${name} 🤍 نلغي الحضور باعتذار.`;
    rsvpForm.reset();
  } catch(error) {
    console.error("RSVP submission failed:", error);
    formStatus.textContent = "تعذر إرسال التأكيد. حاول مرة أخرى لاحقاً.";
  } finally {
    submitButton.disabled = false;
  }
});