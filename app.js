/* ─── Breed Data ─── */
const BREEDS = {
    dog: [
        'Golden Retriever', 'Labrador Retriever', 'French Bulldog', 'Bulldog',
        'German Shepherd', 'Poodle (Toy)', 'Poodle (Standard)', 'Husky', 'Chihuahua',
        'Beagle', 'Rottweiler', 'Dachshund', 'Shih Tzu', 'Maltese', 'Border Collie',
        'Pomeranian', 'Yorkshire Terrier', 'Doberman Pinscher', 'Boxer', 'Shiba Inu',
        'Corgi (Pembroke)', 'Cavalier King Charles', 'Australian Shepherd', 'Samoyed',
        'Bichon Frisé', 'Bernese Mountain Dog', 'Great Dane', 'Akita', 'Weimaraner',
    ],
    cat: [
        'Scottish Fold', 'Persian', 'British Shorthair', 'Siamese', 'Maine Coon',
        'Ragdoll', 'Bengal', 'Abyssinian', 'Russian Blue', 'Sphynx', 'Norwegian Forest',
        'Burmese', 'Birman', 'Oriental Shorthair', 'Turkish Angora', 'Devon Rex',
        'Cornish Rex', 'Exotic Shorthair', 'Tonkinese', 'Somali', 'Manx', 'Balinese',
        'Havana Brown', 'Chartreux', 'Siberian', 'American Shorthair', 'Savannah',
    ],
};

/* ─── AI Chat Responses ─── */
const BOT_RESPONSES = {
    'เกา': '🐾 อาการเกาตัวบ่อยอาจเกิดจาก:\n• ภูมิแพ้อาหารหรือสิ่งแวดล้อม\n• เห็บหรือหมัด\n• ผิวหนังแห้ง\n\nแนะนำให้ลองอาบน้ำด้วยแชมพูสำหรับสัตว์เลี้ยง และกำจัดหมัดพร้อมนัดสัตวแพทย์ หากอาการไม่ดีขึ้นครับ',
    'กินข้าว': '🍽️ สัตว์เลี้ยงไม่กินอาหารอาจเกิดจาก:\n• เบื่ออาหารชั่วคราว (ปกติ 1-2 วัน)\n• มีไข้หรือป่วย\n• เปลี่ยนอาหารกะทันหัน\n\nลองให้อาหารชนิดโปรดหรือผสมน้ำอุ่นลงไป ถ้าไม่กินเกิน 2 วันควรพาพบสัตวแพทย์ครับ',
    'วัคซีน': '💉 ตารางวัคซีนพื้นฐาน:\n• ลูกหมา/แมว: 6-8 สัปดาห์\n• กระตุ้น: ทุก 3-4 สัปดาห์จนอายุ 16 สัปดาห์\n• บาดทะยัก: ทุกปี\n• พิษสุนัขบ้า: ทุกปีตามกฎหมาย\n\nสามารถนัดฉีดวัคซีนผ่านแอปได้เลยครับ 📅',
    'ท้องเสีย': '🏥 หากสัตว์เลี้ยงท้องเสีย:\n• ให้น้ำสะอาดตลอดเวลา\n• งดอาหาร 12-24 ชั่วโมง\n• ให้อาหารอ่อน เช่น ข้าวต้มไก่\n\n⚠️ ถ้ามีเลือดในอุจจาระ, อาเจียน, หรืออาการหนักให้รีบพาพบสัตวแพทย์ทันทีครับ',
};

/* ─── State ─── */
let currentPet = 'dog';
let selectedBreed = '';
let scanInterval = null;
let scanTimeout = null;
let selectedPlanIndex = 0;
let currentUser = { name: '', email: '', plan: 0 };
let myPets = [];
const PLAN_NAMES = ['Essential (Free)', 'Care Plus ($5/mo)', 'Protection ($10/mo)', 'VET VIP ($50/mo)'];
const PLAN_SHORT = ['Free', 'Starter', 'Pro', 'VIP'];

/* ─── On Load ─── */
window.addEventListener('DOMContentLoaded', () => {
    const shell = document.createElement('div');
    shell.id = 'app-shell';
    document.body.appendChild(shell);
    document.querySelectorAll('.screen, .bottom-nav').forEach(el => shell.appendChild(el));

    populateBreedList('dog');
    animateSplash();
    updateGreeting();
});

function updateGreeting() {
    const h = new Date().getHours();
    const g = h < 12 ? 'Good morning ☀️' : h < 18 ? 'Good afternoon 🌤️' : 'Good evening 🌙';
    ['home-greeting'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = g; });
}

/* ─── Splash ─── */
function animateSplash() {
    const dots = document.querySelectorAll('.dot');
    let idx = 0;

    const iv = setInterval(() => {
        dots.forEach(d => d.classList.remove('active'));
        dots[idx % dots.length].classList.add('active');
        idx++;
    }, 500);

    setTimeout(() => {
        clearInterval(iv);
        goToScreen('screen-auth');
    }, 2600);
}

/* ─── Owner Profile Photo ─── */
function handleOwnerPhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const avatarWrap = document.getElementById('owner-avatar');
            avatarWrap.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />
                <div class="avatar-edit-icon" style="position:absolute; bottom:-4px; right:-4px; background:white; border-radius:50%; padding:4px; box-shadow:0 2px 8px rgba(0,0,0,0.1); display:flex; z-index:2;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" style="width:16px;height:16px;">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                </div>`;
            avatarWrap.style.background = 'transparent'; // Remove default bg
        }
        reader.readAsDataURL(file);
    }
}

/* ─── Screen Navigation ─── */
const NAV_HIDDEN_SCREENS = new Set(['screen-splash', 'screen-scan', 'screen-plans', 'screen-auth', 'screen-payment']);

function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');

    const nav = document.getElementById('bottom-nav');
    if (NAV_HIDDEN_SCREENS.has(screenId)) {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
    }

    const tabMap = {
        'screen-home': 'tab-home',
        'screen-profile': 'tab-health',
        'screen-scan': 'tab-scan',
        'screen-result': 'tab-scan',
        'screen-health': 'tab-health',
        'screen-chat': 'tab-chat',
        'screen-owner': 'tab-profile',
    };
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const activeTab = tabMap[screenId];
    if (activeTab) document.getElementById(activeTab)?.classList.add('active');

    // Side effects per screen
    if (screenId === 'screen-chat') {
        const banner = document.getElementById('vip-call-banner');
        if (banner) banner.style.display = currentUser.plan === 3 ? 'flex' : 'none';
    }
    if (screenId === 'screen-health' || screenId === 'screen-home') {
        syncPetInfoDisplays();
    }
    if (screenId === 'screen-health') {
        loadMap('map-frame', 'map-loading');
    }
    if (screenId === 'screen-result') {
        loadMap('result-map-frame', 'result-map-loading');
    }
}

function navTo(tab) {
    const map = {
        home: 'screen-home',
        scan: 'screen-scan',
        health: 'screen-health',
        chat: 'screen-chat',
        owner: 'screen-owner',
        profile: 'screen-owner',
    };
    goToScreen(map[tab]);
}

/* ─── Pet Toggle ─── */
function selectPet(type) {
    currentPet = type;
    const slider = document.getElementById('toggle-slider');
    const btnDog = document.getElementById('btn-dog');
    const btnCat = document.getElementById('btn-cat');
    if (type === 'dog') {
        slider.classList.remove('right');
        btnDog.classList.add('active');
        btnCat.classList.remove('active');
    } else {
        slider.classList.add('right');
        btnCat.classList.add('active');
        btnDog.classList.remove('active');
    }
    document.getElementById('breed-search').value = '';
    selectedBreed = '';
    closeBreedDropdown();
    populateBreedList(type);
    const petCircle = document.getElementById('vf-pet-circle');
    if (petCircle) petCircle.textContent = type === 'dog' ? '🐶' : '🐱';
}

/* ─── Pet Photo Upload ─── */
function previewPetPhoto(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        const img = document.getElementById('pet-photo-img');
        const placeholder = document.querySelector('.pet-photo-placeholder');
        img.src = e.target.result;
        img.style.display = 'block';
        placeholder.style.display = 'none';
        document.querySelector('.pet-photo-preview').style.border = '2.5px solid var(--teal)';
    };
    reader.readAsDataURL(input.files[0]);
}

/* ─── Breed Dropdown ─── */
function populateBreedList(type, filter = '') {
    const dropdown = document.getElementById('breed-dropdown');
    const list = BREEDS[type] || [];
    const filtered = list.filter(b => b.toLowerCase().includes(filter.toLowerCase()));
    dropdown.innerHTML = filtered.map(
        b => `<div class="breed-option" tabindex="0" onclick="chooseBreed('${b}')">${b}</div>`
    ).join('');
}

function filterBreeds(val) {
    populateBreedList(currentPet, val);
    openBreedDropdown();
}

function openBreedDropdown() {
    document.getElementById('breed-dropdown').classList.add('open');
    document.addEventListener('click', outsideClickHandler);
}

function closeBreedDropdown() {
    document.getElementById('breed-dropdown').classList.remove('open');
    document.removeEventListener('click', outsideClickHandler);
}

function outsideClickHandler(e) {
    const wrap = document.querySelector('.select-wrap');
    if (wrap && !wrap.contains(e.target)) closeBreedDropdown();
}

function chooseBreed(breed) {
    selectedBreed = breed;
    document.getElementById('breed-search').value = breed;
    closeBreedDropdown();
}

/* ─── Plan Selection ─── */
function selectPlan(card, index) {
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedPlanIndex = index;
    currentUser.plan = index;

    const cta = document.getElementById('plans-cta-btn');
    cta.style.opacity = '1';
    cta.style.pointerEvents = 'auto';
    cta.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" class="btn-icon">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
      Continue &nbsp;·&nbsp; ${index === 0 ? 'Enter Pet Info' : 'Checkout'}
    `;
    cta.onclick = () => {
        updateOwnerUI();
        updateHomeUI();
        if (index === 0) {
            goToScreen('screen-profile'); // Skip payment for free plan
        } else {
            document.getElementById('payment-plan-name').textContent = PLAN_NAMES[index].split(' (')[0];
            goToScreen('screen-payment'); // Route to payment for paid plans
        }
    };
}

/* ─── Payment Selection ─── */
let selectedPayment = 'promptpay';

function selectPaymentMethod(card, method) {
    document.querySelectorAll('.payment-card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('.payment-card-inner').style.borderColor = 'transparent';
        c.querySelector('.payment-card-inner').style.boxShadow = 'var(--shadow-card)';
        c.querySelector('.payment-check').style.background = 'transparent';
        c.querySelector('.payment-check').style.border = '2px solid var(--slate-ghost)';
        c.querySelector('.payment-check svg').style.opacity = '0';
    });

    card.classList.add('selected');
    card.querySelector('.payment-card-inner').style.borderColor = 'var(--teal)';
    card.querySelector('.payment-card-inner').style.boxShadow = '0 8px 24px rgba(13,148,136,0.15)';
    card.querySelector('.payment-check').style.background = 'var(--teal)';
    card.querySelector('.payment-check').style.border = 'none';
    card.querySelector('.payment-check svg').style.opacity = '1';

    selectedPayment = method;
}

function confirmPayment() {
    alert('Payment for ' + PLAN_NAMES[currentUser.plan] + ' via ' + selectedPayment.toUpperCase() + ' successful! (Demo)');
    goToScreen('screen-profile');
}

/* ─── Auth ─── */
function switchAuthTab(tab) {
    document.getElementById('auth-tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('auth-tab-register').classList.toggle('active', tab === 'register');
    document.getElementById('auth-form-login').style.display = tab === 'login' ? '' : 'none';
    document.getElementById('auth-form-register').style.display = tab === 'register' ? '' : 'none';
}

function socialLogin(provider) {
    currentUser.name = provider === 'google' ? 'Google User' : 'Facebook User';
    currentUser.email = 'user@' + provider + '.com';
    afterLogin();
}

function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    if (!email) { alert('Please enter your email'); return; }
    currentUser.email = email;
    currentUser.name = email.split('@')[0];
    afterLogin();
}

function doRegister() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    if (!name || !email) { alert('Please fill in all fields'); return; }
    currentUser.name = name;
    currentUser.email = email;
    afterLogin();
}

function afterLogin() {
    goToScreen('screen-plans');
}

function doLogout() {
    currentUser = { name: '', email: '', plan: 0 };
    selectedPlanIndex = 0;
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
    const cta = document.getElementById('plans-cta-btn');
    cta.style.opacity = '0.5'; cta.style.pointerEvents = 'none';
    cta.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn-icon"><path d="M5 12h14M12 5l7 7-7 7"/></svg>Select a Plan to Continue`;
    goToScreen('screen-auth');
}

function updateOwnerUI() {
    const n = currentUser.name || 'Pet Owner';
    const e = currentUser.email || '';
    const p = PLAN_NAMES[currentUser.plan] || 'Essential (Free)';
    ['owner-display-name', 'owner-row-name'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = n; });
    ['owner-display-email', 'owner-row-email'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = e; });
    ['owner-plan-pill', 'owner-row-plan'].forEach((id, i) => { const el = document.getElementById(id); if (el) el.textContent = i === 0 ? PLAN_SHORT[currentUser.plan] + ' Plan' : p; });
}

function updateHomeUI() {
    const n = currentUser.name || 'there';
    const el = document.getElementById('home-owner-name');
    if (el) el.textContent = 'Hi, ' + n.split(' ')[0] + '!';
    const pb = document.getElementById('home-plan-badge');
    if (pb) pb.textContent = PLAN_SHORT[currentUser.plan] || 'Free';
    updateGreeting();
}

function syncPetInfoDisplays() {
    const rawName = document.getElementById('pet-name')?.value || '';
    const name = rawName.trim();

    // If name is completely empty, it means the user just navigated here 
    // or clicked continue without adding a new pet. Do not duplicate.
    if (!name) {
        return;
    }

    const age = document.getElementById('pet-age')?.value || '';
    const wt = document.getElementById('pet-weight')?.value || '';
    const breed = selectedBreed || document.getElementById('breed-search')?.value || '';
    const emoji = currentPet === 'cat' ? '🐱' : '🐶';

    // Meta string
    const parts = [breed || 'Mixed', age ? age + ' yrs' : '', wt ? wt + ' kg' : ''].filter(Boolean);
    const meta = parts.join(' · ');

    // Determine if a photo was uploaded
    const photoImg = document.getElementById('pet-photo-img');
    const photoSrc = (photoImg && photoImg.style.display !== 'none') ? photoImg.src : null;

    // Store in myPets array
    myPets.push({
        name,
        breed: breed || 'Mixed',
        age,
        weight: wt,
        emoji,
        photoSrc,
        meta,
        score: Math.floor(Math.random() * 20) + 70 // Mock score 70-90
    });

    // Reset form for next pet
    document.getElementById('pet-name').value = '';
    document.getElementById('pet-age').value = '';
    document.getElementById('pet-weight').value = '';
    document.getElementById('breed-search').value = '';
    if (photoImg) {
        photoImg.style.display = 'none';
        photoImg.src = '';
    }
    const ph = document.getElementById('pet-photo-placeholder');
    if (ph) ph.style.display = 'flex';

    renderPetCards();

    // Default the health screen to show the first pet if this is the first one added
    if (myPets.length === 1) {
        updateHealthScreenForPet(0);
    }
}

function updateHealthScreenForPet(index) {
    const pet = myPets[index];
    if (!pet) return;

    const hp = document.getElementById('health-pet-photo');
    if (hp) {
        if (pet.photoSrc) { hp.innerHTML = `<img src="${pet.photoSrc}" alt="Pet">`; }
        else { hp.textContent = pet.emoji; }
    }
    const hn = document.getElementById('health-pet-name-display'); if (hn) hn.textContent = pet.name;
    const hm = document.getElementById('health-pet-meta-display'); if (hm) hm.textContent = pet.meta;
}

function openPetProfile(index) {
    updateHealthScreenForPet(index);
    goToScreen('screen-health');
}

function renderPetCards() {
    const list = document.getElementById('pet-cards-list');
    if (!list) return;

    // Clear list
    list.innerHTML = '';

    myPets.forEach((pet, i) => {
        const div = document.createElement('div');
        div.className = 'pet-card';
        div.onclick = () => openPetProfile(i);

        let photoHtml = pet.photoSrc ? `<img src="${pet.photoSrc}" alt="${pet.name}">` : pet.emoji;

        // Simple health score logic
        let dotClass = pet.score > 80 ? 'green' : (pet.score > 60 ? 'orange' : 'red');
        let statusText = pet.score > 80 ? 'Good' : (pet.score > 60 ? 'Fair' : 'Needs Attention');

        div.innerHTML = `
          <div class="pet-card-photo">${photoHtml}</div>
          <div class="pet-card-info">
            <div class="pet-card-name">${pet.name}</div>
            <div class="pet-card-breed">${pet.meta}</div>
            <div class="pet-card-status">
              <span class="pet-status-dot ${dotClass}"></span>
              <span class="pet-status-text">Health Score ${pet.score} · ${statusText}</span>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;flex-shrink:0;opacity:.35"><path d="M9 18l6-6-6-6"/></svg>
        `;
        list.appendChild(div);
    });

    // Update owner profile pet count
    const petsUi = document.getElementById('owner-row-pets');
    if (petsUi) {
        petsUi.textContent = `${myPets.length} pet${myPets.length !== 1 ? 's' : ''} registered`;
    }
}

/* ─── Vet Map Integration (Geolocation) ─── */
function loadMap(frameId, loadingId) {
    const frame = document.getElementById(frameId);
    const loading = document.getElementById(loadingId);
    if (!frame || !loading) return;

    // Only load once
    if (frame.src && frame.src.length > 0) return;

    const showMap = (lat, lon) => {
        const mapUrl = `https://maps.google.com/maps?q=${lat},${lon}&hl=th&z=14&output=embed`;
        frame.src = mapUrl;
        loading.style.display = 'none';
        frame.style.display = 'block';
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
            console.warn("Geolocation failed. Falling back to default location.", error);
            showMap(13.7563, 100.5018); // Default to Bangkok
        },
        { timeout: 10000 }
    );
}

/* ─── AI Scan Flow ─── */
const SCAN_STEPS = [
    { pct: 15, msg: 'Initializing AI model...' },
    { pct: 30, msg: 'Detecting tissue topology...' },
    { pct: 52, msg: 'Scanning symptom markers...' },
    { pct: 70, msg: 'Analyzing color spectrum...' },
    { pct: 85, msg: 'Cross-referencing database...' },
    { pct: 95, msg: 'Generating diagnosis report...' },
    { pct: 100, msg: 'Analysis complete ✓' },
];

let currentScanPart = 'Eyes';
function selectScanPart(btn, part) {
    currentScanPart = part;
    document.querySelectorAll('.scan-part-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const badge = document.getElementById('scan-mode-badge');
    if (badge) badge.textContent = part + ' Mode';

    const statusText = document.getElementById('scan-status-text');
    if (statusText) statusText.textContent = `Align guides with Mochi's ${part.toLowerCase()} & hold still`;
}

function startScan() {
    const btn = document.getElementById('scan-capture-btn');
    btn.disabled = true;
    btn.style.opacity = '0.5';
    let step = 0;
    const statusText = document.getElementById('scan-status-text');
    const progressFill = document.getElementById('scan-progress');
    scanInterval = setInterval(() => {
        if (step < SCAN_STEPS.length) {
            const s = SCAN_STEPS[step];
            progressFill.style.width = s.pct + '%';
            statusText.textContent = s.msg;
            step++;
        } else {
            clearInterval(scanInterval);
        }
    }, 500);
    scanTimeout = setTimeout(() => {
        clearInterval(scanInterval);
        btn.disabled = false;
        btn.style.opacity = '1';
        progressFill.style.width = '0%';
        statusText.textContent = 'Position affected area in frame';

        const scannedPartEl = document.getElementById('result-scanned-part');
        if (scannedPartEl) scannedPartEl.textContent = currentScanPart;

        goToScreen('screen-result');
        animateScore(94);
    }, SCAN_STEPS.length * 500 + 400);
}

function resetScan() {
    clearInterval(scanInterval);
    clearTimeout(scanTimeout);
    document.getElementById('scan-progress').style.width = '0%';
    document.getElementById('scan-status-text').textContent = 'Position affected area in frame';
    const btn = document.getElementById('scan-capture-btn');
    btn.disabled = false; btn.style.opacity = '1';
    goToScreen('screen-scan');
}

function animateScore(target) {
    const el = document.querySelector('.score-num');
    if (!el) return;
    let val = 0;
    const iv = setInterval(() => {
        val = Math.min(val + 3, target);
        el.textContent = val + '%';
        if (val >= target) clearInterval(iv);
    }, 30);
}

/* ─── Chatbot ─── */
function sendChat() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    appendBubble(msg, 'user');

    // Hide quick replies after first message
    const qr = document.getElementById('quick-replies');
    if (qr) qr.style.display = 'none';

    // Typing indicator
    const typingId = appendBubble('...', 'bot', true);

    setTimeout(() => {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        const reply = getBotReply(msg);
        appendBubble(reply, 'bot');
        scrollChat();
    }, 900 + Math.random() * 600);
}

function sendChatImage(inputEl) {
    if (!inputEl.files || !inputEl.files[0]) return;
    const file = inputEl.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        appendBubble(e.target.result, 'user');

        // Hide quick replies after first message
        const qr = document.getElementById('quick-replies');
        if (qr) qr.style.display = 'none';

        // Typing indicator
        const typingId = appendBubble('...', 'bot', true);

        setTimeout(() => {
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();
            appendBubble('📸 ได้รับรูปภาพแล้วครับ จากการประมวลผลเบื้องต้น ดูเหมือนจะมีอาการระคายเคืองที่ผิวหนัง แนะนำให้ใช้ยาทาหรือแชมพูสูตรอ่อนโยน และควรปรึกษาสัตวแพทย์เพื่อความถูกต้องครับ', 'bot');
            scrollChat();
        }, 1500 + Math.random() * 1000);
    };
    reader.readAsDataURL(file);
    inputEl.value = ''; // reset
}

function sendQuickReply(msg) {
    document.getElementById('chat-input').value = msg;
    sendChat();
}

function getBotReply(msg) {
    const lower = msg.toLowerCase();

    if (lower.includes('ทดลองระบบ') || lower.includes('demo')) {
        return `ยินดีต้อนรับสู่โหมดทดลองครับ! 🐶🐱\n\nผมคือ PetCare AI หมอประจำบ้านของคุณ\nลองพิมพ์อาการของน้องๆ มาให้ผมวิเคราะห์ดูสิครับ เช่น:\n- "น้องหมามีผื่นแดงที่ท้อง"\n- "แมวซึม ไม่กินอาหารมา 2 วัน"\n- หรือส่ง "รูปถ่าย" บริเวณที่มีอาการมาได้เลยครับ!`;
    }

    for (const [key, reply] of Object.entries(BOT_RESPONSES)) {
        if (lower.includes(key)) return reply;
    }
    return `🤖 ขอบคุณสำหรับคำถามครับ\n"${msg}"\n\nสำหรับข้อมูลเฉพาะเจาะจงเรื่องนี้ แนะนำให้ปรึกษาสัตวแพทย์โดยตรงครับ หรือกดปุ่ม "Tele-Vet" เพื่อโทรหาสัตวแพทย์ทันที 🏥`;
}

let bubbleIdCounter = 0;
function appendBubble(text, role, isTyping = false) {
    const container = document.getElementById('chat-messages');
    bubbleIdCounter++;
    const id = 'bubble-' + Date.now() + '-' + bubbleIdCounter;
    const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = `chat-bubble ${role}`;
    div.id = id;

    let contentHtml = text;
    if (text.startsWith('data:image')) {
        contentHtml = `<img src="${text}" style="max-width:200px; border-radius:8px; margin-bottom:4px">`;
    } else {
        contentHtml = text.replace(/\n/g, '<br/>');
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
    const c = document.getElementById('chat-messages');
    c.scrollTop = c.scrollHeight;
}

function clearChat() {
    const container = document.getElementById('chat-messages');
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
