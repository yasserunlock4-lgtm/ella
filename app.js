import {
  db,
  hasFirebaseConfig,
  ref,
  get,
  child,
  push,
  set
} from "./firebase-config.js";

const fallbackProducts = [
  {
    id: 1,
    name: "بوكس جلو إيلا",
    price: 100000,
    oldPrice: 120000,
    desc: "بوكس مميز ومنتج أساسي داخل المتجر.",
    details: "بوكس مميز يجمع بين منتجات مختارة بعناية.",
    badge: "الأكثر طلبًا",
    category: "بوكسات",
    emoji: "✨",
    featured: true
  },
  {
    id: 2,
    name: "بوكس عناية يومية",
    price: 65000,
    oldPrice: 80000,
    desc: "مجموعة أساسية للعناية اليومية بالبشرة.",
    details: "يشمل منتجات يومية للعناية والتنظيف والترطيب.",
    badge: "مميز",
    category: "بوكسات",
    emoji: "🧴",
    featured: false
  }
];

const fallbackSettings = {
  store: {
    discount: {
      enabled: false,
      code: "",
      percent: 0,
      text: ""
    }
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
  cartBtnHero: document.getElementById("cartBtnHero"),
  cartCount: document.getElementById("cartCount"),
  cartDrawer: document.getElementById("cartDrawer"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  discountBox: document.getElementById("discountBox"),
  productModal: document.getElementById("productModal"),
  productModalContent: document.getElementById("productModalContent"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  checkoutModal: document.getElementById("checkoutModal"),
  checkoutTotal: document.getElementById("checkoutTotal"),
  checkoutDiscountText: document.getElementById("checkoutDiscountText"),
  orderForm: document.getElementById("orderForm"),
  customerName: document.getElementById("customerName"),
  customerPhone: document.getElementById("customerPhone"),
  customerGovernorate: document.getElementById("customerGovernorate"),
  customerArea: document.getElementById("customerArea"),
  customerDetails: document.getElementById("customerDetails")
};

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("en-US")} د.ع`;
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

function getDiscountSettings() {
  return state.settings?.store?.discount || fallbackSettings.store.discount;
}

function calculateCartTotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function calculateDiscountAmount(total) {
  const discount = getDiscountSettings();
  if (!discount.enabled || !discount.percent) return 0;
  return Math.round((total * Number(discount.percent)) / 100);
}

function calculateFinalTotal() {
  const total = calculateCartTotal();
  const discountAmount = calculateDiscountAmount(total);
  return Math.max(total - discountAmount, 0);
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
  if (!els.cartItems || !els.cartTotal || !els.cartCount || !els.discountBox) return;

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

  const total = calculateCartTotal();
  const finalTotal = calculateFinalTotal();
  const discount = getDiscountSettings();
  const discountAmount = calculateDiscountAmount(total);

  els.cartTotal.textContent = formatPrice(finalTotal);

  if (discount.enabled && discount.code) {
    els.discountBox.classList.remove("hidden");
    els.discountBox.innerHTML = `
      <strong>كود الخصم:</strong> ${discount.code}<br>
      <strong>الخصم:</strong> ${discount.percent}%<br>
      <strong>قيمة الخصم:</strong> ${formatPrice(discountAmount)}
      ${discount.text ? `<br><strong>ملاحظة:</strong> ${discount.text}` : ""}
    `;
  } else {
    els.discountBox.classList.add("hidden");
    els.discountBox.innerHTML = "";
  }

  if (els.checkoutTotal) {
    els.checkoutTotal.textContent = formatPrice(finalTotal);
  }

  if (els.checkoutDiscountText) {
    if (discount.enabled && discount.code) {
      els.checkoutDiscountText.classList.remove("hidden");
      els.checkoutDiscountText.innerHTML = `
        تم تطبيق كود الخصم <strong>${discount.code}</strong> بنسبة ${discount.percent}% 
        وقيمة الخصم ${formatPrice(discountAmount)}
      `;
    } else {
      els.checkoutDiscountText.classList.add("hidden");
      els.checkoutDiscountText.innerHTML = "";
    }
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
      store: {
        discount: {
          enabled: Boolean(data.discount?.enabled),
          code: data.discount?.code || "",
          percent: Number(data.discount?.percent || 0),
          text: data.discount?.text || ""
        }
      }
    };
  } catch (error) {
    console.error("Realtime DB settings error:", error);
    return fallbackSettings;
  }
}

async function submitOrder(event) {
  event.preventDefault();

  if (!state.cart.length) {
    alert("السلة فارغة");
    return;
  }

  const fullName = els.customerName?.value.trim();
  const phone = els.customerPhone?.value.trim();
  const governorate = els.customerGovernorate?.value.trim();
  const area = els.customerArea?.value.trim();
  const details = els.customerDetails?.value.trim();

  if (!fullName || !phone || !governorate || !area) {
    alert("يرجى ملء الاسم والرقم والمحافظة والمنطقة");
    return;
  }

  const total = calculateCartTotal();
  const discount = getDiscountSettings();
  const discountAmount = calculateDiscountAmount(total);
  const finalTotal = calculateFinalTotal();

  const orderData = {
    customer: {
      fullName,
      phone,
      governorate,
      area,
      details: details || ""
    },
    items: state.cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      total: item.price * item.qty
    })),
    pricing: {
      subtotal: total,
      discountEnabled: discount.enabled,
      discountCode: discount.code || "",
      discountPercent: Number(discount.percent || 0),
      discountAmount,
      finalTotal
    },
    status: "new",
    createdAt: new Date().toISOString()
  };

  try {
    const orderRef = push(ref(db, "orders"));
    await set(orderRef, orderData);

    alert("تم إرسال الطلب بنجاح");

    state.cart = [];
    renderCart();

    els.orderForm.reset();
    closeModal("checkoutModal");
    closeModal("cartDrawer");
  } catch (error) {
    console.error("Order save error:", error);
    alert("حدث خطأ أثناء حفظ الطلب");
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
  renderCart();

  if (els.loadingBox) els.loadingBox.style.display = "none";
}

document.addEventListener("click", (e) => {
  const closeTarget = e.target.getAttribute("data-close");
  if (closeTarget) closeModal(closeTarget);
});

els.cartBtn?.addEventListener("click", () => openModal("cartDrawer"));
els.cartBtnHero?.addEventListener("click", () => openModal("cartDrawer"));

els.checkoutBtn?.addEventListener("click", () => {
  if (!state.cart.length) {
    alert("السلة فارغة");
    return;
  }
  renderCart();
  openModal("checkoutModal");
});

els.orderForm?.addEventListener("submit", submitOrder);

init();
