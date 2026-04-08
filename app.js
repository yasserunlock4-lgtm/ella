import {
  db,
  hasFirebaseConfig,
  ref,
  get,
  child
} from "./firebase-config.js";

const fallbackProducts = [
  {
    id: 1,
    name: "بوكس جلو إيلا",
    price: 100000,
    oldPrice: 120000,
    desc: "الباقة المثالية لدخول برنامج شركاء المبيعات والحصول على مزايا المؤسسين.",
    details: "بوكس مميز يجمع بين منتجات مختارة بعناية مع قيمة شراء تؤهلك للدخول إلى برنامج Ella Founders 50 إذا كنت من أول 50 شخص.",
    badge: "يدخلك البرنامج",
    category: "بوكسات",
    emoji: "✨",
    featured: true
  },
  {
    id: 2,
    name: "بوكس عناية يومية",
    price: 65000,
    oldPrice: 80000,
    desc: "مجموعة أساسية للعناية اليومية بالبشرة بتغليف أنيق ومناسب للهدايا.",
    details: "يشمل منتجات يومية للعناية والتنظيف والترطيب، مناسب كبداية ممتازة لكل عميلة.",
    badge: "الأكثر طلبًا",
    category: "بوكسات",
    emoji: "🧴",
    featured: false
  },
  {
    id: 3,
    name: "بوكس ميكب فاخر",
    price: 145000,
    oldPrice: 170000,
    desc: "منتجات مختارة بعناية للميكب والإطلالة اليومية مع لمسة فاخرة.",
    details: "بوكس فاخر مناسب للهدايا أو للإطلالات الكاملة، ويمنح قيمة شراء عالية داخل المتجر.",
    badge: "قيمة أعلى",
    category: "بوكسات",
    emoji: "💄",
    featured: false
  },
  {
    id: 4,
    name: "سيروم فيتامين C",
    price: 28000,
    oldPrice: 35000,
    desc: "سيروم يمنح البشرة إشراقة يومية ومظهرًا صحيًا ومتجددًا.",
    details: "خيار ممتاز للعناية اليومية ولمظهر أكثر إشراقًا مع استخدام منتظم.",
    badge: "عناية بالبشرة",
    category: "عناية بالبشرة",
    emoji: "🍊",
    featured: false
  },
  {
    id: 5,
    name: "غسول رغوي ناعم",
    price: 22000,
    oldPrice: 27000,
    desc: "غسول خفيف للاستخدام اليومي مع إحساس منعش ونظيف.",
    details: "مناسب للاستخدام اليومي، يترك البشرة نظيفة ومنتعشة بملمس لطيف.",
    badge: "لطيف يوميًا",
    category: "عناية بالبشرة",
    emoji: "🫧",
    featured: false
  },
  {
    id: 6,
    name: "كريم ترطيب حريري",
    price: 24000,
    oldPrice: 30000,
    desc: "ترطيب ناعم بملمس خفيف مناسب للاستخدام الصباحي والمسائي.",
    details: "ترطيب يومي بملمس خفيف وسريع الامتصاص ومناسب للاستخدام المستمر.",
    badge: "ترطيب",
    category: "عناية بالبشرة",
    emoji: "🤍",
    featured: false
  },
  {
    id: 7,
    name: "روج إيلا مات",
    price: 18000,
    oldPrice: 23000,
    desc: "لون ثابت ولمسة مات ناعمة تناسب الإطلالات اليومية.",
    details: "درجة أنيقة تدوم بشكل جيد وتناسب الاستخدام اليومي والمناسبات الخفيفة.",
    badge: "ميكب",
    category: "ميكب",
    emoji: "💋",
    featured: false
  },
  {
    id: 8,
    name: "باليت ظلال ناعم",
    price: 32000,
    oldPrice: 39000,
    desc: "تدرجات هادئة وعصرية مناسبة للنهار والمناسبات.",
    details: "ألوان مرنة وسهلة الاستخدام بإطلالات متنوعة بين اليومية والناعمة والفخمة.",
    badge: "ألوان مميزة",
    category: "ميكب",
    emoji: "🎨",
    featured: false
  },
  {
    id: 9,
    name: "عطر روز لَش",
    price: 48000,
    oldPrice: 55000,
    desc: "عطر نسائي بنفحات زهرية ولمسة فخمة تدوم طويلًا.",
    details: "رائحة أنثوية جذابة بطابع زهري ولمسة فخمة مناسبة للهدايا والاستخدام الشخصي.",
    badge: "عطور",
    category: "عطور",
    emoji: "🌹",
    featured: false
  }
];

const fallbackSettings = {
  partnerProgram: {
    title: "Ella Founders 50",
    subtitle: "برنامج حصري لأول 50 شريك مبيعات",
    minimumPurchase: 100000,
    duration: "6 أشهر",
    points: [
      "اشتري من إيلا بقيمة 100,000 د.ع أو أكثر",
      "كوني من أول 50 شخص فقط داخل البرنامج",
      "احصلي على كود خصم ورابط مشاركة خاص بك",
      "عمولة على كل طلب مكتمل يأتي من خلالك",
      "مدة الشراكة 6 أشهر مع مزايا إضافية وترقيات",
      "يمكن تطويرك من Silver إلى Gold ثم VIP حسب الأداء"
    ]
  }
};

const categories = ["الكل", "عناية بالبشرة", "ميكب", "عطور", "بوكسات"];

let state = {
  products: [],
  settings: fallbackSettings,
  activeCategory: "الكل",
  cart: []
};

const els = {
  productsGrid: document.getElementById("productsGrid"),
  categoryFilters: document.getElementById("categoryFilters"),
  loadingBox: document.getElementById("loadingBox"),
  cartBtn: document.getElementById("cartBtn"),
  cartCount: document.getElementById("cartCount"),
  cartDrawer: document.getElementById("cartDrawer"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  cartPartnerNote: document.getElementById("cartPartnerNote"),
  productModal: document.getElementById("productModal"),
  productModalContent: document.getElementById("productModalContent"),
  partnerModal: document.getElementById("partnerModal"),
  partnerPoints: document.getElementById("partnerPoints"),
  openPartnerBtn: document.getElementById("openPartnerBtn"),
  openPartnerFromHero: document.getElementById("openPartnerFromHero"),
  openPartnerFromCart: document.getElementById("openPartnerFromCart"),
  checkoutBtn: document.getElementById("checkoutBtn")
};

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("en-US")} د.ع`;
}

function normalizePoints(points) {
  if (Array.isArray(points)) return points;
  if (points && typeof points === "object") {
    return Object.values(points);
  }
  return fallbackSettings.partnerProgram.points;
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

function getFilteredProducts() {
  if (state.activeCategory === "الكل") return state.products;
  return state.products.filter((p) => p.category === state.activeCategory);
}

function renderFilters() {
  if (!els.categoryFilters) return;

  els.categoryFilters.innerHTML = categories
    .map(
      (category) => `
      <button class="filter-btn ${state.activeCategory === category ? "active" : ""}" data-category="${category}">
        ${category}
      </button>
    `
    )
    .join("");

  els.categoryFilters.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeCategory = btn.dataset.category;
      renderFilters();
      renderProducts();
    });
  });
}

function renderProducts() {
  if (!els.productsGrid) return;

  const products = getFilteredProducts();

  if (!products.length) {
    els.productsGrid.innerHTML = `<div class="empty-cart">لا توجد منتجات في هذا القسم حاليًا</div>`;
    return;
  }

  els.productsGrid.innerHTML = products
    .map(
      (product) => `
      <div class="product-card">
        <div class="product-image">${product.emoji || "🧴"}</div>

        <div class="product-meta">
          <span class="badge ${product.featured ? "featured" : ""}">${product.badge || ""}</span>
          <span class="category-text">${product.category || ""}</span>
        </div>

        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.desc || ""}</p>

        <div class="product-bottom">
          <div>
            <div class="price-label">السعر</div>
            <div class="prices">
              <div class="price">${formatPrice(product.price)}</div>
              <div class="old-price">${formatPrice(product.oldPrice || 0)}</div>
            </div>
          </div>

          <div class="product-actions">
            <button class="btn btn-light details-btn" data-id="${product.id}">التفاصيل</button>
            <button class="btn btn-dark add-btn" data-id="${product.id}">اطلب الآن</button>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  els.productsGrid.querySelectorAll(".details-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = state.products.find((p) => String(p.id) === btn.dataset.id);
      showProductDetails(product);
    });
  });

  els.productsGrid.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = state.products.find((p) => String(p.id) === btn.dataset.id);
      addToCart(product);
    });
  });
}

function showProductDetails(product) {
  if (!product || !els.productModalContent) return;

  const minimum = state.settings?.partnerProgram?.minimumPurchase || 100000;

  els.productModalContent.innerHTML = `
    <div class="product-modal-grid">
      <div class="product-modal-image">${product.emoji || "🧴"}</div>

      <div class="product-modal-content">
        <span class="badge ${product.featured ? "featured" : ""}">${product.badge || ""}</span>
        <h3>${product.name}</h3>
        <p>${product.details || product.desc || ""}</p>

        <div class="prices" style="margin-top:16px;">
          <div class="price">${formatPrice(product.price)}</div>
          <div class="old-price">${formatPrice(product.oldPrice || 0)}</div>
        </div>

        ${
          product.featured
            ? `
          <div class="notice">
            هذا المنتج يؤهلك للدخول إلى برنامج شركاء المبيعات إذا وصل مجموع شرائك إلى ${formatPrice(minimum)} وكنت من أول 50 شخص.
          </div>
        `
            : ""
        }

        <div style="margin-top:18px; display:flex; gap:10px; flex-wrap:wrap;">
          <button id="modalAddToCart" class="btn btn-dark">أضف إلى السلة</button>
          <button class="btn btn-light" data-close="productModal">إغلاق</button>
        </div>
      </div>
    </div>
  `;

  openModal("productModal");

  document.getElementById("modalAddToCart")?.addEventListener("click", () => {
    addToCart(product);
    closeModal("productModal");
  });

  els.productModalContent.querySelectorAll("[data-close='productModal']").forEach((btn) => {
    btn.addEventListener("click", () => closeModal("productModal"));
  });
}

function renderPartnerModal() {
  if (!els.partnerPoints) return;

  const program = state.settings?.partnerProgram || fallbackSettings.partnerProgram;
  const points = normalizePoints(program.points);

  els.partnerPoints.innerHTML = points
    .map(
      (point) => `
      <div class="partner-point">
        <div class="partner-check">✓</div>
        <div>${point}</div>
      </div>
    `
    )
    .join("");
}

function addToCart(product) {
  if (!product) return;

  const existing = state.cart.find((item) => item.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }

  renderCart();
  openModal("cartDrawer");
}

function renderCart() {
  if (!els.cartItems || !els.cartTotal || !els.cartPartnerNote || !els.cartCount) return;

  els.cartCount.textContent = state.cart.reduce((sum, item) => sum + item.qty, 0);

  if (!state.cart.length) {
    els.cartItems.innerHTML = `<div class="empty-cart">السلة فارغة حاليًا</div>`;
  } else {
    els.cartItems.innerHTML = state.cart
      .map(
        (item) => `
        <div class="cart-item">
          <div class="cart-item-head">
            <div>
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-sub">الكمية: ${item.qty}</div>
            </div>
            <div class="price" style="font-size:22px;">${formatPrice(item.price * item.qty)}</div>
          </div>
        </div>
      `
      )
      .join("");
  }

  const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  els.cartTotal.textContent = formatPrice(total);

  const minimum = state.settings?.partnerProgram?.minimumPurchase || 100000;

  if (total >= minimum) {
    els.cartPartnerNote.textContent =
      "هذا الطلب مؤهل مبدئيًا لعرض الشراكة لأن مجموع السلة 100,000 د.ع أو أكثر.";
    els.cartPartnerNote.classList.add("good");
  } else {
    els.cartPartnerNote.textContent =
      "إذا وصل مجموع طلبك إلى 100,000 د.ع أو أكثر، يمكنك التقديم على عرض الشراكة.";
    els.cartPartnerNote.classList.remove("good");
  }
}

async function loadProductsFromRealtimeDB() {
  try {
    const snapshot = await get(child(ref(db), "products"));

    if (!snapshot.exists()) return fallbackProducts;

    const data = snapshot.val();
    const items = Object.values(data || {}).map((item, index) => ({
      id: item.id || index + 1,
      name: item.name || "",
      price: Number(item.price || 0),
      oldPrice: Number(item.oldPrice || 0),
      desc: item.desc || "",
      details: item.details || item.desc || "",
      badge: item.badge || "",
      category: item.category || "الكل",
      emoji: item.emoji || "🧴",
      featured: Boolean(item.featured)
    }));

    return items.length ? items : fallbackProducts;
  } catch (error) {
    console.error("Realtime DB products error:", error);
    return fallbackProducts;
  }
}

async function loadSettingsFromRealtimeDB() {
  try {
    const snapshot = await get(child(ref(db), "settings/store"));

    if (!snapshot.exists()) return fallbackSettings;

    const data = snapshot.val();

    return {
      partnerProgram: {
        title: data.partnerProgram?.title || fallbackSettings.partnerProgram.title,
        subtitle: data.partnerProgram?.subtitle || fallbackSettings.partnerProgram.subtitle,
        minimumPurchase: Number(data.partnerProgram?.minimumPurchase || 100000),
        duration: data.partnerProgram?.duration || "6 أشهر",
        points: normalizePoints(data.partnerProgram?.points)
      }
    };
  } catch (error) {
    console.error("Realtime DB settings error:", error);
    return fallbackSettings;
  }
}

async function init() {
  if (els.loadingBox) els.loadingBox.style.display = "block";

  if (hasFirebaseConfig) {
    state.products = await loadProductsFromRealtimeDB();
    state.settings = await loadSettingsFromRealtimeDB();
  } else {
    state.products = fallbackProducts;
    state.settings = fallbackSettings;
  }

  renderFilters();
  renderProducts();
  renderPartnerModal();
  renderCart();

  if (els.loadingBox) els.loadingBox.style.display = "none";
}

document.addEventListener("click", (e) => {
  const closeTarget = e.target.getAttribute("data-close");
  if (closeTarget) closeModal(closeTarget);
});

els.cartBtn?.addEventListener("click", () => openModal("cartDrawer"));
els.openPartnerBtn?.addEventListener("click", () => openModal("partnerModal"));
els.openPartnerFromHero?.addEventListener("click", () => openModal("partnerModal"));
els.openPartnerFromCart?.addEventListener("click", () => openModal("partnerModal"));

els.checkoutBtn?.addEventListener("click", () => {
  alert("هنا لاحقًا نربط الطلب مع واتساب أو تيليجرام أو Firebase.");
});

init();
