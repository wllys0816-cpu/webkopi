// KOPI 8-BIT - Core Application Logic
// Features: Interactive Cup, Cart, Thermal Receipt, Custom Cashier, Menu Management & Price Editing

const DEFAULT_MENU_DATA = [
  {
    id: "kopi-susu-8bit",
    name: "Kopi Susu 8-Bit",
    price: 18000,
    category: "coffee",
    icon: "☕",
    desc: "Signature espresso blend dengan susu kental manis & gula aren retro.",
    caffeine: 75,
    energy: 85,
    sweetness: 70,
    cupColor: "#b27947",
    cupHeight: "75%",
    hasFoam: true,
    isIced: true
  },
  {
    id: "pixel-espresso",
    name: "Pixel Espresso (Single)",
    price: 15000,
    category: "coffee",
    icon: "⚡",
    desc: "Ekstrak kopi pekat 9-bar murni. +100 Mana & fokus seketika saat grinding!",
    caffeine: 98,
    energy: 95,
    sweetness: 10,
    cupColor: "#2b1408",
    cupHeight: "40%",
    hasFoam: true,
    isIced: false
  },
  {
    id: "boss-cold-brew",
    name: "Boss Fight Cold Brew",
    price: 22000,
    category: "coffee",
    icon: "🧊",
    desc: "Kopi seduh dingin 18 jam dengan roasted nutty notes. Dingin & menyegarkan.",
    caffeine: 90,
    energy: 88,
    sweetness: 25,
    cupColor: "#3e1e0b",
    cupHeight: "85%",
    hasFoam: false,
    isIced: true
  },
  {
    id: "cappuccino-nes",
    name: "NES Cappuccino Cream",
    price: 20000,
    category: "coffee",
    icon: "🎮",
    desc: "Kombinasi espresso, steamed milk, dan busa tebal bertabur bubuk cokelat.",
    caffeine: 70,
    energy: 75,
    sweetness: 45,
    cupColor: "#9c6d3f",
    cupHeight: "80%",
    hasFoam: true,
    isIced: false
  },
  {
    id: "matcha-glitch",
    name: "Matcha Glitch Latte",
    price: 22000,
    category: "non-coffee",
    icon: "🍵",
    desc: "Pure Uji Matcha Jepang dengan fresh milk lembut creamy non-kopi.",
    caffeine: 30,
    energy: 65,
    sweetness: 60,
    cupColor: "#588147",
    cupHeight: "75%",
    hasFoam: true,
    isIced: true
  },
  {
    id: "arcade-choco-power",
    name: "Arcade Dark Choco",
    price: 20000,
    category: "non-coffee",
    icon: "🍫",
    desc: "Cokelat Belgia pekat dengan taburan marshallow 8-bit lembut.",
    caffeine: 15,
    energy: 80,
    sweetness: 80,
    cupColor: "#422319",
    cupHeight: "78%",
    hasFoam: true,
    isIced: true
  },
  {
    id: "power-donut",
    name: "Power-Up Pixel Donut",
    price: 12000,
    category: "snack",
    icon: "🍩",
    desc: "Donat empuk berlapis glaze stroberi dan sprinkle gula warna-warni.",
    caffeine: 0,
    energy: 90,
    sweetness: 95,
    cupColor: "#d94b81",
    cupHeight: "50%",
    hasFoam: false,
    isIced: false
  },
  {
    id: "crt-toast",
    name: "CRT Roti Bakar Coklat Keju",
    price: 16000,
    category: "snack",
    icon: "🍞",
    desc: "Roti bakar tebal panggang krispi dengan limpahan keju cheddar & cokelat.",
    caffeine: 0,
    energy: 95,
    sweetness: 85,
    cupColor: "#ba7e3e",
    cupHeight: "50%",
    hasFoam: false,
    isIced: false
  }
];

// Load Menu Data with LocalStorage Persistence
function loadMenuData() {
  try {
    const saved = localStorage.getItem("kopi8bit_menu_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Gagal memuat menu dari localStorage:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_MENU_DATA));
}

function saveMenuData() {
  try {
    localStorage.setItem("kopi8bit_menu_v2", JSON.stringify(MENU_DATA));
  } catch (e) {
    console.error("Gagal menyimpan menu ke localStorage:", e);
  }
}

// App State
let MENU_DATA = loadMenuData();
let cart = [];
let currentCategory = "all";
let appliedVoucher = null;
let currentPreviewItem = MENU_DATA[0] || DEFAULT_MENU_DATA[0];
let previewTemperature = "ice"; // 'ice' or 'hot'
let previewSugar = "Normal";
let isEditMode = false;
let currentCashier = localStorage.getItem("kopi8bit_cashier") || "Barista Bot";

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initStartScreen();
  updateCashierUI();
  renderMenu();
  updateCupPreview(currentPreviewItem);
  initAudioControls();
  initKonamiCode();
  checkStoreStatus();
  initDeliveryTracker();
});

/* ============================================================
   CASHIER NAME FEATURE (Bebas Kasih Nama Kasir)
   ============================================================ */
function updateCashierUI() {
  const hudCashier = document.getElementById("hud-cashier-name");
  const checkoutCashier = document.getElementById("order-cashier");
  if (hudCashier) hudCashier.textContent = currentCashier;
  if (checkoutCashier) checkoutCashier.value = currentCashier;
}

function openCashierModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const input = document.getElementById("input-cashier-name");
  if (input) input.value = currentCashier;
  const modal = document.getElementById("cashier-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeCashierModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("cashier-modal");
  if (modal) modal.classList.add("hidden");
}

function saveCashierName(event) {
  event.preventDefault();
  const input = document.getElementById("input-cashier-name");
  if (input && input.value.trim()) {
    currentCashier = input.value.trim();
    localStorage.setItem("kopi8bit_cashier", currentCashier);
    updateCashierUI();
    if (window.soundSystem) window.soundSystem.playPowerupSound();
    showQuickToast(`Nama Kasir diubah menjadi: "${currentCashier}"!`);
    closeCashierModal();
  }
}

/* ============================================================
   START SCREEN LOGIC
   ============================================================ */
function initStartScreen() {
  const startScreen = document.getElementById("start-screen");
  const startBtn = document.getElementById("start-app-btn");

  if (startBtn && startScreen) {
    const handleStart = () => {
      if (window.soundSystem) {
        window.soundSystem.playStartSound();
        window.soundSystem.startBGM();
      }
      startScreen.classList.add("hidden");
      updateAudioHUD();
    };

    startBtn.addEventListener("click", handleStart);

    // Keyboard support: Enter or Space on start screen
    window.addEventListener("keydown", (e) => {
      if (!startScreen.classList.contains("hidden")) {
        if (e.key === "Enter" || e.key === " " || e.key === "c" || e.key === "C") {
          handleStart();
        }
      }
    });
  }
}

function showStartScreen() {
  const startScreen = document.getElementById("start-screen");
  if (startScreen) {
    if (window.soundSystem) window.soundSystem.playBlipSound();
    startScreen.classList.remove("hidden");
  }
}

/* ============================================================
   MENU MANAGEMENT (Tambah Menu, Ubah Harga, Reset)
   ============================================================ */
function toggleEditMode() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  isEditMode = !isEditMode;
  const btn = document.getElementById("btn-toggle-edit-mode");
  if (btn) {
    btn.classList.toggle("pixel-btn-gold", isEditMode);
    btn.textContent = isEditMode ? "✅ MODE BIASA" : "✏️ MODE UBAH HARGA";
  }
  showQuickToast(isEditMode ? "Mode Ubah Harga Aktif! Klik [✏️ UBAH] pada menu." : "Kembali ke mode belanja biasa.");
  renderMenu();
}

function openAddMenuModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("add-menu-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeAddMenuModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("add-menu-modal");
  if (modal) modal.classList.add("hidden");
}

function setNewMenuColor(color) {
  const input = document.getElementById("new-menu-color");
  if (input) input.value = color;
  if (window.soundSystem) window.soundSystem.playBlipSound();
}

function handleAddNewMenu(event) {
  event.preventDefault();
  const name = document.getElementById("new-menu-name").value.trim();
  const price = parseInt(document.getElementById("new-menu-price").value) || 15000;
  const category = document.getElementById("new-menu-category").value;
  const icon = document.getElementById("new-menu-icon").value;
  const cupColor = document.getElementById("new-menu-color").value;
  const desc = document.getElementById("new-menu-desc").value.trim();
  const caffeine = Math.max(0, Math.min(100, parseInt(document.getElementById("new-menu-caffeine").value) || 50));
  const energy = Math.max(0, Math.min(100, parseInt(document.getElementById("new-menu-energy").value) || 75));
  const sweetness = Math.max(0, Math.min(100, parseInt(document.getElementById("new-menu-sweetness").value) || 50));

  const newItem = {
    id: "custom-" + Date.now(),
    name,
    price,
    category,
    icon,
    desc,
    caffeine,
    energy,
    sweetness,
    cupColor,
    cupHeight: "75%",
    hasFoam: true,
    isIced: category !== "snack"
  };

  MENU_DATA.unshift(newItem);
  saveMenuData();
  renderMenu();
  selectMenuItemForPreview(newItem.id);

  if (window.soundSystem) window.soundSystem.playPowerupSound();
  showQuickToast(`Menu baru "${name}" (Rp${price.toLocaleString("id-ID")}) berhasil ditambahkan!`);
  closeAddMenuModal();
  event.target.reset();
}

let currentEditingItemId = null;

function openEditMenuModal(itemId) {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  currentEditingItemId = itemId;
  document.getElementById("edit-menu-id").value = item.id;
  document.getElementById("edit-menu-name").value = item.name;
  document.getElementById("edit-menu-price").value = item.price;
  document.getElementById("edit-menu-desc").value = item.desc;

  const modal = document.getElementById("edit-menu-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeEditMenuModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("edit-menu-modal");
  if (modal) modal.classList.add("hidden");
  currentEditingItemId = null;
}

function handleSaveEditedMenu(event) {
  event.preventDefault();
  const id = document.getElementById("edit-menu-id").value;
  const name = document.getElementById("edit-menu-name").value.trim();
  const price = parseInt(document.getElementById("edit-menu-price").value) || 15000;
  const desc = document.getElementById("edit-menu-desc").value.trim();

  const item = MENU_DATA.find(i => i.id === id);
  if (item) {
    item.name = name;
    item.price = price;
    item.desc = desc;

    // Update inside cart if present
    const cartItem = cart.find(ci => ci.id === id);
    if (cartItem) {
      cartItem.name = name;
      cartItem.price = price;
    }

    saveMenuData();
    renderMenu();
    updateCartUI();

    if (currentPreviewItem && currentPreviewItem.id === id) {
      updateCupPreview(item);
    }

    if (window.soundSystem) window.soundSystem.playPowerupSound();
    showQuickToast(`Harga & info "${name}" berhasil diubah menjadi Rp${price.toLocaleString("id-ID")}!`);
    closeEditMenuModal();
  }
}

function handleDeleteMenuItem() {
  if (!currentEditingItemId) return;
  const item = MENU_DATA.find(i => i.id === currentEditingItemId);
  if (!item) return;

  if (confirm(`Yakin ingin menghapus menu "${item.name}" dari daftar?`)) {
    MENU_DATA = MENU_DATA.filter(i => i.id !== currentEditingItemId);
    cart = cart.filter(ci => ci.id !== currentEditingItemId);
    saveMenuData();
    renderMenu();
    updateCartUI();

    if (MENU_DATA.length > 0) {
      selectMenuItemForPreview(MENU_DATA[0].id);
    }
    if (window.soundSystem) window.soundSystem.playBlipSound();
    showQuickToast(`Menu "${item.name}" telah dihapus.`);
    closeEditMenuModal();
  }
}

function resetMenuToDefault() {
  if (confirm("Kembalikan seluruh daftar menu dan harga ke kondisi awal (default)?")) {
    MENU_DATA = JSON.parse(JSON.stringify(DEFAULT_MENU_DATA));
    saveMenuData();
    renderMenu();
    selectMenuItemForPreview(MENU_DATA[0].id);
    if (window.soundSystem) window.soundSystem.playPowerupSound();
    showQuickToast("Daftar menu berhasil direset ke default!");
  }
}

/* ============================================================
   MENU & CUP PREVIEW LOGIC ("Lihat cangkirnya berubah")
   ============================================================ */
function renderMenu() {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;

  const filtered = currentCategory === "all" 
    ? MENU_DATA 
    : MENU_DATA.filter(item => item.category === currentCategory);

  grid.innerHTML = filtered.map(item => `
    <div class="menu-item-card pixel-box" onclick="selectMenuItemForPreview('${item.id}')">
      <div class="card-top">
        <div class="item-pixel-art">${item.icon}</div>
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-desc">${item.desc}</div>
          <div class="item-tags">
            <span class="pixel-badge">${item.category.toUpperCase()}</span>
            ${item.caffeine > 0 ? `<span class="pixel-badge">⚡ ${item.caffeine}mg</span>` : ''}
          </div>
        </div>
      </div>
      <div class="card-bottom">
        <div class="item-price">Rp${item.price.toLocaleString("id-ID")}</div>
        <div style="display: flex; gap: 6px;">
          <button class="pixel-btn btn-edit-price" onclick="event.stopPropagation(); openEditMenuModal('${item.id}')" title="Ubah Harga & Menu">
            ✏️ UBAH
          </button>
          <button class="pixel-btn pixel-btn-green btn-order-add" onclick="event.stopPropagation(); addToCart('${item.id}')">
            + TAMBAH
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function filterMenu(category, btnElement) {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  currentCategory = category;
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  renderMenu();
}

function selectMenuItemForPreview(itemId) {
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  if (window.soundSystem) window.soundSystem.playBlipSound();
  currentPreviewItem = item;
  previewTemperature = item.isIced ? "ice" : "hot";
  updateCupPreview(item);

  // Scroll smoothly to cup preview on mobile
  if (window.innerWidth < 768) {
    const cupElem = document.getElementById("interactive-cup-box");
    if (cupElem) cupElem.scrollIntoView({ behavior: 'smooth' });
  }
}

function updateCupPreview(item) {
  const liquid = document.getElementById("cup-liquid");
  const foam = document.getElementById("cup-foam");
  const ice = document.getElementById("cup-ice-cubes");
  const steam = document.getElementById("cup-steam");
  const cupName = document.getElementById("cup-preview-title");
  
  const fillCaff = document.getElementById("stat-fill-caffeine");
  const fillEnergy = document.getElementById("stat-fill-energy");
  const fillSweet = document.getElementById("stat-fill-sweet");

  const valCaff = document.getElementById("stat-val-caffeine");
  const valEnergy = document.getElementById("stat-val-energy");
  const valSweet = document.getElementById("stat-val-sweet");

  if (cupName) cupName.textContent = `${item.icon || '☕'} ${item.name}`;

  if (liquid) {
    liquid.style.background = item.cupColor || "#b27947";
    liquid.style.height = item.cupHeight || "75%";
  }

  if (foam) {
    foam.style.opacity = item.hasFoam ? "0.9" : "0";
  }

  if (ice) {
    if (previewTemperature === "ice") {
      ice.classList.add("visible");
    } else {
      ice.classList.remove("visible");
    }
  }

  if (steam) {
    if (previewTemperature === "hot") {
      steam.classList.remove("hidden");
    } else {
      steam.classList.add("hidden");
    }
  }

  // RPG Stat bars
  if (fillCaff) fillCaff.style.width = item.caffeine + "%";
  if (fillEnergy) fillEnergy.style.width = item.energy + "%";
  if (fillSweet) fillSweet.style.width = item.sweetness + "%";

  if (valCaff) valCaff.textContent = item.caffeine + "%";
  if (valEnergy) valEnergy.textContent = item.energy + "%";
  if (valSweet) valSweet.textContent = item.sweetness + "%";

  // Update temp switch buttons styling
  const btnHot = document.getElementById("btn-temp-hot");
  const btnIce = document.getElementById("btn-temp-ice");
  if (btnHot && btnIce) {
    if (previewTemperature === "hot") {
      btnHot.classList.add("pixel-btn-cyan");
      btnIce.classList.remove("pixel-btn-cyan");
    } else {
      btnIce.classList.add("pixel-btn-cyan");
      btnHot.classList.remove("pixel-btn-cyan");
    }
  }
}

function setPreviewTemp(temp) {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  previewTemperature = temp;
  updateCupPreview(currentPreviewItem);
}

/* ============================================================
   SHOPPING CART LOGIC
   ============================================================ */
function addToCart(itemId) {
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  const existing = cart.find(ci => ci.id === itemId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      ...item,
      qty: 1
    });
  }

  if (window.soundSystem) window.soundSystem.playCoinSound();
  updateCartUI();
  showQuickToast(`+1 ${item.name} Masuk Keranjang!`);
}

function changeQty(itemId, delta) {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const existing = cart.find(ci => ci.id === itemId);
  if (!existing) return;

  existing.qty += delta;
  if (existing.qty <= 0) {
    cart = cart.filter(ci => ci.id !== itemId);
  }
  updateCartUI();
}

// Recognized Promo Codes & Custom Coupons Store
const DEFAULT_PROMO_CODES = {
  "KOPI8BIT": { code: "KOPI8BIT", discount: 15, label: "Diskon 15% Welcome", isDefault: true },
  "GAMER20": { code: "GAMER20", discount: 20, label: "Diskon 20% Gamer Night", isDefault: true },
  "JUMAT30": { code: "JUMAT30", discount: 30, label: "Diskon 30% Spesial", isDefault: true },
  "FLASH50": { code: "FLASH50", discount: 50, label: "Diskon 50% Flash Sale", isDefault: true },
  "HEMAT10": { code: "HEMAT10", discount: 10, label: "Diskon 10% Hemat", isDefault: true },
  "POTONGAN5K": { code: "POTONGAN5K", type: "nominal", amount: 5000, label: "Potongan Rp5.000", isDefault: true },
  "PIXEL10": { code: "PIXEL10", discount: 10, label: "Diskon 10% Arcade", isDefault: true },
  "BOSSBEANS20": { code: "BOSSBEANS20", discount: 20, label: "Diskon 20% Boss Bean", isDefault: true },
  "KONAMI30": { code: "KONAMI30", discount: 30, label: "Cheat Diskon 30%", isDefault: true }
};

function loadCustomCoupons() {
  try {
    const saved = localStorage.getItem("kopi8bit_custom_coupons_v1");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Gagal memuat kupon kustom:", e);
  }
  return {};
}

function saveCustomCoupons(customMap) {
  try {
    localStorage.setItem("kopi8bit_custom_coupons_v1", JSON.stringify(customMap));
  } catch (e) {
    console.error("Gagal menyimpan kupon kustom:", e);
  }
}

let customCoupons = loadCustomCoupons();

function getAllCoupons() {
  return { ...DEFAULT_PROMO_CODES, ...customCoupons };
}

function calculateCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discountAmount = 0;

  if (appliedVoucher) {
    if (appliedVoucher.type === 'nominal') {
      discountAmount = Math.min(subtotal, appliedVoucher.amount || 0);
    } else {
      discountAmount = Math.round((subtotal * (appliedVoucher.discount || 0)) / 100);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount);
  return { subtotal, discountAmount, grandTotal };
}

function applyCustomCoupon() {
  const input = document.getElementById("cart-coupon-input");
  if (!input) return;
  const rawCode = input.value.trim().toUpperCase();

  if (!rawCode) {
    alert("Silakan ketik kode kupon diskon terlebih dahulu!");
    return;
  }

  const allCoupons = getAllCoupons();

  if (allCoupons[rawCode]) {
    const promo = allCoupons[rawCode];
    appliedVoucher = { ...promo };
    if (window.soundSystem) window.soundSystem.playPowerupSound();
    showQuickToast(`Kupon ${promo.code} berhasil dipasang! (${promo.label})`);
    input.value = "";
    updateCartUI();
  } else {
    // Check if it's in format DISKONxx (e.g. DISKON15)
    const match = rawCode.match(/^DISKON(\d+)$/);
    if (match) {
      const pct = Math.min(90, parseInt(match[1]));
      appliedVoucher = { code: rawCode, discount: pct, label: `Diskon ${pct}%` };
      if (window.soundSystem) window.soundSystem.playPowerupSound();
      showQuickToast(`Kupon ${rawCode} berhasil dipasang! Diskon ${pct}%`);
      input.value = "";
      updateCartUI();
    } else {
      if (window.soundSystem) window.soundSystem.playGameOverSound();
      alert(`Kode kupon "${rawCode}" tidak ditemukan! Silakan cek menu [🎟️ Kupon Diskon] di navbar.`);
    }
  }
}

function applyQuickDiscount(code, percent, label) {
  appliedVoucher = { code, discount: percent, label };
  if (window.soundSystem) window.soundSystem.playPowerupSound();
  showQuickToast(`${label} berhasil dipasang!`);
  updateCartUI();
}

function applyNominalDiscount(code, amount, label) {
  appliedVoucher = { code, type: "nominal", amount, label };
  if (window.soundSystem) window.soundSystem.playPowerupSound();
  showQuickToast(`${label} berhasil dipasang!`);
  updateCartUI();
  closePromoListModal();
}

function applyPromoDirectly(code, discount, label) {
  appliedVoucher = { code, discount, label };
  if (window.soundSystem) window.soundSystem.playPowerupSound();
  showQuickToast(`${label} berhasil dipasang!`);
  closePromoListModal();
  updateCartUI();
  openCartModal();
}

function removeCoupon() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  appliedVoucher = null;
  updateCartUI();
  showQuickToast("Kupon diskon dihapus.");
}

function openCustomDiscountModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("custom-discount-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeCustomDiscountModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("custom-discount-modal");
  if (modal) modal.classList.add("hidden");
}

function updateManualDiscountPlaceholder() {
  const type = document.getElementById("manual-discount-type").value;
  const valInput = document.getElementById("manual-discount-value");
  if (valInput) {
    if (type === 'percent') {
      valInput.placeholder = "Contoh: 15 (untuk 15%)";
      valInput.max = 100;
    } else {
      valInput.placeholder = "Contoh: 10000 (untuk Rp10.000)";
      valInput.removeAttribute("max");
    }
  }
}

function handleApplyManualDiscount(event) {
  event.preventDefault();
  const type = document.getElementById("manual-discount-type").value;
  const value = parseInt(document.getElementById("manual-discount-value").value) || 0;
  const label = document.getElementById("manual-discount-label").value.trim() || "Diskon Toko";

  if (value <= 0) {
    alert("Nilai diskon harus lebih besar dari 0!");
    return;
  }

  if (type === 'percent') {
    appliedVoucher = { code: "CUSTOM", discount: Math.min(100, value), label: `${label} (${value}%)` };
  } else {
    appliedVoucher = { code: "CUSTOM", type: "nominal", amount: value, label: `${label} (-Rp${value.toLocaleString("id-ID")})` };
  }

  if (window.soundSystem) window.soundSystem.playPowerupSound();
  showQuickToast(`Diskon "${label}" berhasil dipasang!`);
  closeCustomDiscountModal();
  updateCartUI();
}

// Custom Coupon Management (Buat Kupon Kustom)
function openCreateCouponModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("create-custom-coupon-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeCreateCouponModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("create-custom-coupon-modal");
  if (modal) modal.classList.add("hidden");
}

function updateNewCouponPlaceholder() {
  const type = document.getElementById("new-coupon-type").value;
  const valInput = document.getElementById("new-coupon-value");
  if (valInput) {
    if (type === 'percent') {
      valInput.placeholder = "Contoh: 25 (untuk 25%)";
      valInput.max = 100;
    } else {
      valInput.placeholder = "Contoh: 10000 (untuk Rp10.000)";
      valInput.removeAttribute("max");
    }
  }
}

function handleCreateCustomCoupon(event) {
  event.preventDefault();
  const code = document.getElementById("new-coupon-code").value.trim().toUpperCase();
  const type = document.getElementById("new-coupon-type").value;
  const value = parseInt(document.getElementById("new-coupon-value").value) || 0;
  const label = document.getElementById("new-coupon-label").value.trim() || `Diskon ${code}`;

  if (!code) {
    alert("Kode kupon tidak boleh kosong!");
    return;
  }

  if (value <= 0) {
    alert("Nilai diskon harus lebih besar dari 0!");
    return;
  }

  const newCoupon = {
    code,
    type,
    label,
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  if (type === 'percent') {
    newCoupon.discount = Math.min(100, value);
  } else {
    newCoupon.amount = value;
  }

  customCoupons[code] = newCoupon;
  saveCustomCoupons(customCoupons);

  if (window.soundSystem) window.soundSystem.playPowerupSound();
  showQuickToast(`Kupon kustom "${code}" berhasil dibuat & aktif!`);
  
  event.target.reset();
  closeCreateCouponModal();
  renderPromoListModal();
  openPromoListModal();
}

function deleteCustomCoupon(code) {
  if (confirm(`Yakin ingin menghapus kupon kustom "${code}"?`)) {
    delete customCoupons[code];
    saveCustomCoupons(customCoupons);
    if (appliedVoucher && appliedVoucher.code === code) {
      appliedVoucher = null;
      updateCartUI();
    }
    if (window.soundSystem) window.soundSystem.playBlipSound();
    showQuickToast(`Kupon "${code}" berhasil dihapus.`);
    renderPromoListModal();
  }
}

function resetCustomCoupons() {
  if (confirm("Reset dan hapus seluruh kupon kustom yang pernah Anda buat?")) {
    customCoupons = {};
    saveCustomCoupons(customCoupons);
    if (window.soundSystem) window.soundSystem.playBlipSound();
    showQuickToast("Seluruh kupon kustom telah direset.");
    renderPromoListModal();
  }
}

function renderPromoListModal() {
  const container = document.getElementById("promo-list-container");
  if (!container) return;

  const all = getAllCoupons();
  const keys = Object.keys(all);

  if (keys.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--pixel-gray); padding: 20px;">Belum ada kupon promo aktif.</p>`;
    return;
  }

  container.innerHTML = keys.map(k => {
    const p = all[k];
    const isNominal = p.type === 'nominal';
    const valueText = isNominal 
      ? `-Rp${(p.amount || 0).toLocaleString("id-ID")}` 
      : `${p.discount || 0}% OFF`;

    return `
      <div class="voucher-card" style="text-align: left; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span style="font-size: 11px; color: ${p.isCustom ? 'var(--pixel-gold)' : 'var(--pixel-green)'}; font-weight: bold;">
              ${p.code}
            </span>
            <span class="pixel-badge" style="font-size: 7px; padding: 2px 4px; ${p.isCustom ? 'background: #391c4d; color: var(--pixel-gold);' : ''}">
              ${p.isCustom ? 'KUSTOM TOKO' : 'OFFICIAL'}
            </span>
            <span style="font-size: 9px; color: var(--pixel-cyan); font-weight: bold;">[${valueText}]</span>
          </div>
          <div style="font-size: 8px; color: #fff; margin-top: 4px;">${p.label}</div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="pixel-btn pixel-btn-green" style="padding: 6px 10px; font-size: 8px;" onclick="${isNominal ? `applyNominalDiscount('${p.code}', ${p.amount}, '${p.label}')` : `applyPromoDirectly('${p.code}', ${p.discount}, '${p.label}')`}">
            PASANG
          </button>
          ${p.isCustom ? `
            <button class="pixel-btn pixel-btn-red" style="padding: 6px 8px; font-size: 8px;" onclick="deleteCustomCoupon('${p.code}')" title="Hapus Kupon">
              🗑️
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join("");
}

function openPromoListModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  renderPromoListModal();
  const modal = document.getElementById("promo-list-modal");
  if (modal) modal.classList.remove("hidden");
}

function closePromoListModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("promo-list-modal");
  if (modal) modal.classList.add("hidden");
}

function updateCartUI() {
  const countPills = document.querySelectorAll(".cart-count-badge");
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  countPills.forEach(pill => {
    pill.textContent = totalItems;
  });

  const listEl = document.getElementById("cart-items-container");
  const subtotalEl = document.getElementById("cart-subtotal-val");
  const discountEl = document.getElementById("cart-discount-val");
  const totalEl = document.getElementById("cart-total-val");

  if (!listEl) return;

  if (cart.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; color: var(--pixel-gray); padding: 25px 0;">
        <p style="font-size: 24px; margin-bottom: 8px;">🛒</p>
        <p>Keranjang masih kosong!</p>
        <p style="font-size: 8px; margin-top: 6px;">Pilih kopi lezat di menu & isi tokomu.</p>
      </div>
    `;
  } else {
    listEl.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <div>
          <div class="cart-item-title">${item.icon} ${item.name}</div>
          <div class="cart-item-price">Rp${(item.price * item.qty).toLocaleString("id-ID")}</div>
        </div>
        <div class="cart-qty-ctrl">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `).join("");
  }

  // Active Coupon Badge
  const couponBadge = document.getElementById("coupon-active-badge");
  const couponText = document.getElementById("coupon-active-text");
  if (couponBadge && couponText) {
    if (appliedVoucher) {
      couponBadge.classList.remove("hidden");
      couponText.textContent = `🎟️ ${appliedVoucher.label || appliedVoucher.code} AKTIF`;
    } else {
      couponBadge.classList.add("hidden");
    }
  }

  const { subtotal, discountAmount, grandTotal } = calculateCartTotals();

  if (subtotalEl) subtotalEl.textContent = `Rp${subtotal.toLocaleString("id-ID")}`;
  if (discountEl) {
    const label = appliedVoucher ? ` (-${appliedVoucher.label || appliedVoucher.code})` : '';
    discountEl.textContent = `-Rp${discountAmount.toLocaleString("id-ID")}${label}`;
  }
  if (totalEl) totalEl.textContent = `Rp${grandTotal.toLocaleString("id-ID")}`;
}

function openCartModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  updateCartUI();
  const modal = document.getElementById("cart-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeCartModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("cart-modal");
  if (modal) modal.classList.add("hidden");
}

/* ============================================================
   CHECKOUT & CETAK STRUK (THERMAL RECEIPT)
   ============================================================ */
function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong! Silakan pilih kopi favoritmu dulu.");
    return;
  }
  closeCartModal();
  if (window.soundSystem) window.soundSystem.playBlipSound();

  const modal = document.getElementById("checkout-modal");
  const checkoutTotal = document.getElementById("checkout-total-val");
  const checkoutCashier = document.getElementById("order-cashier");
  const { grandTotal } = calculateCartTotals();

  if (checkoutTotal) {
    checkoutTotal.textContent = `Rp${grandTotal.toLocaleString("id-ID")}`;
  }
  if (checkoutCashier) {
    checkoutCashier.value = currentCashier;
  }

  if (modal) modal.classList.remove("hidden");
}

function closeCheckoutModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("checkout-modal");
  if (modal) modal.classList.add("hidden");
}

let lastGeneratedOrder = null;

function processOrder(e) {
  e.preventDefault();

  const name = document.getElementById("order-name").value.trim() || "Retro Gamer";
  const cashierInput = document.getElementById("order-cashier").value.trim();
  if (cashierInput) {
    currentCashier = cashierInput;
    localStorage.setItem("kopi8bit_cashier", currentCashier);
    updateCashierUI();
  }

  const phone = document.getElementById("order-phone").value.trim() || "08123456789";
  const orderType = document.getElementById("order-type").value;
  const address = document.getElementById("order-address").value.trim() || "Dine In / Meja #01";
  const payment = document.getElementById("order-payment").value;

  const orderId = "8BIT-" + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const { subtotal, discountAmount, grandTotal } = calculateCartTotals();

  lastGeneratedOrder = {
    orderId,
    cashier: currentCashier,
    name,
    phone,
    orderType,
    address,
    payment,
    dateStr,
    timeStr,
    items: [...cart],
    appliedVoucher: appliedVoucher ? { ...appliedVoucher } : null,
    subtotal,
    discountAmount,
    grandTotal
  };

  closeCheckoutModal();

  // Play dot-matrix thermal print buzzer sound!
  if (window.soundSystem) {
    window.soundSystem.playPrintSound();
    setTimeout(() => {
      window.soundSystem.playPowerupSound();
    }, 600);
  }

  // Render & Show Thermal Receipt
  renderReceipt(lastGeneratedOrder);
  const receiptModal = document.getElementById("receipt-modal");
  if (receiptModal) receiptModal.classList.remove("hidden");

  // Advance delivery tracker
  advanceDeliveryRadar();

  // Reset cart and voucher after order placed
  cart = [];
  appliedVoucher = null;
  updateCartUI();
}

function renderReceipt(order) {
  const container = document.getElementById("receipt-content-area");
  if (!container) return;

  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.qty}x ${item.name}</td>
      <td style="text-align: right;">Rp${(item.price * item.qty).toLocaleString("id-ID")}</td>
    </tr>
  `).join("");

  const discountLabel = order.appliedVoucher 
    ? (order.appliedVoucher.label || order.appliedVoucher.code) 
    : 'PROMO';

  container.innerHTML = `
    <div class="receipt-wrapper">
      <div class="receipt-header">
        <div class="receipt-store-title">★ KOPI 8-BIT ★</div>
        <div class="receipt-info-line">CYBER COFFEE LAB & ARCADE</div>
        <div class="receipt-info-line">Jl. Pixel No. 128, BitCity</div>
        <div class="receipt-info-line">WiFi: kopi8bitmantap</div>
      </div>

      <div class="receipt-meta-grid">
        <div class="receipt-meta-row">
          <span>NO: #${order.orderId}</span>
          <span>${order.dateStr}</span>
        </div>
        <div class="receipt-meta-row">
          <span>WAKTU: ${order.timeStr}</span>
          <span>KASIR: ${order.cashier}</span>
        </div>
        <div class="receipt-meta-row">
          <span>CUST: ${order.name}</span>
          <span>${order.orderType}</span>
        </div>
        <div class="receipt-meta-row">
          <span>LOKASI: ${order.address}</span>
        </div>
      </div>

      <table class="receipt-table">
        <thead>
          <tr>
            <th>ITEM</th>
            <th style="text-align: right;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="receipt-totals">
        <div class="receipt-total-row">
          <span>SUBTOTAL:</span>
          <span>Rp${order.subtotal.toLocaleString("id-ID")}</span>
        </div>
        ${order.discountAmount > 0 ? `
          <div class="receipt-total-row" style="color: #c00;">
            <span>DISKON (${discountLabel}):</span>
            <span>-Rp${order.discountAmount.toLocaleString("id-ID")}</span>
          </div>
        ` : ''}
        <div class="receipt-total-row receipt-grand-total">
          <span>TOTAL:</span>
          <span>Rp${order.grandTotal.toLocaleString("id-ID")}</span>
        </div>
        <div class="receipt-total-row" style="margin-top: 6px; font-size: 13px;">
          <span>METODE BAYAR:</span>
          <span>${order.payment.toUpperCase()} (LUNAS)</span>
        </div>
      </div>

      <div class="receipt-barcode-box">
        <!-- Pixel QR Code SVG -->
        <svg class="receipt-pixel-qr" viewBox="0 0 25 25" fill="#111">
          <rect x="1" y="1" width="7" height="7" fill="none" stroke="#111" stroke-width="1"/>
          <rect x="3" y="3" width="3" height="3"/>
          <rect x="17" y="1" width="7" height="7" fill="none" stroke="#111" stroke-width="1"/>
          <rect x="19" y="3" width="3" height="3"/>
          <rect x="1" y="17" width="7" height="7" fill="none" stroke="#111" stroke-width="1"/>
          <rect x="3" y="19" width="3" height="3"/>
          <rect x="10" y="2" width="2" height="4"/>
          <rect x="13" y="4" width="2" height="2"/>
          <rect x="10" y="8" width="5" height="2"/>
          <rect x="2" y="10" width="4" height="2"/>
          <rect x="7" y="12" width="3" height="2"/>
          <rect x="11" y="12" width="4" height="3"/>
          <rect x="18" y="10" width="3" height="3"/>
          <rect x="17" y="14" width="4" height="2"/>
          <rect x="10" y="17" width="3" height="5"/>
          <rect x="15" y="18" width="5" height="2"/>
          <rect x="14" y="21" width="3" height="3"/>
        </svg>
        <div class="receipt-barcode-lines"></div>
        <div style="font-size: 11px; letter-spacing: 2px;">*${order.orderId}*</div>
      </div>

      <div class="receipt-footer-msg">
        <div>TERIMA KASIH! KOPI KAMU SEDANG DISEDUS.</div>
        <div>ESTIMASI ANTAR: 20 MENIT!</div>
        <div style="margin-top: 6px; font-weight: bold;">[ PRESS START TO DRINK ]</div>
      </div>
    </div>
  `;
}

function printReceipt() {
  if (window.soundSystem) window.soundSystem.playPrintSound();
  window.print();
}

function sendReceiptWhatsApp() {
  if (!lastGeneratedOrder) return;
  const discountText = o.discountAmount > 0 
    ? `Diskon (${o.appliedVoucher ? (o.appliedVoucher.label || o.appliedVoucher.code) : 'Kupon'}): -Rp${o.discountAmount.toLocaleString("id-ID")}%0A`
    : '';

  const text = `*★ STRUK PESANAN KOPI 8-BIT ★*%0A%0A` +
    `No Pesanan: %23${o.orderId}%0A` +
    `Kasir: ${encodeURIComponent(o.cashier)}%0A` +
    `Nama: ${encodeURIComponent(o.name)}%0A` +
    `Jenis: ${encodeURIComponent(o.orderType)}%0A` +
    `Alamat/Meja: ${encodeURIComponent(o.address)}%0A%0A` +
    `*Daftar Pesanan:*%0A${itemsText}%0A%0A` +
    `Subtotal: Rp${o.subtotal.toLocaleString("id-ID")}%0A` +
    discountText +
    `*Total Bayar: Rp${o.grandTotal.toLocaleString("id-ID")}* (${o.payment})%0A` +
    `Status: Sedang Disiapkan Barista ☕`;

  window.open(`https://wa.me/?text=${text}`, "_blank");
}

function downloadReceiptText() {
  if (!lastGeneratedOrder) return;
  const o = lastGeneratedOrder;
  const discountLabel = o.appliedVoucher ? (o.appliedVoucher.label || o.appliedVoucher.code) : 'Kupon';
  const lines = [
    "=====================================",
    "           KOPI 8-BIT RETRO          ",
    "        CYBER COFFEE LAB & CAFE      ",
    "=====================================",
    `No Pesanan : #${o.orderId}`,
    `Kasir      : ${o.cashier}`,
    `Tanggal    : ${o.dateStr} ${o.timeStr}`,
    `Pelanggan  : ${o.name}`,
    `Tipe Order : ${o.orderType}`,
    `Alamat     : ${o.address}`,
    "-------------------------------------",
    ...o.items.map(i => `${i.qty}x ${i.name.padEnd(22)} Rp${(i.price * i.qty).toLocaleString("id-ID")}`),
    "-------------------------------------",
    `Subtotal   : Rp${o.subtotal.toLocaleString("id-ID")}`,
    o.discountAmount > 0 ? `Diskon (${discountLabel}) : -Rp${o.discountAmount.toLocaleString("id-ID")}` : "",
    `GRAND TOTAL: Rp${o.grandTotal.toLocaleString("id-ID")}`,
    `Pembayaran : ${o.payment.toUpperCase()} (LUNAS)`,
    "=====================================",
    "  TERIMA KASIH TELAH MEMESAN KOPI!   ",
    "  KOPI SAMPAI DALAM 20 MENIT.        ",
    "====================================="
  ].filter(Boolean).join("\n");

  const blob = new Blob([lines], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Struk-Kopi8Bit-${o.orderId}.txt`;
  a.click();
}

function closeReceiptModal() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("receipt-modal");
  if (modal) modal.classList.add("hidden");
}

/* ============================================================
   DELIVERY RADAR TRACKER
   ============================================================ */
let trackerStage = 0;
function initDeliveryTracker() {
  updateRadarDisplay();
}

function advanceDeliveryRadar() {
  trackerStage = 1;
  updateRadarDisplay();

  setTimeout(() => {
    trackerStage = 2;
    updateRadarDisplay();
  }, 4000);

  setTimeout(() => {
    trackerStage = 3;
    updateRadarDisplay();
  }, 10000);
}

function updateRadarDisplay() {
  const bike = document.getElementById("delivery-courier-bike");
  const milestones = document.querySelectorAll(".milestone");

  milestones.forEach((m, idx) => {
    if (idx <= trackerStage) m.classList.add("active");
    else m.classList.remove("active");
  });

  if (bike) {
    const positions = ["8%", "38%", "68%", "92%"];
    bike.style.left = positions[trackerStage] || "8%";
  }
}

/* ============================================================
   MINI-GAME INTEGRATION & VOUCHERS
   ============================================================ */
function openMiniGame() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  const modal = document.getElementById("game-modal");
  if (modal) {
    modal.classList.remove("hidden");
    if (window.coffeeGame) {
      window.coffeeGame.start();
    }
  }
}

function closeMiniGame() {
  if (window.soundSystem) window.soundSystem.playBlipSound();
  if (window.coffeeGame) {
    window.coffeeGame.stop();
  }
  const modal = document.getElementById("game-modal");
  if (modal) modal.classList.add("hidden");

  const overModal = document.getElementById("game-over-modal");
  if (overModal) overModal.classList.add("hidden");
}

function applyGameVoucher(code) {
  if (window.soundSystem) window.soundSystem.playPowerupSound();
  
  if (code === "BOSSBEANS20") {
    appliedVoucher = { code: "BOSSBEANS20", discount: 20 };
  } else {
    appliedVoucher = { code: "PIXEL10", discount: 10 };
  }

  showQuickToast(`Voucher ${code} Berhasil Dipasang! Diskon ${appliedVoucher.discount}%`);
  closeMiniGame();
  updateCartUI();
}

/* ============================================================
   KONAMI CODE SECRET CHEAT
   ============================================================ */
function initKonamiCode() {
  const konamiSeq = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];
  let currentIdx = 0;

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    const targetKey = konamiSeq[currentIdx].toLowerCase();

    if (key === targetKey) {
      currentIdx++;
      if (currentIdx === konamiSeq.length) {
        unlockKonamiGodMode();
        currentIdx = 0;
      }
    } else {
      currentIdx = 0;
    }
  });
}

function unlockKonamiGodMode() {
  if (window.soundSystem) window.soundSystem.playPowerupSound();
  appliedVoucher = { code: "KONAMI30", discount: 30 };
  
  // Add free Power Donut to cart
  const donut = MENU_DATA.find(i => i.id === "power-donut") || DEFAULT_MENU_DATA.find(i => i.id === "power-donut");
  if (donut) {
    cart.push({ ...donut, qty: 1, price: 0, name: "FREE GOD-MODE DONUT" });
  }

  updateCartUI();
  alert("🎮 CHEAT CODE ACTIVATED! (↑ ↑ ↓ ↓ ← → ← → B A)\nKamu mendapatkan DISKON 30% + FREE PIXEL DONUT!");
}

/* ============================================================
   AUDIO CONTROLS & CRT FILTER
   ============================================================ */
function initAudioControls() {
  const bgmToggle = document.getElementById("btn-toggle-bgm");
  const sfxToggle = document.getElementById("btn-toggle-sfx");
  const trackBtn = document.getElementById("btn-next-track");
  const crtToggle = document.getElementById("btn-toggle-crt");

  if (bgmToggle) {
    bgmToggle.addEventListener("click", () => {
      const isPlaying = window.soundSystem.toggleBGM();
      bgmToggle.classList.toggle("active", isPlaying);
      bgmToggle.textContent = isPlaying ? "🎵 MUSIK: ON" : "🔇 MUSIK: OFF";
      updateAudioHUD();
    });
  }

  if (sfxToggle) {
    sfxToggle.addEventListener("click", () => {
      window.soundSystem.sfxEnabled = !window.soundSystem.sfxEnabled;
      sfxToggle.classList.toggle("active", window.soundSystem.sfxEnabled);
      sfxToggle.textContent = window.soundSystem.sfxEnabled ? "🔊 SFX: ON" : "🔈 SFX: OFF";
    });
  }

  if (trackBtn) {
    trackBtn.addEventListener("click", () => {
      const name = window.soundSystem.nextTrack();
      updateAudioHUD();
      showQuickToast(`Memutar: ${name}`);
    });
  }

  if (crtToggle) {
    crtToggle.addEventListener("click", () => {
      document.body.classList.toggle("crt-active");
      const active = document.body.classList.contains("crt-active");
      crtToggle.classList.toggle("active", active);
      if (window.soundSystem) window.soundSystem.playBlipSound();
    });
  }
}

function updateAudioHUD() {
  const trackTitle = document.getElementById("music-current-title");
  if (trackTitle && window.soundSystem) {
    trackTitle.textContent = window.soundSystem.getCurrentTrackName();
  }
}

/* ============================================================
   OPERATIONAL STORE STATUS CHECK
   ============================================================ */
function checkStoreStatus() {
  const now = new Date();
  const hour = now.getHours();
  const isOpen = (hour >= 8 && hour < 22);

  const statusText = document.getElementById("store-status-text");
  const statusDot = document.getElementById("store-status-dot");

  if (statusText) {
    statusText.textContent = isOpen ? "KEDAI SEDANG BUKA (08:00 - 22:00)" : "KEDAI SEDANG TUTUP (BUKA 08:00)";
  }
  if (statusDot) {
    statusDot.style.background = isOpen ? "var(--pixel-green)" : "var(--pixel-pink)";
  }
}

/* Quick Toast Notification */
function showQuickToast(msg) {
  let toast = document.getElementById("pixel-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "pixel-toast";
    toast.style.position = "fixed";
    toast.style.bottom = "80px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#180d29";
    toast.style.border = "3px solid var(--pixel-gold)";
    toast.style.padding = "10px 18px";
    toast.style.color = "#fff";
    toast.style.fontSize = "10px";
    toast.style.zIndex = "999999";
    toast.style.boxShadow = "4px 4px 0 #000";
    toast.style.transition = "opacity 0.3s";
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2200);
}
