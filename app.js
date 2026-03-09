/* ─── Breed Data ─── */
const BREEDS = {
  dog: [
    "Akita",
    "Australian Shepherd",
    "Beagle",
    "Bernese Mountain Dog",
    "Bichon Frisé",
    "Border Collie",
    "Boxer",
    "Bulldog",
    "Cavalier King Charles",
    "Chihuahua",
    "Corgi (Pembroke)",
    "Dachshund",
    "Doberman Pinscher",
    "French Bulldog",
    "German Shepherd",
    "Golden Retriever",
    "Great Dane",
    "Husky",
    "Labrador Retriever",
    "Maltese",
    "Pomeranian",
    "Poodle (Standard)",
    "Poodle (Toy)",
    "Rottweiler",
    "Samoyed",
    "Shiba Inu",
    "Shih Tzu",
    "Weimaraner",
    "Yorkshire Terrier",
  ],
  cat: [
    "Abyssinian",
    "American Shorthair",
    "Balinese",
    "Bengal",
    "Birman",
    "British Shorthair",
    "Burmese",
    "Chartreux",
    "Cornish Rex",
    "Devon Rex",
    "Exotic Shorthair",
    "Havana Brown",
    "Maine Coon",
    "Manx",
    "Norwegian Forest",
    "Oriental Shorthair",
    "Persian",
    "Ragdoll",
    "Russian Blue",
    "Savannah",
    "Scottish Fold",
    "Siamese",
    "Siberian",
    "Somali",
    "Sphynx",
    "Tonkinese",
    "Turkish Angora",
  ],
};

/* ─── AI Chat Responses ─── */
const BOT_RESPONSES = {
  เกา: "🐾 อาการเกาตัวบ่อยอาจเกิดจาก:\n• ภูมิแพ้อาหารหรือสิ่งแวดล้อม\n• เห็บหรือหมัด\n• ผิวหนังแห้ง\n\nแนะนำให้ลองอาบน้ำด้วยแชมพูสำหรับสัตว์เลี้ยง และกำจัดหมัดพร้อมนัดสัตวแพทย์ หากอาการไม่ดีขึ้นครับ",
  กินข้าว:
    "🍽️ สัตว์เลี้ยงไม่กินอาหารอาจเกิดจาก:\n• เบื่ออาหารชั่วคราว (ปกติ 1-2 วัน)\n• มีไข้หรือป่วย\n• เปลี่ยนอาหารกะทันหัน\n\nลองให้อาหารชนิดโปรดหรือผสมน้ำอุ่นลงไป ถ้าไม่กินเกิน 2 วันควรพาพบสัตวแพทย์ครับ",
  วัคซีน:
    "💉 ตารางวัคซีนพื้นฐาน:\n• ลูกหมา/แมว: 6-8 สัปดาห์\n• กระตุ้น: ทุก 3-4 สัปดาห์จนอายุ 16 สัปดาห์\n• บาดทะยัก: ทุกปี\n• พิษสุนัขบ้า: ทุกปีตามกฎหมาย\n\nสามารถนัดฉีดวัคซีนผ่านแอปได้เลยครับ 📅",
  ท้องเสีย:
    "🏥 หากสัตว์เลี้ยงท้องเสีย:\n• ให้น้ำสะอาดตลอดเวลา\n• งดอาหาร 12-24 ชั่วโมง\n• ให้อาหารอ่อน เช่น ข้าวต้มไก่\n\n⚠️ ถ้ามีเลือดในอุจจาระ, อาเจียน, หรืออาการหนักให้รีบพาพบสัตวแพทย์ทันทีครับ",
};

/* ─── State ─── */
let currentPet = "dog";
let selectedBreed = "";
let scanInterval = null;
let scanTimeout = null;
let selectedPlanIndex = 0;
let currentUser = { name: "", email: "", plan: 0 };
let myPets = [];
let currentHealthPetIndex = 0;
let currentScanPetIndex = -1;
let healthAssessmentChart = null;
const PLAN_NAMES = [
  "Essential (Free)",
  "Care Plus ($5/mo)",
  "Protection ($10/mo)",
  "VET VIP ($50/mo)",
];
const PLAN_SHORT = ["Free", "Starter", "Pro", "VIP"];
let intentScreen = null; // Return-to-Intent after login
let guestChatCount = parseInt(localStorage.getItem("guestChatCount") || "0");

/* ─── On Load ─── */
function initApp() {
  if (document.getElementById("app-shell")) return; // Prevent double init
  const shell = document.createElement("div");
  shell.id = "app-shell";
  document.body.appendChild(shell);
  document
    .querySelectorAll(".screen, .bottom-nav")
    .forEach((el) => shell.appendChild(el));

  populateBreedList("dog");
  animateSplash();
  updateGreeting();
}

if (document.readyState === "loading") {
  // Loading hasn't finished yet
  window.addEventListener("DOMContentLoaded", initApp);
} else {
  // `DOMContentLoaded` has already fired
  initApp();
}

function updateGreeting() {
  const h = new Date().getHours();
  const g =
    h < 12
      ? "Good morning ☀️"
      : h < 18
        ? "Good afternoon 🌤️"
        : "Good evening 🌙";
  ["home-greeting"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = g;
  });
}

/* ─── Splash ─── */
function animateSplash() {
  const dots = document.querySelectorAll(".dot");
  if (!dots.length) return; // safeguard if called before DOM is fully ready
  let idx = 0;

  const iv = setInterval(() => {
    dots.forEach((d) => d.classList.remove("active"));
    dots[idx % dots.length].classList.add("active");
    idx++;
  }, 500);

  setTimeout(() => {
    clearInterval(iv);
    const isFirstTime = !localStorage.getItem("fufu_visited");
    if (isFirstTime) {
      goToScreen("screen-onboarding");
      showOnboardingSlide(0); // Initialize first slide
    } else {
      goToScreen("screen-home");
      updateHomeUI();
      updateOwnerUI();
    }
  }, 2600);
}

/* ─── Onboarding ─── */
let onboardingSlide = 0;
const ONBOARDING_SLIDES = [
  {
    icon: "🐾",
    title: "Pet Care Simplified",
    sub: "Everything your pet needs in one app, from health records to vet appointments.",
  },
  {
    icon: "🔬",
    title: "AI Health Analysis",
    sub: "Scan with your camera to detect abnormal symptoms and get detailed reports instantly.",
  },
  {
    icon: "💬",
    title: "24/7 Vet Consultation",
    sub: "AI Chatbot ready to answer all your pet-related questions anytime, anywhere.",
  },
];

function showOnboardingSlide(n) {
  onboardingSlide = n;
  const data = ONBOARDING_SLIDES[n];
  document.getElementById("ob-icon").textContent = data.icon;
  document.getElementById("ob-title").textContent = data.title;
  document.getElementById("ob-sub").textContent = data.sub;
  document
    .querySelectorAll(".ob-dot")
    .forEach((d, i) => d.classList.toggle("active", i === n));
  document.getElementById("ob-prev-btn").style.visibility =
    n === 0 ? "hidden" : "visible";
  const nextBtn = document.getElementById("ob-next-btn");
  if (n === ONBOARDING_SLIDES.length - 1) {
    nextBtn.innerHTML = "Get Started 🚀";
    nextBtn.onclick = finishOnboarding;
  } else {
    nextBtn.innerHTML = "Next &rarr;";
    nextBtn.onclick = () => showOnboardingSlide(n + 1);
  }
}

function finishOnboarding() {
  localStorage.setItem("fufu_visited", "1");
  goToScreen("screen-home");
  updateHomeUI();
  updateOwnerUI();
}

function skipOnboarding() {
  finishOnboarding();
}

/* ─── Auth Helpers ─── */
function isLoggedIn() {
  return !!(currentUser && currentUser.email);
}

function showLoginModal(intent = null) {
  intentScreen = intent;
  switchAuthTab("login");
  goToScreen("screen-auth");
}

function closeLoginModal() {
  const modal = document.getElementById("login-modal-overlay");
  if (modal) modal.classList.remove("active");
}

/* ─── Owner Profile Photo ─── */
function handleOwnerPhotoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const avatarWrap = document.getElementById("owner-avatar");
      avatarWrap.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />
                <div class="avatar-edit-icon" style="position:absolute; bottom:-4px; right:-4px; background:white; border-radius:50%; padding:4px; box-shadow:0 2px 8px rgba(0,0,0,0.1); display:flex; z-index:2;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" style="width:16px;height:16px;">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                </div>`;
      avatarWrap.style.background = "transparent"; // Remove default bg
    };
    reader.readAsDataURL(file);
  }
}

/* ─── Screen Navigation ─── */
const NAV_HIDDEN_SCREENS = new Set([
  "screen-splash",
  "screen-pet-selection",
  "screen-scan",
  "screen-plans",
  "screen-auth",
  "screen-payment",
  "screen-onboarding",
  "screen-game",
  "screen-help",
]);

function goToScreen(screenId) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) target.classList.add("active");

  const nav = document.getElementById("bottom-nav");
  if (NAV_HIDDEN_SCREENS.has(screenId)) {
    nav.classList.add("hidden");
  } else {
    nav.classList.remove("hidden");
  }

  const tabMap = {
    "screen-home": "tab-home",
    "screen-profile": "tab-health",
    "screen-pet-selection": "tab-scan",
    "screen-scan": "tab-scan",
    "screen-result": "tab-scan",
    "screen-health": "tab-health",
    "screen-chat": "tab-chat",
    "screen-owner": "tab-profile",
  };
  document
    .querySelectorAll(".nav-tab")
    .forEach((t) => t.classList.remove("active"));
  const activeTab = tabMap[screenId];
  if (activeTab) document.getElementById(activeTab)?.classList.add("active");

  // Side effects per screen
  if (screenId === "screen-game") {
    updateGameUI();
  }
  if (screenId === "screen-chat") {
    const banner = document.getElementById("vip-call-banner");
    if (banner) banner.style.display = currentUser.plan === 3 ? "flex" : "none";
  }
  if (screenId === "screen-health" || screenId === "screen-home") {
    syncPetInfoDisplays();
  }
  if (screenId === "screen-health") {
    initHealthMap();
    updateHealthScreenVisibility();
  }
  if (screenId === "screen-result") {
    loadResultPetshopMap();
  }
  if (screenId === "screen-pet-selection") {
    populatePetSelection();
  }
  if (screenId === "screen-scan") {
    const petName = currentScanPetIndex >= 0 ? myPets[currentScanPetIndex].name : "your pet";
    const emoji = currentScanPetIndex >= 0 ? myPets[currentScanPetIndex].emoji : "🐾";
    const circle = document.getElementById("vf-pet-circle");
    const statusText = document.getElementById("scan-status-text");
    if (circle) circle.textContent = emoji;
    if (statusText) statusText.textContent = `Align guides with ${petName}'s eyes & hold still`;
    // reset part buttons to Eyes
    document.querySelectorAll(".scan-part-btn").forEach((b) => b.classList.remove("active"));
    const eyesBtn = document.querySelector(".scan-part-btn");
    if (eyesBtn) eyesBtn.classList.add("active");
    currentScanPart = "Eyes";
  }
}

function updateHealthScreenVisibility() {
  const emptyState = document.getElementById("health-empty-state");
  const contentWrap = document.getElementById("health-content-wrap");
  if (!emptyState || !contentWrap) return;

  if (myPets.length === 0) {
    emptyState.style.display = "block";
    contentWrap.style.display = "none";
  } else {
    emptyState.style.display = "none";
    contentWrap.style.display = "block";
  }
}

function navTo(tab) {
  const map = {
    home: "screen-home",
    scan: "screen-pet-selection",
    health: "screen-health",
    chat: "screen-chat",
    owner: "screen-owner",
    profile: "screen-owner",
    game: "screen-game",
    help: "screen-help",
  };
  const screen = map[tab];
  // Soft gate for protected tabs
  if (
    (tab === "scan" ||
      tab === "owner" ||
      tab === "profile" ||
      tab === "health") &&
    !isLoggedIn()
  ) {
    showLoginModal(screen);
    return;
  }
  goToScreen(screen);
}

/* ─── Pet Toggle ─── */
function selectPet(type) {
  currentPet = type;
  const slider = document.getElementById("toggle-slider");
  const btnDog = document.getElementById("btn-dog");
  const btnCat = document.getElementById("btn-cat");
  if (type === "dog") {
    slider.classList.remove("right");
    btnDog.classList.add("active");
    btnCat.classList.remove("active");
  } else {
    slider.classList.add("right");
    btnCat.classList.add("active");
    btnDog.classList.remove("active");
  }
  document.getElementById("breed-search").value = "";
  selectedBreed = "";
  closeBreedDropdown();
  populateBreedList(type);
  const petCircle = document.getElementById("vf-pet-circle");
  if (petCircle) petCircle.textContent = type === "dog" ? "🐶" : "🐱";
}

/* ─── Pet Photo Upload ─── */
function previewPetPhoto(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById("pet-photo-img");
    const placeholder = document.querySelector(".pet-photo-placeholder");
    img.src = e.target.result;
    img.style.display = "block";
    placeholder.style.display = "none";
    document.querySelector(".pet-photo-preview").style.border =
      "2.5px solid var(--teal)";
  };
  reader.readAsDataURL(input.files[0]);
}

/* ─── Breed Dropdown ─── */
function populateBreedList(type, filter = "") {
  const dropdown = document.getElementById("breed-dropdown");
  const list = BREEDS[type] || [];
  const filtered = list.filter((b) =>
    b.toLowerCase().includes(filter.toLowerCase()),
  );
  dropdown.innerHTML = filtered
    .map(
      (b) =>
        `<div class="breed-option" tabindex="0" onclick="chooseBreed('${b}')">${b}</div>`,
    )
    .join("");
}

function filterBreeds(val) {
  populateBreedList(currentPet, val);
  openBreedDropdown();
}

function openBreedDropdown() {
  document.getElementById("breed-dropdown").classList.add("open");
  document.addEventListener("click", outsideClickHandler);
}

function closeBreedDropdown() {
  document.getElementById("breed-dropdown").classList.remove("open");
  document.removeEventListener("click", outsideClickHandler);
}

function outsideClickHandler(e) {
  const wrap = document.querySelector(".select-wrap");
  if (wrap && !wrap.contains(e.target)) closeBreedDropdown();
}

function chooseBreed(breed) {
  selectedBreed = breed;
  document.getElementById("breed-search").value = breed;
  closeBreedDropdown();
}

/* ─── Plan Selection ─── */
function selectPlan(card, index) {
  document
    .querySelectorAll(".plan-card")
    .forEach((c) => c.classList.remove("selected"));
  card.classList.add("selected");
  selectedPlanIndex = index;
  currentUser.plan = index;

  const cta = document.getElementById("plans-cta-btn");
  cta.style.opacity = "1";
  cta.style.pointerEvents = "auto";
  cta.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" class="btn-icon">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
      Continue &nbsp;·&nbsp; ${index === 0 ? "Enter Pet Info" : "Checkout"}
    `;
  cta.onclick = () => {
    updateOwnerUI();
    updateHomeUI();
    if (index === 0) {
      goToScreen("screen-profile"); // Skip payment for free plan
    } else {
      const planShortName = PLAN_NAMES[index].split(" (")[0];
      // Populate payment screen
      const planNameEl = document.getElementById("payment-plan-name");
      if (planNameEl) planNameEl.textContent = planShortName;
      const summaryPlan = document.getElementById("pay-summary-plan");
      if (summaryPlan) summaryPlan.textContent = planShortName;
      const summaryPrice = document.getElementById("pay-summary-price");
      if (summaryPrice) summaryPrice.textContent = PLAN_PRICES[index];
      const confirmText = document.getElementById("pay-confirm-text");
      if (confirmText)
        confirmText.textContent = `Confirm & Pay — ${PLAN_PRICES[index]}`;
      // Reset to default selected payment
      selectedPayment = "promptpay";
      document
        .querySelectorAll(".pay-method-card")
        .forEach((c) => c.classList.remove("selected"));
      const first = document.querySelector(".pay-method-card");
      if (first) first.classList.add("selected");
      goToScreen("screen-payment"); // Route to payment for paid plans
    }
  };
}

/* ─── Payment Selection ─── */
let selectedPayment = "promptpay";

const PLAN_PRICES = ["Free", "฿199/mo", "฿399/mo", "฿599/mo"];
const PAYMENT_METHOD_NAMES = {
  promptpay: "PromptPay",
  truemoney: "TrueMoney Wallet",
  linepay: "LINE Pay",
  googlepay: "Google Pay",
  applepay: "Apple Pay",
  creditcard: "Credit / Debit Card",
  mobilebanking: "Mobile Banking",
  paypal: "PayPal",
};

function selectPaymentMethod(card, method) {
  // Deselect all
  document.querySelectorAll(".pay-method-card").forEach((c) => {
    c.classList.remove("selected");
  });
  // Select clicked card
  card.classList.add("selected");
  selectedPayment = method;
}

function confirmPayment() {
  const planName = PLAN_NAMES[currentUser.plan];
  const methodName =
    PAYMENT_METHOD_NAMES[selectedPayment] || selectedPayment.toUpperCase();
  alert(
    `✅ Payment Confirmed!\n\nPlan: ${planName}\nMethod: ${methodName}\n\nThank you for your purchase. (Demo)`,
  );
  goToScreen("screen-profile");
}

/* ─── Auth ─── */
function switchAuthTab(tab) {
  document
    .getElementById("auth-tab-login")
    .classList.toggle("active", tab === "login");
  document
    .getElementById("auth-tab-register")
    .classList.toggle("active", tab === "register");
  document.getElementById("auth-form-login").style.display =
    tab === "login" ? "" : "none";
  document.getElementById("auth-form-register").style.display =
    tab === "register" ? "" : "none";
}

function socialLogin(provider) {
  currentUser.name = provider === "google" ? "Google User" : "Facebook User";
  currentUser.email = "user@" + provider + ".com";
  afterLogin();
}

function doLogin() {
  const email = document.getElementById("login-email").value.trim();
  if (!email) {
    alert("Please enter your email");
    return;
  }
  currentUser.email = email;
  currentUser.name = email.split("@")[0];
  afterLogin();
}

function doRegister() {
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  if (!name || !email) {
    alert("Please fill in all fields");
    return;
  }
  currentUser.name = name;
  currentUser.email = email;
  afterLogin();
}

function doModalLogin() {
  const email = document.getElementById("modal-login-email").value.trim();
  if (!email) {
    alert("กรุณาใส่อีเมล");
    return;
  }
  currentUser.email = email;
  currentUser.name = email.split("@")[0];
  afterLogin();
}

function afterLogin() {
  closeLoginModal();
  updateOwnerUI();
  updateHomeUI();
  guestChatCount = 0;
  localStorage.removeItem("guestChatCount");
  // Return to intent screen if set, otherwise go to plans (new user) or home
  const dest =
    intentScreen || (myPets.length === 0 ? "screen-plans" : "screen-home");
  intentScreen = null;
  goToScreen(dest);
}

function doLogout() {
  currentUser = { name: "", email: "", plan: 0 };
  selectedPlanIndex = 0;
  guestChatCount = 0;
  localStorage.removeItem("guestChatCount");
  document
    .querySelectorAll(".plan-card")
    .forEach((c) => c.classList.remove("selected"));
  const cta = document.getElementById("plans-cta-btn");
  if (cta) {
    cta.style.opacity = "0.5";
    cta.style.pointerEvents = "none";
    cta.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn-icon"><path d="M5 12h14M12 5l7 7-7 7"/></svg>Select a Plan to Continue`;
  }
  goToScreen("screen-home"); // Logout → Home (not Auth)
  updateHomeUI();
}

function updateOwnerUI() {
  const n = currentUser.name || "Pet Owner";
  const e = currentUser.email || "";
  const p = PLAN_NAMES[currentUser.plan] || "Essential (Free)";
  ["owner-display-name", "owner-row-name"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = n;
  });
  ["owner-display-email", "owner-row-email"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = e;
  });
  ["owner-plan-pill", "owner-row-plan"].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el)
      el.textContent = i === 0 ? PLAN_SHORT[currentUser.plan] + " Plan" : p;
  });
}

function updateHomeUI() {
  const n = currentUser.name || "there";
  const el = document.getElementById("home-owner-name");
  if (el) el.textContent = "Hi, " + n.split(" ")[0] + "!";
  const pb = document.getElementById("home-plan-badge");
  if (pb) pb.textContent = PLAN_SHORT[currentUser.plan] || "Free";
  updateGreeting();
  initAdCarousel();
  updateVaccAlerts();
  // Show pet search only when pets exist
  const srchWrap = document.getElementById("home-pet-search-wrap");
  if (srchWrap) srchWrap.style.display = myPets.length >= 3 ? "block" : "none";
}

/* ─── Ad Carousel ─── */
let adCarouselInterval = null;

function initAdCarousel() {
  const track = document.getElementById("home-ad-track");
  const dots = document.querySelectorAll(".ad-dot");
  if (!track || !dots.length) return;

  clearInterval(adCarouselInterval);
  let current = 0;

  function goTo(idx) {
    const cards = track.querySelectorAll(".home-ad-card");
    if (!cards.length) return;
    current = (idx + cards.length) % cards.length;
    track.scrollTo({
      left: current * (track.offsetWidth + 12),
      behavior: "smooth",
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  dots.forEach((d, i) =>
    d.addEventListener("click", () => {
      goTo(i);
      clearInterval(adCarouselInterval);
    }),
  );
  adCarouselInterval = setInterval(() => goTo(current + 1), 4000);

  // Sync dots on manual swipe
  track.addEventListener(
    "scroll",
    () => {
      const idx = Math.round(track.scrollLeft / (track.offsetWidth + 12));
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      current = idx;
    },
    { passive: true },
  );
}

/* ─── Vaccination Alerts ─── */
function updateVaccAlerts() {
  const panel = document.getElementById("vacc-alert-panel");
  const notifDot = document.getElementById("notif-dot");
  if (!panel) return;

  const alerts = [];

  myPets.forEach((pet) => {
    if (!pet.vaccinations) return;
    pet.vaccinations.forEach((v) => {
      if (!v.nextDate) return;
      const next = new Date(
        v.nextDate.replace(/(\d+)\s([A-Za-z]+)\s(\d+)/, "$1 $2 $3"),
      );
      const daysLeft = Math.ceil((next - Date.now()) / 86400000);
      if (daysLeft <= 0) {
        alerts.push({
          type: "urgent",
          icon: "🚨",
          pet: pet.name,
          vacc: v.name,
          msg: `Overdue! ${pet.name}'s ${v.name} vaccination was due ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? "s" : ""} ago`,
        });
      } else if (daysLeft <= 14) {
        alerts.push({
          type: "warning",
          icon: "⚠️",
          pet: pet.name,
          vacc: v.name,
          msg: `${pet.name}'s ${v.name} vaccination due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
        });
      } else if (daysLeft <= 30) {
        alerts.push({
          type: "info",
          icon: "💉",
          pet: pet.name,
          vacc: v.name,
          msg: `Upcoming: ${pet.name}'s ${v.name} in ${daysLeft} days`,
        });
      }
    });
  });

  if (alerts.length === 0) {
    panel.style.display = "none";
    if (notifDot) notifDot.classList.remove("active");
    return;
  }

  panel.style.display = "flex";
  if (notifDot) notifDot.classList.add("active");
  panel.innerHTML = alerts
    .map(
      (a, i) => `
    <div class="vacc-alert-card ${a.type}" onclick="navTo('health')">
      <div class="vacc-alert-icon">${a.icon}</div>
      <div class="vacc-alert-text">
        <div class="vacc-alert-title">${a.type === "urgent" ? "Overdue Vaccination" : a.type === "warning" ? "Vaccination Due Soon" : "Vaccination Reminder"}</div>
        <div class="vacc-alert-sub">${a.msg}</div>
      </div>
      <button class="vacc-alert-dismiss" onclick="event.stopPropagation();dismissAlert(${i})" title="Dismiss">×</button>
    </div>
  `,
    )
    .join("");
}

let dismissedAlerts = new Set();

function dismissAlert(idx) {
  dismissedAlerts.add(idx);
  const panel = document.getElementById("vacc-alert-panel");
  if (!panel) return;
  const cards = panel.querySelectorAll(".vacc-alert-card");
  if (cards[idx]) {
    cards[idx].style.opacity = "0";
    cards[idx].style.transition = "opacity 0.3s";
    setTimeout(() => {
      cards[idx].remove();
      if (!panel.children.length) panel.style.display = "none";
    }, 300);
  }
}

function toggleNotifPanel() {
  updateVaccAlerts();
  const panel = document.getElementById("vacc-alert-panel");
  if (!panel) return;
  const showing = panel.style.display !== "none";
  panel.style.display = showing ? "none" : "flex";
}

/* ─── Pet Search on Home ─── */
function filterHomePets(query) {
  renderPetCards(query.toLowerCase().trim());
}

let nearbyMapInstance = null;
let nearbyModalStartY = 0;
let nearbyModalCurrentY = 0;
let isDraggingNearbyModal = false;

// We use an async function to load data from the new JSON instead of constant
async function openNearbyMap(type) {
  let data;
  try {
    const response = await fetch("data/places.json");
    const allData = await response.json();
    data = allData[type];
  } catch (error) {
    console.error("Failed to load places data:", error);
    return;
  }

  if (!data) return;

  document.getElementById("nearby-modal-title").textContent = data.title;
  document.getElementById("nearby-modal-sub").textContent = data.sub;

  const list = document.getElementById("nearby-places-list");
  list.innerHTML = data.places
    .map(
      (p) => `
    <div class="nearby-place-card" onclick="routeTo(${p.lat}, ${p.lng})">
      <div class="nearby-place-icon" style="background:${type === "vet" ? "#f0fdf9" : "#fff7ed"}">${p.icon}</div>
      <div class="nearby-place-info">
        <div class="nearby-place-name">${p.name}</div>
        <div class="nearby-place-detail">${p.detail}</div>
      </div>
      <div class="nearby-place-dist">${p.dist}</div>
    </div>
  `,
    )
    .join("");

  const modal = document.getElementById("nearby-modal");
  const modalContent = document.getElementById("nearby-modal-content");

  modal.style.display = "block";

  // reset transform
  requestAnimationFrame(() => {
    modalContent.style.transform = "translateY(0)";
  });

  // Setup drag event listeners (only once or override)
  const dragHandle = document.getElementById("nearby-drag-handle");
  if (dragHandle && !dragHandle.getAttribute("data-drag-inited")) {
    dragHandle.setAttribute("data-drag-inited", "true");

    const handleStart = (e) => {
      isDraggingNearbyModal = true;
      modalContent.style.transition = "none";
      nearbyModalStartY =
        e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    };

    const handleMove = (e) => {
      if (!isDraggingNearbyModal) return;
      const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
      nearbyModalCurrentY = clientY - nearbyModalStartY;
      if (nearbyModalCurrentY < 0) nearbyModalCurrentY = 0; // Prevent drag up
      modalContent.style.transform = `translateY(${nearbyModalCurrentY}px)`;
    };

    const handleEnd = () => {
      if (!isDraggingNearbyModal) return;
      isDraggingNearbyModal = false;
      modalContent.style.transition =
        "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

      if (nearbyModalCurrentY > 100) {
        closeNearbyModal();
      } else {
        modalContent.style.transform = "translateY(0)";
      }
    };

    dragHandle.addEventListener("touchstart", handleStart, { passive: true });
    dragHandle.addEventListener("mousedown", handleStart);

    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("mousemove", handleMove);

    document.addEventListener("touchend", handleEnd);
    document.addEventListener("mouseup", handleEnd);
  }

  // Initialize Map
  setTimeout(() => {
    if (!nearbyMapInstance) {
      // Create map
      nearbyMapInstance = L.map("nearby-map-container", {
        zoomControl: false, // Disable default zoom
      }).setView([16.7518928, 100.1914052], 14);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap &copy; CARTO",
        },
      ).addTo(nearbyMapInstance);

      // Add custom zoom control at bottom right
      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(nearbyMapInstance);
    } else {
      nearbyMapInstance.invalidateSize();
    }

    // Clear old markers
    if (nearbyMapInstance._markers) {
      nearbyMapInstance._markers.forEach((m) =>
        nearbyMapInstance.removeLayer(m),
      );
    }
    nearbyMapInstance._markers = [];

    // Add current location marker
    const currentLocationHtml = `
      <div style="background:#3b82f6; 
                  width:20px; height:20px; border-radius:50%; border:3px solid white;
                  box-shadow:0 0 10px rgba(59, 130, 246, 0.8);">
      </div>
    `;
    const currentLocationIcon = L.divIcon({
      html: currentLocationHtml,
      className: "current-location-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Add current location pin to map
    const currMarker = L.marker([16.7518928, 100.1914052], {
      icon: currentLocationIcon,
    }).addTo(nearbyMapInstance);
    currMarker.bindPopup("<b>Current Location</b>");
    nearbyMapInstance._markers.push(currMarker);

    // Add markers
    const bounds = L.latLngBounds();
    bounds.extend([16.7518928, 100.1914052]);

    data.places.forEach((place) => {
      if (place.lat && place.lng) {
        const markerHtml = `
                <div style="background:${type === "vet" ? "#10b981" : "#ec4899"}; 
                            width:30px; height:30px; border-radius:50%; border:2px solid white;
                            display:flex; align-items:center; justify-content:center;
                            box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:14px;">
                    ${place.icon}
                </div>
            `;
        const customIcon = L.divIcon({
          html: markerHtml,
          className: "custom-leaflet-marker",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const m = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(
          nearbyMapInstance,
        );
        m.bindPopup("<b>" + place.name + "</b><br>" + place.detail);
        nearbyMapInstance._markers.push(m);
        bounds.extend([place.lat, place.lng]);
      }
    });

    if (nearbyMapInstance._markers.length > 0) {
      nearbyMapInstance.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
    }
  }, 100);
}

// Function to open routing
function routeTo(lat, lng) {
  const currentLat = 16.7518928;
  const currentLng = 100.1914052;
  const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLat},${currentLng}&destination=${lat},${lng}&travelmode=driving`;
  window.open(url, "_blank");
}

function closeNearbyModal() {
  const modalContent = document.getElementById("nearby-modal-content");
  modalContent.style.transform = "translateY(100%)";

  setTimeout(() => {
    document.getElementById("nearby-modal").style.display = "none";
  }, 300);
}

function syncPetInfoDisplays() {
  const rawName = document.getElementById("pet-name")?.value || "";
  const name = rawName.trim();

  // If name is completely empty, it means the user just navigated here
  // or clicked continue without adding a new pet. Do not duplicate.
  if (!name) {
    return;
  }

  const age = document.getElementById("pet-age")?.value || "";
  const wt = document.getElementById("pet-weight")?.value || "";
  const gender = document.getElementById("pet-gender")?.value || "";
  const microchip = document.getElementById("pet-microchip")?.value || "";
  const breed =
    selectedBreed || document.getElementById("breed-search")?.value || "";
  const emoji = currentPet === "cat" ? "🐱" : "🐶";

  // Meta string
  const parts = [
    breed || "Mixed",
    age ? age + " yrs" : "",
    wt ? wt + " kg" : "",
    gender ? gender : "",
  ].filter(Boolean);
  const meta = parts.join(" · ");

  // Determine if a photo was uploaded
  const photoImg = document.getElementById("pet-photo-img");
  const photoSrc =
    photoImg && photoImg.style.display !== "none" ? photoImg.src : null;

  const newPetData = {
    name,
    breed: breed || "Mixed",
    age,
    weight: wt,
    gender,
    microchip,
    emoji,
    meta,
    photoSrc,
    vaccinations: [
      {
        name: "Rabies",
        date: "12 Oct 2023",
        doctor: "Dr. Smith",
        clinic: "Happy Paws Clinic",
        nextDate: "12 Oct 2024",
      },
      {
        name: "Distemper/Parvo",
        date: "05 Jan 2024",
        doctor: "Dr. Jane Doe",
        clinic: "City Vet Hospital",
        nextDate: "05 Jan 2025",
      },
    ],
  };

  if (
    window.currentEditingPetIndex !== undefined &&
    window.currentEditingPetIndex !== null
  ) {
    // Update existing pet
    const idx = window.currentEditingPetIndex;
    myPets[idx] = { ...myPets[idx], ...newPetData };
    window.currentEditingPetIndex = null; // Clear it out

    // If we are currently viewing the pet we just edited, update the view
    if (idx === currentHealthPetIndex) {
      updateHealthScreenForPet(idx);
    }
  } else {
    // Add new pet
    myPets.push({
      ...newPetData,
      score: Math.floor(Math.random() * 20) + 70, // Mock score 70-90
    });
  }

  // Reset form for next pet
  document.getElementById("pet-name").value = "";
  document.getElementById("pet-age").value = "";
  document.getElementById("pet-weight").value = "";
  document.getElementById("pet-gender").value = "";
  document.getElementById("pet-microchip").value = "";
  document.getElementById("breed-search").value = "";
  if (photoImg) {
    photoImg.style.display = "none";
    photoImg.src = "";
  }
  const ph = document.getElementById("pet-photo-placeholder");
  if (ph) ph.style.display = "flex";

  renderPetCards();

  // Default the health screen to show the first pet if this is the first one added
  if (myPets.length === 1) {
    updateHealthScreenForPet(0);
  }
}

function updateHealthScreenForPet(index) {
  const pet = myPets[index];
  if (!pet) return;

  currentHealthPetIndex = index;

  const hp = document.getElementById("health-pet-photo");
  if (hp) {
    if (pet.photoSrc) {
      hp.innerHTML = `<img src="${pet.photoSrc}" alt="Pet">`;
    } else {
      hp.textContent = pet.emoji;
    }
  }
  const hn = document.getElementById("health-pet-name-display");
  if (hn) hn.textContent = pet.name;
  const hm = document.getElementById("health-pet-meta-display");
  if (hm) hm.textContent = pet.meta;
}

function updatePetDetailScreen(index) {
  const pet = myPets[index];
  if (!pet) return;

  window.currentViewPetIndex = index;

  const ph = document.getElementById("pet-detail-photo");
  if (ph) {
    if (pet.photoSrc) {
      ph.innerHTML = `<img src="${pet.photoSrc}" alt="Pet" style="width:100%; height:100%; object-fit:cover; display:block;">`;
      ph.style.background = "transparent";
      ph.style.fontSize = "0";
    } else {
      ph.innerHTML = pet.emoji;
      ph.style.background = "linear-gradient(135deg,#e0f2f1,#b2dfdb)";
      ph.style.fontSize = "72px";
    }
  }

  const nameEl = document.getElementById("pet-detail-name");
  if (nameEl) nameEl.textContent = pet.name;

  const breedEl = document.getElementById("pet-detail-breed");
  if (breedEl) breedEl.textContent = pet.breed || "-";

  const ageEl = document.getElementById("pet-detail-age");
  if (ageEl) ageEl.textContent = pet.age ? `${pet.age} Years` : "-";

  const weightEl = document.getElementById("pet-detail-weight");
  if (weightEl) weightEl.textContent = pet.weight ? `${pet.weight} kg` : "-";

  const genderEl = document.getElementById("pet-detail-gender");
  if (genderEl) genderEl.textContent = pet.gender || "-";

  const microchipEl = document.getElementById("pet-detail-microchip");
  if (microchipEl) microchipEl.textContent = pet.microchip || "-";

  // Health Assessment Chart
  const ctx = document.getElementById("health-assessment-chart");
  if (ctx) {
    if (healthAssessmentChart) {
      healthAssessmentChart.destroy();
    }
    
    // Generate mock data if none exists
    const labels = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
    let scores = pet.healthScores;
    if (!scores) {
       // Mock decreasing or increasing health score between 70 and 100
       scores = [85, 88, 86, 90, 92, 95];
       pet.healthScores = scores; // Save to pet object
    }

    // Create actual vs prediction datasets
    const actualData = [...scores, null]; // Pad with null for April
    
    // Generate a prediction based on the last score (+/- 3%)
    let prediction = pet.healthPrediction;
    if (!prediction) {
       prediction = Math.min(100, Math.max(60, scores[5] + (Math.floor(Math.random() * 7) - 3)));
       pet.healthPrediction = prediction;
    }
    const predictedData = [null, null, null, null, null, scores[5], prediction];
    
    healthAssessmentChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Actual Data",
            data: actualData,
            borderColor: "var(--teal)",
            backgroundColor: "rgba(13, 148, 136, 0.1)",
            borderWidth: 2,
            pointBackgroundColor: "var(--teal)",
            pointRadius: 4,
            fill: true,
            tension: 0.3
          },
          {
            label: "Prediction (1 Month)",
            data: predictedData,
            borderColor: "var(--teal)",
            borderDash: [5, 5],
            backgroundColor: "transparent",
            borderWidth: 2,
            pointBackgroundColor: "#fff",
            pointBorderColor: "var(--teal)",
            pointBorderWidth: 2,
            pointRadius: 4,
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: true,
            position: 'top',
            labels: { boxWidth: 12, usePointStyle: true }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ": " + context.parsed.y + "%";
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 60,
            max: 100,
            grid: { color: "rgba(0,0,0,0.05)" }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // Vaccination Records
  const vacList = document.getElementById("pet-vaccination-list");
  if (vacList) {
    if (pet.vaccinations && pet.vaccinations.length > 0) {
      vacList.innerHTML = pet.vaccinations
        .map(
          (v, i) => `
        <div style="background:var(--white); border-radius:var(--radius-sm); border:1px solid var(--slate-ghost); padding:14px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div style="font-size:14px; font-weight:700; color:var(--slate);">
              #${i + 1} ${v.name}
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <div style="background:#e0e7ff; color:#4338ca; font-size:10px; font-weight:700; padding:2px 8px; border-radius:100px;">
                ${v.date}
              </div>
              <button onclick="openVaccineModal(${index}, ${i})" style="background:none; border:none; padding:4px; cursor:pointer; color:var(--teal);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--slate-lite);">
            <div style="display:flex; justify-content:space-between;">
              <span>Doctor:</span>
              <strong style="color:var(--slate-mid);">${v.doctor}</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Clinic/Hospital:</span>
              <strong style="color:var(--slate-mid);">${v.clinic}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:4px; padding-top:8px; border-top:1px dashed var(--slate-ghost);">
              <span style="color:var(--teal); font-weight:600;">Next Appt:</span>
              <strong style="color:var(--teal);">${v.nextDate || "-"}</strong>
            </div>
          </div>
        </div>
      `,
        )
        .join("");
    } else {
      vacList.innerHTML = `
        <div style="background:var(--white); border-radius:var(--radius); padding:16px; box-shadow:var(--shadow-card); text-align:center; color:var(--slate-lite); font-size:14px;">
            No vaccination records yet.
        </div>
      `;
    }
  }
}

/* ─── Pet Detail Photo Change ─── */
function handlePetDetailPhotoChange(input) {
  if (!input.files || !input.files[0]) return;
  const petIndex = window.currentViewPetIndex;
  const pet = myPets[petIndex];
  if (!pet) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    pet.photoSrc = e.target.result;
    // Update hero immediately
    const ph = document.getElementById("pet-detail-photo");
    if (ph) {
      ph.innerHTML = `<img src="${e.target.result}" alt="Pet" style="width:100%; height:100%; object-fit:cover; display:block;">`;
      ph.style.background = "transparent";
      ph.style.fontSize = "0";
    }
    renderPetCards(); // Sync cards on home/health
  };
  reader.readAsDataURL(input.files[0]);
}

/* ─── Vaccine Modal ─── */
function openVaccineModal(petIndex, vaccineIndex) {
  // vaccineIndex = null means "Add new"
  const pet = myPets[petIndex];
  if (!pet) return;

  window._vaccinePetIndex = petIndex;
  window._vaccineEditIndex =
    vaccineIndex !== undefined && vaccineIndex !== null ? vaccineIndex : null;

  const isEdit = window._vaccineEditIndex !== null;
  const v = isEdit
    ? pet.vaccinations[vaccineIndex]
    : { name: "", date: "", doctor: "", clinic: "", nextDate: "" };

  // Build modal HTML
  const modalHtml = `
    <div id="vaccine-modal-overlay" onclick="if(event.target===this)closeVaccineModal()" style="
      position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:9999;
      display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px; box-sizing:border-box;">
      <div style="background:var(--white); border-radius:20px; padding:24px 20px 24px; width:100%; max-width:400px; box-shadow:0 8px 40px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h2 style="font-size:17px; font-weight:800; color:var(--slate); margin:0;">${isEdit ? "Edit Vaccine Record" : "Add Vaccine Record"}</h2>
          <button onclick="closeVaccineModal()" style="background:none; border:none; font-size:22px; color:var(--slate-lite); cursor:pointer; line-height:1;">×</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--slate-lite); display:block; margin-bottom:4px;">Vaccine Name</label>
            <input id="vax-name" type="text" value="${v.name}" placeholder="e.g. Rabies"
              style="width:100%; padding:10px 12px; border:1px solid var(--slate-ghost); border-radius:10px; font-size:14px; color:var(--slate); background:var(--bg); box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--slate-lite); display:block; margin-bottom:4px;">Date Given</label>
            <input id="vax-date" type="date" value="${toInputDate(v.date)}"
              style="width:100%; padding:10px 12px; border:1px solid var(--slate-ghost); border-radius:10px; font-size:14px; color:var(--slate); background:var(--bg); box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--slate-lite); display:block; margin-bottom:4px;">Doctor</label>
            <input id="vax-doctor" type="text" value="${v.doctor}" placeholder="e.g. Dr. Smith"
              style="width:100%; padding:10px 12px; border:1px solid var(--slate-ghost); border-radius:10px; font-size:14px; color:var(--slate); background:var(--bg); box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--slate-lite); display:block; margin-bottom:4px;">Clinic / Hospital</label>
            <input id="vax-clinic" type="text" value="${v.clinic}" placeholder="e.g. Happy Paws Clinic"
              style="width:100%; padding:10px 12px; border:1px solid var(--slate-ghost); border-radius:10px; font-size:14px; color:var(--slate); background:var(--bg); box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--slate-lite); display:block; margin-bottom:4px;">Next Appointment</label>
            <input id="vax-next" type="date" value="${toInputDate(v.nextDate)}"
              style="width:100%; padding:10px 12px; border:1px solid var(--slate-ghost); border-radius:10px; font-size:14px; color:var(--slate); background:var(--bg); box-sizing:border-box;" />
          </div>
        </div>

        <div style="display:flex; gap:10px; margin-top:20px;">
          ${isEdit ? `<button onclick="deleteVaccineRecord()" style="flex:0; padding:12px 16px; border-radius:12px; border:none; background:#fee2e2; color:#ef4444; font-weight:700; font-size:14px; cursor:pointer;">Delete</button>` : ""}
          <button onclick="saveVaccineRecord()" style="flex:1; padding:14px; border-radius:12px; border:none; background:var(--teal); color:white; font-weight:700; font-size:15px; cursor:pointer;">
            ${isEdit ? "Save Changes" : "Add Record"}
          </button>
        </div>
      </div>
    </div>
  `;

  const modalEl = document.createElement("div");
  modalEl.id = "vaccine-modal-container";
  modalEl.innerHTML = modalHtml;
  document.body.appendChild(modalEl);
}

function closeVaccineModal() {
  const el = document.getElementById("vaccine-modal-container");
  if (el) el.remove();
}

function toInputDate(displayDate) {
  if (!displayDate) return "";
  // Try to convert "12 Oct 2023" → "2023-10-12"
  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  const parts = displayDate.trim().split(" ");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const mo = months[m];
    if (mo) return `${y}-${mo}-${d.padStart(2, "0")}`;
  }
  // Already in ISO format?
  return displayDate;
}

function fromInputDate(isoDate) {
  if (!isoDate) return "";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function saveVaccineRecord() {
  const petIndex = window._vaccinePetIndex;
  const vaxIndex = window._vaccineEditIndex;
  const pet = myPets[petIndex];
  if (!pet) return;

  const name = document.getElementById("vax-name").value.trim();
  const date = fromInputDate(document.getElementById("vax-date").value);
  const doctor = document.getElementById("vax-doctor").value.trim();
  const clinic = document.getElementById("vax-clinic").value.trim();
  const nextDate = fromInputDate(document.getElementById("vax-next").value);

  if (!name) {
    alert("Please enter a vaccine name.");
    return;
  }

  const record = { name, date, doctor, clinic, nextDate };

  if (!pet.vaccinations) pet.vaccinations = [];

  if (vaxIndex !== null) {
    pet.vaccinations[vaxIndex] = record;
  } else {
    pet.vaccinations.push(record);
  }

  closeVaccineModal();
  updatePetDetailScreen(petIndex);
}

function deleteVaccineRecord() {
  const petIndex = window._vaccinePetIndex;
  const vaxIndex = window._vaccineEditIndex;
  if (vaxIndex === null) return;
  const pet = myPets[petIndex];
  if (!pet || !pet.vaccinations) return;
  pet.vaccinations.splice(vaxIndex, 1);
  closeVaccineModal();
  updatePetDetailScreen(petIndex);
}

function openPetProfile(index) {
  if (!isLoggedIn()) {
    showLoginModal("screen-pet-detail");
    return;
  }
  currentViewingPetIndex = index;
  updatePetDetailScreen(index);
  goToScreen("screen-pet-detail");
}

// Track current home pet page
let homePetPage = 0;

function buildHomePetCardHtml(pet, i) {
  const photoHtml = pet.photoSrc
    ? `<img src="${pet.photoSrc}" alt="${pet.name}">`
    : pet.emoji;
  const dotClass = pet.score > 80 ? "green" : pet.score > 60 ? "orange" : "red";
  const statusText =
    pet.score > 80 ? "Good" : pet.score > 60 ? "Fair" : "Needs Attention";
  return `
    <div class="pet-card-photo">${photoHtml}</div>
    <div class="pet-card-info" style="flex:1;">
      <div class="pet-card-name">${pet.name}</div>
      <div class="pet-card-breed">${pet.meta}</div>
      <div class="pet-card-status">
        <span class="pet-status-dot ${dotClass}"></span>
        <span class="pet-status-text">Health Score ${pet.score} · ${statusText}</span>
      </div>
    </div>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;flex-shrink:0;opacity:.35"><path d="M9 18l6-6-6-6"/></svg>`;
}

function goToHomePetPage(page, petsArray) {
  homePetPage = page;
  const homeList = document.getElementById("pet-cards-list");
  const dotsEl = document.getElementById("pet-page-dots");
  if (!homeList) return;

  const PETS_PER_PAGE = 3;
  const totalPages = Math.ceil(petsArray.length / PETS_PER_PAGE);
  const start = page * PETS_PER_PAGE;
  const slice = petsArray.slice(start, start + PETS_PER_PAGE);

  // Animate out → render → animate in
  homeList.style.transition = "opacity 0.2s ease";
  homeList.style.opacity = "0";
  setTimeout(() => {
    homeList.innerHTML = "";
    slice.forEach((pet) => {
      const i = petsArray.indexOf(pet);
      const realIndex = myPets.indexOf(pet);
      const div = document.createElement("div");
      div.className = "pet-card";
      div.onclick = () => openPetProfile(realIndex);
      div.innerHTML = buildHomePetCardHtml(pet, realIndex);
      homeList.appendChild(div);
    });
    homeList.style.opacity = "1";
  }, 150);

  // Update dots
  if (dotsEl) {
    if (totalPages <= 1) {
      dotsEl.style.display = "none";
    } else {
      dotsEl.style.display = "flex";
      dotsEl.innerHTML = "";
      for (let p = 0; p < totalPages; p++) {
        const dot = document.createElement("span");
        dot.style.cssText = `
          width:${p === page ? "18px" : "7px"}; height:7px; border-radius:4px;
          background:${p === page ? "var(--teal)" : "var(--slate-ghost)"};
          transition:all .25s ease; cursor:pointer; display:inline-block;`;
        dot.onclick = () => goToHomePetPage(p, petsArray);
        dotsEl.appendChild(dot);
      }
    }
  }
}

function renderPetCards(searchQuery = "") {
  const homeList = document.getElementById("pet-cards-list");
  const healthList = document.getElementById("health-pet-selector-list");

  if (homeList) homeList.innerHTML = "";
  if (healthList) healthList.innerHTML = "";

  const filteredForHome = searchQuery
    ? myPets.filter((p) => p.name.toLowerCase().includes(searchQuery))
    : myPets;

  // Show/hide pet search bar based on pet count
  const srchWrap = document.getElementById("home-pet-search-wrap");
  if (srchWrap) srchWrap.style.display = myPets.length >= 3 ? "block" : "none";

  // Reset to page 0 on search/re-render, then render paginated home list
  homePetPage = 0;
  goToHomePetPage(0, filteredForHome);

  // ── Render health pet selector (always all pets) ──
  myPets.forEach((pet, i) => {
    let photoHtml = pet.photoSrc
      ? `<img src="${pet.photoSrc}" alt="${pet.name}">`
      : pet.emoji;
    let dotClass = pet.score > 80 ? "green" : pet.score > 60 ? "orange" : "red";
    let statusText =
      pet.score > 80 ? "Good" : pet.score > 60 ? "Fair" : "Needs Attention";
    const cardInnerHtml = `
      <div class="pet-card-photo">${photoHtml}</div>
      <div class="pet-card-info" style="flex:1;">
        <div class="pet-card-name">${pet.name}</div>
        <div class="pet-card-breed">${pet.meta}</div>
        <div class="pet-card-status">
          <span class="pet-status-dot ${dotClass}"></span>
          <span class="pet-status-text">Health Score ${pet.score} · ${statusText}</span>
        </div>
      </div>`;
    if (healthList) {
      const div = document.createElement("div");
      div.className = "pet-card";
      div.style.position = "relative";
      if (i === currentHealthPetIndex) {
        div.style.borderColor = "var(--teal)";
        div.style.background = "var(--white)";
      }
      div.innerHTML =
        cardInnerHtml +
        `
        <button onclick="event.stopPropagation(); togglePetMenu(${i})" style="background:none; border:none; padding:8px; cursor:pointer; color:var(--slate-lite);">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px;">
            <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
        <div id="pet-menu-${i}" class="pet-action-menu" style="display:none; position:absolute; right:16px; top:48px; background:white; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.1); border:1px solid var(--slate-ghost); z-index:100; min-width:120px; overflow:hidden;">
          <div onclick="event.stopPropagation(); editPet(${i})" style="padding:12px 16px; font-size:14px; font-weight:600; color:var(--slate); border-bottom:1px solid var(--slate-ghost); display:flex; align-items:center; gap:8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </div>
          <div onclick="event.stopPropagation(); deletePet(${i})" style="padding:12px 16px; font-size:14px; font-weight:600; color:#ef4444; display:flex; align-items:center; gap:8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
          </div>
        </div>`;
      div.onclick = (e) => {
        document
          .querySelectorAll(".pet-action-menu")
          .forEach((m) => (m.style.display = "none"));
        updateHealthScreenForPet(i);
        renderPetCards();
        openPetProfile(i);
      };
      healthList.appendChild(div);
    }
  });

  // Update owner profile pet count
  const petsUi = document.getElementById("owner-row-pets");
  if (petsUi) {
    petsUi.textContent = `${myPets.length} pet${myPets.length !== 1 ? "s" : ""} registered`;
  }
}

function togglePetMenu(index) {
  const menu = document.getElementById(`pet-menu-${index}`);
  const isVisible = menu.style.display === "block";

  // Close all menus first
  document
    .querySelectorAll(".pet-action-menu")
    .forEach((m) => (m.style.display = "none"));

  // Toggle clicked menu
  if (!isVisible && menu) {
    menu.style.display = "block";
  }
}

// Close menus when clicking anywhere else
document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".pet-action-menu") &&
    !e.target.closest('button[onclick*="togglePetMenu"]')
  ) {
    document
      .querySelectorAll(".pet-action-menu")
      .forEach((m) => (m.style.display = "none"));
  }
});

function editPet(index) {
  // Hide menu
  document.getElementById(`pet-menu-${index}`).style.display = "none";

  const pet = myPets[index];
  if (!pet) return;

  // We can reuse selectPet logic or just set currentPet directly for the modal prep
  currentPet = pet.emoji === "🐱" ? "cat" : "dog";
  selectedBreed = pet.breed === "Mixed" ? "" : pet.breed;

  // Pre-fill form
  document.getElementById("pet-name").value = pet.name || "";
  document.getElementById("pet-age").value = pet.age || "";
  document.getElementById("pet-weight").value = pet.weight || "";
  document.getElementById("pet-gender").value = pet.gender || "";
  document.getElementById("pet-microchip").value = pet.microchip || "";

  const breedInput = document.getElementById("breed-search");
  if (breedInput) breedInput.value = selectedBreed;

  // Handle photo
  const photoImg = document.getElementById("pet-photo-img");
  const placeholder = document.getElementById("pet-photo-placeholder");
  if (photoImg && placeholder) {
    if (pet.photoSrc) {
      photoImg.src = pet.photoSrc;
      photoImg.style.display = "block";
      placeholder.style.display = "none";
    } else {
      photoImg.src = "";
      photoImg.style.display = "none";
      placeholder.style.display = "flex";
    }
  }

  // Set buttons state
  const slider = document.getElementById("toggle-slider");
  const btnDog = document.getElementById("btn-dog");
  const btnCat = document.getElementById("btn-cat");

  if (currentPet === "dog") {
    if (slider) slider.classList.remove("right");
    if (btnDog) btnDog.classList.add("active");
    if (btnCat) btnCat.classList.remove("active");
  } else {
    if (slider) slider.classList.add("right");
    if (btnCat) btnCat.classList.add("active");
    if (btnDog) btnDog.classList.remove("active");
  }

  // Prepare a temporary property to track edit index so when they click save we OVERWRITE instead of add
  window.currentEditingPetIndex = index;

  goToScreen("screen-profile");
}

function deletePet(index) {
  // Hide menu
  document.getElementById(`pet-menu-${index}`).style.display = "none";

  if (confirm(`Are you sure you want to delete ${myPets[index].name}?`)) {
    myPets.splice(index, 1);

    // Adjust currentHealthPetIndex if needed
    if (myPets.length === 0) {
      currentHealthPetIndex = 0; // reset
    } else if (currentHealthPetIndex >= myPets.length) {
      currentHealthPetIndex = Math.max(0, myPets.length - 1);
    } else if (currentHealthPetIndex === index && myPets.length > 0) {
      // Deleted the currently viewed pet, just keep same index but ensure it's valid
      currentHealthPetIndex = Math.min(
        currentHealthPetIndex,
        myPets.length - 1,
      );
    }

    renderPetCards();

    if (myPets.length > 0) {
      updateHealthScreenForPet(currentHealthPetIndex);
    } else {
      updateHealthScreenVisibility();
    }
  }
}

/* ─── Vet Map Integration (Leaflet) ─── */
let healthMapInstance = null;

async function initHealthMap() {
  const mapContainer = document.getElementById("health-map");
  if (!mapContainer) return;

  // Load vet data from places.json
  let vetData = null;
  try {
    const response = await fetch("data/places.json");
    const allData = await response.json();
    vetData = allData["vet"];
  } catch (error) {
    console.error("Failed to load places data for health map:", error);
  }

  // Initialize map if not already done
  if (!healthMapInstance) {
    healthMapInstance = L.map("health-map", {
      zoomControl: false,
    }).setView([16.7518928, 100.1914052], 14);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      },
    ).addTo(healthMapInstance);

    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(healthMapInstance);
  } else {
    healthMapInstance.invalidateSize();
  }

  // Clear existing markers
  if (healthMapInstance._markers) {
    healthMapInstance._markers.forEach((m) => healthMapInstance.removeLayer(m));
  }
  healthMapInstance._markers = [];

  // Add current location marker
  const currentLocationHtml = `
    <div style="background:#3b82f6; 
                width:20px; height:20px; border-radius:50%; border:3px solid white;
                box-shadow:0 0 10px rgba(59, 130, 246, 0.8);">
    </div>
  `;
  const currentLocationIcon = L.divIcon({
    html: currentLocationHtml,
    className: "current-location-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const currMarker = L.marker([16.7518928, 100.1914052], {
    icon: currentLocationIcon,
  })
    .addTo(healthMapInstance)
    .bindPopup("Your Location");

  healthMapInstance._markers.push(currMarker);

  const bounds = L.latLngBounds([16.7518928, 100.1914052]);

  // Add vet markers and render list
  if (vetData && vetData.places) {
    const listContainer = document.getElementById("health-vet-list");
    let listHTML = "";

    vetData.places.forEach((p) => {
      // Add marker to map
      const iconHtml = `
        <div style="background:#10b981; 
                    width:30px; height:30px; border-radius:50%; 
                    display:flex; align-items:center; justify-content:center;
                    color:white; font-size:14px; border:2px solid white;
                    box-shadow:0 2px 5px rgba(0,0,0,0.2);">
          ${p.icon}
        </div>
      `;
      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-place-marker",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon })
        .addTo(healthMapInstance)
        .bindPopup(`<b>${p.name}</b><br>${p.detail}`);

      healthMapInstance._markers.push(marker);
      bounds.extend([p.lat, p.lng]);

      // Generate list item HTML (replacing the hardcoded ones)
      listHTML += `
        <div class="vet-item"
            style="display:flex; justify-content:space-between; align-items:center; padding:16px; background:var(--white); border-radius:12px; border:1px solid var(--slate-ghost);">
            <div style="display:flex; flex-direction:column; gap:4px;">
                <strong style="font-size:15px; color:var(--slate);">${p.name}</strong>
                <span style="color:var(--slate-lite); font-size:13px;">${p.dist} · ${p.detail}</span>
            </div>
            <button onclick="routeTo(${p.lat}, ${p.lng})"
                style="border:none;background:#CFFDE1;color:#0D9488;padding:8px 14px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer; font-family:var(--font);">Get
                Directions</button>
        </div>
      `;
    });

    if (listContainer) {
      listContainer.innerHTML = listHTML;
    }
  }

  // Adjust map bounds and padding slightly later to allow container to size properly
  setTimeout(() => {
    // Only fitBounds if there are multiple markers
    if (vetData && vetData.places && vetData.places.length > 0) {
      healthMapInstance.fitBounds(bounds, { padding: [30, 30] });
    }
  }, 100);
}

/* ─── Vet Map Integration (Geolocation) ─── */
function loadMap(frameId, loadingId) {
  const frame = document.getElementById(frameId);
  const loading = document.getElementById(loadingId);
  if (!frame || !loading) return;

  // Only load once
  if (frame.src && frame.src.length > 0) return;

  const showMap = (lat, lon) => {
    const mapUrl = `https://maps.google.com/maps?q=pet+shop+near+${lat},${lon}&hl=th&z=14&output=embed`;
    frame.src = mapUrl;
    loading.style.display = "none";
    frame.style.display = "block";
  };

  if (!navigator.geolocation) {
    console.warn("Geolocation not supported by browser. Using default.");
    showMap(13.7563, 100.5018); // Default to Bangkok
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      showMap(position.coords.latitude, position.coords.longitude);
    },
    (error) => {
      console.warn(
        "Geolocation failed. Falling back to default location.",
        error,
      );
      showMap(13.7563, 100.5018); // Default to Bangkok
    },
    { timeout: 10000 },
  );
}

/* ─── Result Screen: Petshop Leaflet Map ─── */
let resultMapInstance = null;

async function loadResultPetshopMap() {
  const container = document.getElementById("result-map-container");
  const listEl = document.getElementById("result-petshop-list");
  if (!container) return;

  // Load petshop data
  let data;
  try {
    const res = await fetch("data/places.json");
    const all = await res.json();
    data = all["petshop"];
  } catch (e) {
    console.error("Failed to load petshop data:", e);
    return;
  }
  if (!data) return;

  // Populate list
  if (listEl) {
    listEl.innerHTML = data.places.map(p => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:var(--white); border-radius:12px; border:1px solid var(--slate-ghost);">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:24px; width:40px; text-align:center;">${p.icon}</div>
          <div>
            <div style="font-weight:700; font-size:14px; color:var(--slate);">${p.name}</div>
            <div style="font-size:12px; color:var(--slate-lite); margin-top:2px;">${p.detail} · ${p.dist}</div>
          </div>
        </div>
        <button onclick="routeTo(${p.lat}, ${p.lng})"
          style="border:none;background:var(--teal-light);color:var(--teal-dark);padding:8px 12px;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;font-family:var(--font);white-space:nowrap;">
          Directions
        </button>
      </div>
    `).join("");
  }

  // Init or refresh Leaflet map
  const centerLat = 16.7518928;
  const centerLng = 100.1914052;

  if (!resultMapInstance) {
    resultMapInstance = L.map("result-map-container", { zoomControl: false })
      .setView([centerLat, centerLng], 13);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
    }).addTo(resultMapInstance);
    L.control.zoom({ position: "bottomright" }).addTo(resultMapInstance);
  } else {
    resultMapInstance.invalidateSize();
  }

  // Clear old markers
  if (resultMapInstance._rMarkers) {
    resultMapInstance._rMarkers.forEach(m => resultMapInstance.removeLayer(m));
  }
  resultMapInstance._rMarkers = [];

  // Current location pin
  const myIcon = L.divIcon({
    html: `<div style="background:#3b82f6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(59,130,246,0.8);"></div>`,
    className: "", iconSize: [18, 18], iconAnchor: [9, 9],
  });
  const myMarker = L.marker([centerLat, centerLng], { icon: myIcon }).addTo(resultMapInstance);
  myMarker.bindPopup("<b>Your Location</b>");
  resultMapInstance._rMarkers.push(myMarker);

  // Place markers
  const bounds = L.latLngBounds([[centerLat, centerLng]]);
  data.places.forEach(p => {
    if (!p.lat || !p.lng) return;
    const icon = L.divIcon({
      html: `<div style="background:#ec4899;width:32px;height:32px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${p.icon}</div>`,
      className: "", iconSize: [32, 32], iconAnchor: [16, 16],
    });
    const m = L.marker([p.lat, p.lng], { icon }).addTo(resultMapInstance);
    m.bindPopup(`<b>${p.name}</b><br>${p.detail}`);
    resultMapInstance._rMarkers.push(m);
    bounds.extend([p.lat, p.lng]);
  });

  setTimeout(() => {
    resultMapInstance.invalidateSize();
    resultMapInstance.fitBounds(bounds, { padding: [20, 20] });
  }, 200);
}

/* ─── AI Scan Flow ─── */
const SCAN_STEPS = [
  { pct: 15, msg: "Initializing AI model..." },
  { pct: 30, msg: "Detecting tissue topology..." },
  { pct: 52, msg: "Scanning symptom markers..." },
  { pct: 70, msg: "Analyzing color spectrum..." },
  { pct: 85, msg: "Cross-referencing database..." },
  { pct: 95, msg: "Generating diagnosis report..." },
  { pct: 100, msg: "Analysis complete ✓" },
];

let selFilteredPets = [];
let selCurrentPage = 0;
const selPetsPerPage = 3;
let selTotalPages = 0;
let selIsGuest = false;
let selTouchStartX = 0;
let selTouchEndX = 0;

function populatePetSelection() {
  selFilteredPets = [...myPets];
  selCurrentPage = 0;
  selIsGuest = false;
  currentScanPetIndex = -1;
  
  const searchBox = document.getElementById('selSearchBox');
  if (searchBox) searchBox.value = '';
  const clearBtn = document.getElementById('selClearSearch');
  if (clearBtn) clearBtn.classList.remove('visible');
  
  updateSelStartBtn();
  renderSelPets();
  setupSelSwipe();
  
  const headerCount = document.getElementById('sel-header-pet-count');
  if (headerCount) headerCount.textContent = myPets.length + ' pets';
}

function renderSelPets() {
  const container = document.getElementById('selPaginationContainer');
  const dotsContainer = document.getElementById('selPaginationDots');
  const noResults = document.getElementById('selNoResults');
  const visibleCount = document.getElementById('selVisibleCount');
  const swipeHint = document.getElementById('selSwipeHint');
  const controls = document.getElementById('selPaginationControls');
  const info = document.getElementById('selPaginationInfo');
  
  if (!container) return;

  container.innerHTML = '';
  if(dotsContainer) dotsContainer.innerHTML = '';

  selTotalPages = Math.ceil(selFilteredPets.length / selPetsPerPage);

  if (selFilteredPets.length === 0) {
      if(noResults) noResults.classList.add('visible');
      if(visibleCount) visibleCount.textContent = '0 pets';
      if(swipeHint) swipeHint.style.display = 'none';
      if(controls) controls.style.display = 'none';
      if(info) info.style.display = 'none';
  } else {
      if(noResults) noResults.classList.remove('visible');
      if(visibleCount) visibleCount.textContent = `${selFilteredPets.length} pets`;

      if (selTotalPages > 1) {
          if(swipeHint) swipeHint.style.display = 'flex';
          if(controls) controls.style.display = 'flex';
          if(info) info.style.display = 'block';
      } else {
          if(swipeHint) swipeHint.style.display = 'none';
          if(controls) controls.style.display = 'none';
          if(info) info.style.display = 'none';
      }

      // Create pages
      for (let page = 0; page < selTotalPages; page++) {
          const pageDiv = document.createElement('div');
          pageDiv.className = 'sel-pagination-page';

          const start = page * selPetsPerPage;
          const end = Math.min(start + selPetsPerPage, selFilteredPets.length);
          const pagePets = selFilteredPets.slice(start, end);

          pagePets.forEach(pet => {
              const originalIndex = myPets.indexOf(pet);
              const card = createSelPetCard(pet, originalIndex);
              pageDiv.appendChild(card);
          });

          container.appendChild(pageDiv);

          // Create dot
          if(dotsContainer) {
              const dot = document.createElement('div');
              dot.className = 'sel-pagination-dot' + (page === selCurrentPage ? ' active' : '');
              dot.onclick = () => goToSelPage(page);
              dotsContainer.appendChild(dot);
          }
      }
  }

  updateSelPagination();
}

function createSelPetCard(pet, originalIndex) {
  const div = document.createElement('div');
  div.className = 'sel-pet-card' + (currentScanPetIndex === originalIndex ? ' selected' : '');
  div.onclick = (e) => {
      if (!e.target.closest('.sel-select-indicator')) {
          selectSelPet(div, originalIndex);
      }
  };

  const healthScore = pet.score || 100;
  const healthClass = healthScore > 80 ? 'healthy' : (healthScore > 60 ? 'warning' : 'critical');
  const healthText = healthScore > 80 ? 'Healthy' : (healthScore > 60 ? 'Needs Attention' : 'Critical');
  const healthIcon = healthScore > 80 ? 'fa-heartbeat' : 'fa-exclamation-circle';
  const iconClass = pet.emoji === '🐱' ? 'fa-cat' : (pet.emoji === '🐰' ? 'fa-carrot' : 'fa-dog');
  
  let photoHtml;
  if (pet.photoSrc) {
      photoHtml = `<img src="${pet.photoSrc}" alt="${pet.name}">`;
  } else {
      photoHtml = `${pet.emoji}`;
  }

  div.innerHTML = `
      <div class="sel-pet-avatar">
          ${photoHtml}
          <div class="sel-pet-status ${healthClass}"></div>
      </div>
      <div class="sel-pet-info">
          <h3>${pet.name}</h3>
          <p><i class="fas ${iconClass}"></i> ${pet.emoji === '🐱' ? 'Cat' : 'Dog'} • ${pet.meta || 'Mixed'}</p>
          <div class="sel-pet-health ${healthClass}">
              <i class="fas ${healthIcon}"></i>
              <span>${healthText}</span>
          </div>
      </div>
      <div class="sel-select-indicator">
          <i class="fas fa-check"></i>
      </div>
  `;
  return div;
}

function changeSelPage(direction) {
  const newPage = selCurrentPage + direction;
  if (newPage >= 0 && newPage < selTotalPages) {
      goToSelPage(newPage);
  }
}

function goToSelPage(page) {
  selCurrentPage = page;
  updateSelPagination();
}

function updateSelPagination() {
  const container = document.getElementById('selPaginationContainer');
  const dots = document.querySelectorAll('.sel-pagination-dot');
  const prevBtn = document.getElementById('selPrevBtn');
  const nextBtn = document.getElementById('selNextBtn');
  const info = document.getElementById('selPaginationInfo');

  if (!container) return;

  container.style.transform = `translateX(-${selCurrentPage * 100}%)`;

  dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === selCurrentPage);
  });

  if (prevBtn) prevBtn.disabled = selCurrentPage === 0;
  if (nextBtn) nextBtn.disabled = selCurrentPage === selTotalPages - 1;

  if (info) info.textContent = `Page ${selCurrentPage + 1} of ${selTotalPages}`;
}

function searchSelPets() {
  const searchTerm = document.getElementById('selSearchBox').value.toLowerCase().trim();
  const clearBtn = document.getElementById('selClearSearch');

  if (searchTerm.length > 0) {
      if(clearBtn) clearBtn.classList.add('visible');
      selFilteredPets = myPets.filter(pet => 
          pet.name.toLowerCase().includes(searchTerm) || 
          (pet.meta && pet.meta.toLowerCase().includes(searchTerm))
      );
  } else {
      if(clearBtn) clearBtn.classList.remove('visible');
      selFilteredPets = [...myPets];
  }

  selCurrentPage = 0;
  currentScanPetIndex = -1;
  selIsGuest = false;
  
  document.querySelectorAll('.sel-pet-card, .sel-guest-pet-card').forEach(card => {
      card.classList.remove('selected');
  });
  
  updateSelStartBtn();
  renderSelPets();
}

function clearSelSearch() {
  const sb = document.getElementById('selSearchBox');
  if(sb) {
      sb.value = '';
      searchSelPets();
      sb.focus();
  }
}

function selectSelPet(element, petIndex) {
  document.querySelectorAll('.sel-pet-card, .sel-guest-pet-card').forEach(card => {
      card.classList.remove('selected');
  });

  element.classList.add('selected');
  currentScanPetIndex = petIndex;
  selIsGuest = false;
  updateSelStartBtn();
}

function selectSelGuest() {
  const guestCard = document.getElementById('sel-card-guest');
  if (!guestCard) return;
  
  document.querySelectorAll('.sel-pet-card, .sel-guest-pet-card').forEach(card => {
      card.classList.remove('selected');
  });

  guestCard.classList.add('selected');
  currentScanPetIndex = -1;
  selIsGuest = true;
  updateSelStartBtn();
}

function updateSelStartBtn() {
  const btn = document.getElementById('selStartScanBtn');
  const btnText = document.getElementById('selScanBtnText');
  if (!btn || !btnText) return;

  if (!selIsGuest && currentScanPetIndex === -1) {
      btn.disabled = true;
      btn.className = 'sel-start-scan-btn';
      btnText.textContent = 'Select a pet to start scanning';
  } else if (selIsGuest) {
      btn.disabled = false;
      btn.className = 'sel-start-scan-btn sel-guest-mode';
      btnText.textContent = 'Scan (Not Saved)';
  } else {
      btn.disabled = false;
      btn.className = 'sel-start-scan-btn';
      btnText.textContent = 'Start Scanning';
  }
}

function startSelectedScan() {
  if (!selIsGuest && currentScanPetIndex === -1) return;
  goToScreen('screen-scan');
}

function setupSelSwipe() {
  const wrapper = document.getElementById('selPaginationWrapper');
  if (!wrapper || wrapper.dataset.swipeInit === "true") return;
  
  wrapper.dataset.swipeInit = "true";
  wrapper.addEventListener('touchstart', (e) => {
    selTouchStartX = e.changedTouches[0].screenX;
  }, {passive: true});
  
  wrapper.addEventListener('touchend', (e) => {
    selTouchEndX = e.changedTouches[0].screenX;
    handleSelSwipe();
  }, {passive: true});
  
  // Mouse events
  wrapper.addEventListener('mousedown', (e) => {
      selTouchStartX = e.screenX;
      wrapper.addEventListener('mousemove', handleSelMouseMove);
  });
  
  wrapper.addEventListener('mouseup', handleSelMouseUp);
  wrapper.addEventListener('mouseleave', handleSelMouseUp);
}

function handleSelMouseMove(e) {
    selTouchEndX = e.screenX;
}

function handleSelMouseUp(e) {
    const wrapper = document.getElementById('selPaginationWrapper');
    wrapper.removeEventListener('mousemove', handleSelMouseMove);
    if (selTouchEndX !== 0) {
        handleSelSwipe();
    }
    selTouchEndX = 0;
}

function handleSelSwipe() {
  const swipeThreshold = 50;
  const diff = selTouchStartX - selTouchEndX;

  if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
          if (selCurrentPage < selTotalPages - 1) changeSelPage(1);
      } else {
          if (selCurrentPage > 0) changeSelPage(-1);
      }
  }
  selTouchStartX = 0;
  selTouchEndX = 0;
}

let currentScanPart = "Eyes";
function selectScanPart(btn, part) {
  currentScanPart = part;
  document
    .querySelectorAll(".scan-part-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  const petName = currentScanPetIndex >= 0 ? myPets[currentScanPetIndex].name : "your pet";
  const statusText = document.getElementById("scan-status-text");
  if (statusText)
    statusText.textContent = `Align guides with ${petName}'s ${part.toLowerCase()} & hold still`;
}

function startScan() {
  const btn = document.getElementById("scan-capture-btn");
  btn.disabled = true;
  btn.style.opacity = "0.5";
  let step = 0;
  const statusText = document.getElementById("scan-status-text");
  const progressFill = document.getElementById("scan-progress");
  scanInterval = setInterval(() => {
    if (step < SCAN_STEPS.length) {
      const s = SCAN_STEPS[step];
      progressFill.style.width = s.pct + "%";
      statusText.textContent = s.msg;
      step++;
    } else {
      clearInterval(scanInterval);
    }
  }, 500);
  scanTimeout = setTimeout(
    () => {
      clearInterval(scanInterval);
      btn.disabled = false;
      btn.style.opacity = "1";
      progressFill.style.width = "0%";
      statusText.textContent = "Position affected area in frame";

      const scannedPartEl = document.getElementById("result-scanned-part");
      if (scannedPartEl) scannedPartEl.textContent = currentScanPart;

      const scannedPetEl = document.getElementById("result-scanned-pet");
      if (scannedPetEl) {
          scannedPetEl.textContent = currentScanPetIndex >= 0 ? myPets[currentScanPetIndex].name : "Guest Pet";
      }

      goToScreen("screen-result");
      animateScore(94);
    },
    SCAN_STEPS.length * 500 + 400,
  );
}

function resetScan() {
  clearInterval(scanInterval);
  clearTimeout(scanTimeout);
  document.getElementById("scan-progress").style.width = "0%";
  document.getElementById("scan-status-text").textContent =
    "Position affected area in frame";
  const btn = document.getElementById("scan-capture-btn");
  btn.disabled = false;
  btn.style.opacity = "1";
  goToScreen("screen-scan");
}

function animateScore(target) {
  const el = document.querySelector(".score-num");
  if (!el) return;
  let val = 0;
  const iv = setInterval(() => {
    val = Math.min(val + 3, target);
    el.textContent = val + "%";
    if (val >= target) clearInterval(iv);
  }, 30);
}

/* ─── Chatbot ─── */
function sendChat() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;

  // Guest quota: 3 free messages
  if (!isLoggedIn()) {
    if (guestChatCount >= 3) {
      showLoginModal("screen-chat");
      return;
    }
    guestChatCount++;
    localStorage.setItem("guestChatCount", guestChatCount);
    // Show quota warning
    const remaining = 3 - guestChatCount;
    if (remaining === 0) {
      appendBubble(
        `⚠️ คุณใช้ครบ 3 ข้อความฟรีแล้ว กรุณา Login เพื่อใช้งานต่อโดยไม่จำกัด`,
        "bot",
      );
    } else if (remaining === 1) {
      appendBubble(
        `💡 คุณเหลือสิทธิ์อีก ${remaining} ข้อความ Login เพื่อใช้งานไม่จำกัด`,
        "bot",
      );
    }
  }

  input.value = "";
  appendBubble(msg, "user");

  // Hide quick replies after first message
  const qr = document.getElementById("quick-replies");
  if (qr) qr.style.display = "none";

  // Typing indicator
  const typingId = appendBubble("...", "bot", true);

  setTimeout(
    () => {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      const reply = getBotReply(msg);
      appendBubble(reply, "bot");
      scrollChat();
    },
    900 + Math.random() * 600,
  );
}

function sendChatImage(inputEl) {
  if (!inputEl.files || !inputEl.files[0]) return;
  const file = inputEl.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    appendBubble(e.target.result, "user");

    // Hide quick replies after first message
    const qr = document.getElementById("quick-replies");
    if (qr) qr.style.display = "none";

    // Typing indicator
    const typingId = appendBubble("...", "bot", true);

    setTimeout(
      () => {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        appendBubble(
          "📸 ได้รับรูปภาพแล้วครับ จากการประมวลผลเบื้องต้น ดูเหมือนจะมีอาการระคายเคืองที่ผิวหนัง แนะนำให้ใช้ยาทาหรือแชมพูสูตรอ่อนโยน และควรปรึกษาสัตวแพทย์เพื่อความถูกต้องครับ",
          "bot",
        );
        scrollChat();
      },
      1500 + Math.random() * 1000,
    );
  };
  reader.readAsDataURL(file);
  inputEl.value = ""; // reset
}

function sendQuickReply(msg) {
  document.getElementById("chat-input").value = msg;
  sendChat();
}

function getBotReply(msg) {
  const lower = msg.toLowerCase();

  if (lower.includes("ทดลองระบบ") || lower.includes("demo")) {
    return `ยินดีต้อนรับสู่โหมดทดลองครับ! 🐶🐱\n\nผมคือ PetCare AI หมอประจำบ้านของคุณ\nลองพิมพ์อาการของน้องๆ มาให้ผมวิเคราะห์ดูสิครับ เช่น:\n- "น้องหมามีผื่นแดงที่ท้อง"\n- "แมวซึม ไม่กินอาหารมา 2 วัน"\n- หรือส่ง "รูปถ่าย" บริเวณที่มีอาการมาได้เลยครับ!`;
  }

  for (const [key, reply] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) return reply;
  }
  return `🤖 ขอบคุณสำหรับคำถามครับ\n"${msg}"\n\nสำหรับข้อมูลเฉพาะเจาะจงเรื่องนี้ แนะนำให้ปรึกษาสัตวแพทย์โดยตรงครับ หรือกดปุ่ม "Tele-Vet" เพื่อโทรหาสัตวแพทย์ทันที 🏥`;
}

let bubbleIdCounter = 0;
function appendBubble(text, role, isTyping = false) {
  const container = document.getElementById("chat-messages");
  bubbleIdCounter++;
  const id = "bubble-" + Date.now() + "-" + bubbleIdCounter;
  const now = new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const div = document.createElement("div");
  div.className = `chat-bubble ${role}`;
  div.id = id;

  let contentHtml = text;
  if (text.startsWith("data:image")) {
    contentHtml = `<img src="${text}" style="max-width:200px; border-radius:8px; margin-bottom:4px">`;
  } else {
    contentHtml = text.replace(/\n/g, "<br/>");
  }

  div.innerHTML = `
        <div class="bubble-text">${contentHtml}</div>
        <div class="bubble-time">${now}</div>
    `;
  container.appendChild(div);
  scrollChat();
  return id;
}

function scrollChat() {
  const c = document.getElementById("chat-messages");
  c.scrollTop = c.scrollHeight;
}

function clearChat() {
  const container = document.getElementById("chat-messages");
  container.innerHTML = `
            <div class="chat-bubble bot" >
        <div class="bubble-text">👋 สวัสดีครับ! ผม PetCare AI ผู้ช่วยดูแลสุขภาพสัตว์เลี้ยงแสนรู้ของคุณ 🐶🐱<br/><br/>วันนี้มีอะไรให้ผมช่วยดูแลน้องๆ บ้างไหมครับ? พิมพ์ถามอาการเบื้องต้น หรือส่งรูปภาพมาให้ผมวิเคราะห์ได้เลยนะครับ 😊</div>
        <div class="bubble-time">Now</div>
      </div>
            <div class="chat-quick-replies" id="quick-replies">
                <button class="quick-reply-btn" onclick="sendQuickReply('✨ ทดลองระบบ (Demo)')" style="border-color:#8B5CF6; color:#8B5CF6;">✨ ทดลองระบบ</button>
                <button class="quick-reply-btn" onclick="sendQuickReply('น้องหมาของฉันเกาตัวตลอดเวลา')">🐶 น้องเกาตัวตลอด</button>
                <button class="quick-reply-btn" onclick="sendQuickReply('สัตว์เลี้ยงไม่ยอมกินข้าว')">🍽️ ไม่ยอมกินข้าว</button>
                <button class="quick-reply-btn" onclick="sendQuickReply('วัคซีนควรฉีดตอนไหน')">💉 ตารางวัคซีน</button>
            </div>
        `;
}

/* ─── Mini Game ─── */
let gameCoins = parseInt(localStorage.getItem("fufu_coins") || "0");
let lastSpinDate = localStorage.getItem("fufu_last_spin") || "";
let adSpinsToday = parseInt(
  localStorage.getItem("fufu_ad_spins_date") === new Date().toDateString()
    ? localStorage.getItem("fufu_ad_spins") || "0"
    : "0",
);

function updateCoinDisplay() {
  const el = document.getElementById("game-coin-amount");
  if (el) el.textContent = gameCoins;
}

function updateGameUI() {
  updateCoinDisplay();
  // Spin dots
  for (let i = 0; i < 3; i++) {
    const dot = document.getElementById(`spin-dot-${i}`);
    if (dot)
      dot.style.background =
        i < adSpinsToday ? "#f59e0b" : "var(--slate-ghost)";
  }
  const spinDisp = document.getElementById("spin-count-display");
  if (spinDisp) spinDisp.textContent = adSpinsToday;
  const adLeft = document.getElementById("ad-spins-left");
  if (adLeft) adLeft.textContent = `${3 - adSpinsToday} left`;

  // Login bonus streak
  const streak = parseInt(localStorage.getItem("fufu_login_streak") || "0");
  ["7", "15", "30"].forEach((d) => {
    const el = document.getElementById(`bonus-${d}-streak`);
    if (el) el.textContent = `${Math.min(streak, parseInt(d))}/${d} days`;
    const card = document.getElementById(`bonus-${d}`);
    if (card) {
      const reached = streak >= parseInt(d);
      card.style.borderColor = reached ? "#7c3aed" : "var(--slate-ghost)";
      card.style.background = reached ? "#f5f3ff" : "white";
    }
  });

  // Check if daily free spin already used
  const today = new Date().toDateString();
  const freeBtn = document.getElementById("btn-spin-free");
  if (freeBtn) {
    if (lastSpinDate === today) {
      freeBtn.disabled = true;
      freeBtn.style.opacity = "0.4";
      freeBtn.innerHTML = "✅ Free Spin Used Today";
    } else {
      freeBtn.disabled = false;
      freeBtn.style.opacity = "1";
      freeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="width:18px;height:18px; margin-right:4px;"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Spin Now! (Daily Free)`;
    }
  }

  // Ad spin button
  const adBtn = document.getElementById("btn-spin-ad");
  if (adBtn) {
    if (adSpinsToday >= 3) {
      adBtn.disabled = true;
      adBtn.style.opacity = "0.4";
      adBtn.innerHTML = "✅ All Ads Watched Today";
    } else {
      adBtn.disabled = false;
      adBtn.style.opacity = "1";
      adBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="width:18px;height:18px; margin-right:4px;"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Spin Now! (Watch Ad) <span style="background:#fef3c7; color:#92400e; font-size:11px; padding:2px 8px; border-radius:100px; font-weight:800; margin-left:auto;" id="ad-spins-left">${3 - adSpinsToday} left</span>`;
    }
  }

  // Bonus status text
  const lastCheckin = localStorage.getItem("fufu_last_checkin") || "";
  const bonusStatus = document.getElementById("bonus-status");
  if (bonusStatus) {
    bonusStatus.textContent =
      lastCheckin === today ? "✅ Checked in today!" : "Tap to check in";
  }
}

function doSpinAnimation(callback) {
  const prizes = [10, 50, 5, 100, 20, 30];
  const winIndex = Math.floor(Math.random() * prizes.length);
  const coins = prizes[winIndex];
  const currentDeg = parseInt(
    document.getElementById("game-wheel-inner")._currentDeg || 0,
  );
  const deg = currentDeg + 360 * 4 + winIndex * 60 + 30;
  const inner = document.getElementById("game-wheel-inner");
  if (inner) {
    inner._currentDeg = deg;
    inner.style.transition = "transform 3s cubic-bezier(0.17,0.67,0.12,0.99)";
    inner.style.transform = `rotate(${deg}deg)`;
  }
  setTimeout(() => {
    callback(coins);
  }, 3200);
}

function spinWheelFree() {
  const today = new Date().toDateString();
  if (lastSpinDate === today) return;
  const freeBtn = document.getElementById("btn-spin-free");
  const adBtn = document.getElementById("btn-spin-ad");
  if (freeBtn) {
    freeBtn.disabled = true;
    freeBtn.style.opacity = "0.5";
  }
  if (adBtn) adBtn.disabled = true;
  doSpinAnimation((coins) => {
    gameCoins += coins;
    lastSpinDate = today;
    localStorage.setItem("fufu_coins", gameCoins);
    localStorage.setItem("fufu_last_spin", today);
    showSpinResult(coins);
    updateGameUI();
  });
}

function spinWheelAd() {
  const today = new Date().toDateString();
  if (adSpinsToday >= 3) return;
  // Simulate watching an ad
  showAdModal(() => {
    const freeBtn = document.getElementById("btn-spin-free");
    const adBtn = document.getElementById("btn-spin-ad");
    if (freeBtn) freeBtn.disabled = true;
    if (adBtn) {
      adBtn.disabled = true;
      adBtn.style.opacity = "0.5";
    }
    doSpinAnimation((coins) => {
      gameCoins += coins;
      adSpinsToday++;
      localStorage.setItem("fufu_coins", gameCoins);
      localStorage.setItem("fufu_ad_spins", adSpinsToday);
      localStorage.setItem("fufu_ad_spins_date", today);
      showSpinResult(coins);
      updateGameUI();
    });
  });
}

// Admin / Testing function to wipe spin data
function resetGameData() {
  gameCoins = 0;
  lastSpinDate = "";
  adSpinsToday = 0;
  localStorage.removeItem("fufu_coins");
  localStorage.removeItem("fufu_last_spin");
  localStorage.removeItem("fufu_ad_spins");
  localStorage.removeItem("fufu_ad_spins_date");
  localStorage.removeItem("fufu_last_checkin");
  localStorage.removeItem("fufu_login_streak");
  updateGameUI();
  alert("Game data and coins reset!");
}

function showAdModal(onComplete) {
  const modal = document.createElement("div");
  modal.id = "ad-modal";
  let countdown = 5;
  modal.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;">
      <div style="background:#1a1a2e;border-radius:20px;padding:32px 24px;text-align:center;width:90%;max-width:340px;">
        <div style="font-size:48px;margin-bottom:12px;">📺</div>
        <div style="font-size:18px;font-weight:800;color:white;margin-bottom:8px;">Watching Ad...</div>
        <div style="font-size:13px;color:#94a3b8;margin-bottom:20px;">Watch to earn a bonus spin!</div>
        <div style="background:#0f172a;border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:36px;font-weight:900;color:#f59e0b;" id="ad-countdown">${countdown}</div>
          <div style="font-size:11px;color:#64748b;">seconds remaining</div>
        </div>
        <button id="ad-skip-btn" disabled style="padding:10px 24px;border-radius:100px;border:none;background:#334155;color:#94a3b8;font-weight:700;cursor:not-allowed;font-family:var(--font);">Skip Ad ✕</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const iv = setInterval(() => {
    countdown--;
    const cdEl = document.getElementById("ad-countdown");
    if (cdEl) cdEl.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(iv);
      const skipBtn = document.getElementById("ad-skip-btn");
      if (skipBtn) {
        skipBtn.disabled = false;
        skipBtn.style.background = "#f59e0b";
        skipBtn.style.color = "white";
        skipBtn.style.cursor = "pointer";
        skipBtn.onclick = () => {
          modal.remove();
          onComplete();
        };
      }
    }
  }, 1000);
}

function showSpinResult(coins) {
  const modal = document.createElement("div");
  modal.innerHTML = `
    <div id="spin-result-modal" onclick="this.parentElement.remove()" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;">
      <div style="background:white;border-radius:24px;padding:32px 28px;text-align:center;width:80%;max-width:300px;">
        <div style="font-size:56px;margin-bottom:8px;">🎉</div>
        <div style="font-size:28px;font-weight:900;color:var(--teal);margin-bottom:4px;">+${coins} Coins!</div>
        <div style="font-size:14px;color:var(--slate-lite);margin-bottom:20px;">Added to your balance</div>
        <button onclick="this.closest('[id]').parentElement.remove()" style="padding:10px 28px;border-radius:100px;border:none;background:var(--teal);color:white;font-weight:700;font-size:14px;cursor:pointer;font-family:var(--font);">Awesome! 🎰</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function doLoginBonus() {
  const today = new Date().toDateString();
  const lastCheckin = localStorage.getItem("fufu_last_checkin") || "";
  const bonusStatus = document.getElementById("bonus-status");
  if (lastCheckin === today) {
    if (bonusStatus) bonusStatus.textContent = "✅ Already checked in today!";
    return;
  }
  // Update streak
  const lastDate = localStorage.getItem("fufu_last_checkin") || "";
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let streak = parseInt(localStorage.getItem("fufu_login_streak") || "0");
  if (lastDate === yesterday) {
    streak++;
  } else if (lastDate !== today) {
    streak = 1; // Reset streak if missed a day
  }
  localStorage.setItem("fufu_login_streak", streak);
  localStorage.setItem("fufu_last_checkin", today);

  // Base +5 coins
  let bonus = 5;
  let milestoneMsg = "";
  if (streak === 7) {
    bonus += 50;
    milestoneMsg = " 🌟 7-Day Milestone! +50 Bonus!";
  } else if (streak === 15) {
    bonus += 150;
    milestoneMsg = " 💫 15-Day Milestone! +150 Bonus!";
  } else if (streak === 30) {
    bonus += 500;
    milestoneMsg = " 👑 30-Day Milestone! +500 Bonus!";
  }

  gameCoins += bonus;
  localStorage.setItem("fufu_coins", gameCoins);
  updateGameUI();
  showSpinResult(bonus);
  if (bonusStatus)
    bonusStatus.textContent = `✅ Day ${streak} streak!${milestoneMsg}`;
}

function redeemReward(cost, rewardName) {
  if (gameCoins < cost) {
    alert(`เหรียญไม่พอ! ต้องใช้ ${cost} Coins (คุณมี ${gameCoins} Coins)`);
    return;
  }
  if (confirm(`แลก "${rewardName}" ด้วย ${cost} Coins?`)) {
    gameCoins -= cost;
    localStorage.setItem("fufu_coins", gameCoins);
    updateCoinDisplay();
    alert(`✅ แลกสำเร็จ! "${rewardName}" ถูกเพิ่มในบัญชีของคุณแล้ว`);
  }
}

/* ─── Pet Edit / Delete ─── */
let currentViewingPetIndex = 0;

function editPet(index) {
  // Navigate to profile screen in edit mode
  const pet = myPets[index];
  if (!pet) return;
  window.currentEditingPetIndex = index;
  // Pre-fill form fields
  document.getElementById("pet-name").value = pet.name || "";
  document.getElementById("pet-age").value = pet.age || "";
  document.getElementById("pet-weight").value = pet.weight || "";
  document.getElementById("pet-gender").value = pet.gender || "";
  document.getElementById("pet-microchip").value = pet.microchip || "";
  if (pet.breed) {
    selectedBreed = pet.breed;
    const breedInput = document.getElementById("breed-search");
    if (breedInput) breedInput.value = pet.breed;
  }
  goToScreen("screen-profile");
}

function deletePet(index) {
  const pet = myPets[index];
  if (!pet) return;
  if (!confirm(`Delete "${pet.name}"?`)) return;
  myPets.splice(index, 1);
  window.currentViewPetIndex = null;
  renderPetCards();
  updateHealthScreenVisibility();
  goToScreen("screen-home");
}

function editCurrentPet() {
  editPet(currentViewingPetIndex);
}
function deleteCurrentPet() {
  deletePet(currentViewingPetIndex);
}

// openPetProfile logic merged to the main function above

/* ─── Daily Check-in ─── */
function dailyCheckIn() {
  const today = new Date().toDateString();
  const lastCheckin = localStorage.getItem("fufu_last_checkin") || "";
  if (lastCheckin === today) {
    alert("คุณเช็คอินไปแล้ววันนี้! ✅\nกลับมาเช็คอินใหม่พรุ่งนี้นะ 🩺");
    return;
  }
  localStorage.setItem("fufu_last_checkin", today);
  gameCoins += 5;
  localStorage.setItem("fufu_coins", gameCoins);
  updateCoinDisplay();
  alert(
    "✅ Daily Check-in สำเร็จ!\n+5 Coins 🪙\n\nอย่าลืมสังเกตอาการน้องๆ ทุกวันนะ",
  );
}

/* ─── Edit Profile & Change Password ─── */
function editProfile() {
  if (!isLoggedIn()) {
    showLoginModal("screen-owner");
    return;
  }
  const newName = prompt("Full Name:", currentUser.name);
  if (newName === null) return;
  const newEmail = prompt("Email:", currentUser.email);
  if (newEmail === null) return;
  if (newName.trim()) currentUser.name = newName.trim();
  if (newEmail.trim()) currentUser.email = newEmail.trim();
  updateOwnerUI();
  updateHomeUI();
  alert("โปรไฟล์อัปเดตสำเร็จ! ✅");
}

function changePassword() {
  if (!isLoggedIn()) {
    showLoginModal("screen-owner");
    return;
  }
  const oldPass = prompt("Current Password:");
  if (!oldPass) return;
  const newPass = prompt("New Password (min 8 chars):");
  if (!newPass || newPass.length < 8) {
    alert("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
    return;
  }
  const confirmPass = prompt("Confirm New Password:");
  if (newPass !== confirmPass) {
    alert("รหัสผ่านไม่ตรงกัน กรุณาลองใหม่");
    return;
  }
  alert("เปลี่ยนรหัสผ่านสำเร็จ! ✅");
}

/* ─── Help Center Functions ─── */
function reportBug() {
  const desc = prompt("อธิบายปัญหาที่คุณพบ:");
  if (desc && desc.trim()) {
    alert("ขอบคุณสำหรับรายงาน! 🐛\n\nทีมงานจะตรวจสอบและแก้ไขโดยเร็วที่สุดครับ");
  }
}

function showTerms() {
  alert(
    "Terms & Conditions\n\n1. การใช้งานแอป FUFU Pet Care อยู่ภายใต้เงื่อนไขนี้\n2. ข้อมูลจาก AI เป็นเพียงคำแนะนำเบื้องต้นเท่านั้น\n3. กรุณาปรึกษาสัตวแพทย์สำหรับการรักษาจริง\n4. ห้ามใช้แอปเพื่อวัตถุประสงค์ที่ผิดกฎหมาย\n5. บริษัทขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไข",
  );
}

function showPrivacy() {
  alert(
    "Privacy Policy\n\n🔒 ข้อมูลของคุณปลอดภัย\n\n• เราไม่ขายข้อมูลส่วนตัวให้บุคคลที่สาม\n• รูปภาพสัตว์เลี้ยงถูกประมวลผลในเซิร์ฟเวอร์ที่ปลอดภัย\n• คุณสามารถลบบัญชีได้ตลอดเวลา\n• ข้อมูลจะถูกเข้ารหัสเสมอ",
  );
}

// Init coin display on load
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(updateCoinDisplay, 100);
});
