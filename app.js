// Simple store & cart logic using localStorage
const App = (() => {
  const CURRENCY = "₹";
  const DELIVERY_FEE = 49; // flat delivery

  const PRODUCTS = [
    {id:1, name:"Rose Elegance", price:799, category:"Roses", image:"https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"},
    {id:2, name:"Pastel Mix Bouquet", price:999, category:"Mixed", image:"https://images.unsplash.com/photo-1487530811176-3780de880c2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"},
    {id:3, name:"Orchid Serenity", price:1299, category:"Orchids", image:"https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"},
    {id:4, name:"Lily Pure Whites", price:1099, category:"Lilies", image:"https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"},
    {id:5, name:"Sunshine Basket", price:899, category:"Mixed", image:"https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"},
    {id:6, name:"Crimson Roses Premium", price:1499, category:"Roses", image:"https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"},
    {id:7, name:"Lavender Dream", price:1199, category:"Mixed", image:"https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"},
    {id:8, name:"Orchid Royale", price:1599, category:"Orchids", image:"https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"}
  ];

  // --- Storage helpers ---
  const getCart = () => JSON.parse(localStorage.getItem("fb_cart") || "[]");
  const saveCart = (cart) => localStorage.setItem("fb_cart", JSON.stringify(cart));
  const getCount = () => getCart().reduce((n,i)=>n+i.qty,0);

  // --- UI helpers ---
  const rupee = (n) => `${CURRENCY}${Number(n).toLocaleString("en-IN")}`;

  const setYear = () => {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  };

  const updateCartBadge = () => {
    const el = document.getElementById("cart-count-badge");
    if (el) el.textContent = getCount();
  };

  const showToast = (msg="Added to cart!") => {
    const el = document.getElementById("toast");
    if (!el) return;
    el.querySelector(".toast-body").textContent = msg;
    const t = new bootstrap.Toast(el);
    t.show();
  };

  // --- Product rendering ---
  const productCard = (p) => `
    <div class="col-12 col-sm-6 col-lg-3">
      <div class="card card-product h-100 position-relative">
        <span class="badge bg-success badge-category">${p.category}</span>
        <img src="${p.image}" class="card-img-top" alt="${p.name}">
        <div class="card-body">
          <h3 class="h6">${p.name}</h3>
          <div class="d-flex justify-content-between align-items-center">
            <span class="price">${rupee(p.price)}</span>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-success" onclick="App.buyNow(${p.id})">Buy</button>
              <button class="btn btn-sm btn-success" onclick="App.addToCart(${p.id})"><i class="fa-solid fa-cart-plus"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const renderProducts = (containerId, items) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = items.map(productCard).join("");
  };

  // --- Cart operations ---
  const addToCart = (id, qty=1) => {
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx >= 0) cart[idx].qty += qty;
    else cart.push({ id, qty });
    saveCart(cart);
    updateCartBadge();
    showToast("Added to cart!");
  };

  const removeFromCart = (id) => {
    saveCart(getCart().filter(i => i.id !== id));
    renderCart();
    updateCartBadge();
  };

  const updateQty = (id, qty) => {
    let q = parseInt(qty || "1", 10);
    if (isNaN(q) || q < 1) q = 1;
    const cart = getCart().map(i => i.id === id ? {...i, qty: q} : i);
    saveCart(cart);
    renderCart();
    updateCartBadge();
  };

  const cartDetails = () => {
    const cart = getCart();
    const items = cart.map(ci => {
      const p = PRODUCTS.find(p => p.id === ci.id);
      return {...p, qty: ci.qty, total: p.price * ci.qty};
    });
    const subtotal = items.reduce((n,i)=>n+i.total,0);
    const delivery = items.length ? DELIVERY_FEE : 0;
    const total = subtotal + delivery;
    return { items, subtotal, delivery, total };
  };

  const renderCart = () => {
    const wrap = document.getElementById("cart-items");
    const empty = document.getElementById("empty-cart");
    const sub = document.getElementById("subtotal");
    const del = document.getElementById("delivery");
    const tot = document.getElementById("total");
    if (!wrap) return;

    const { items, subtotal, delivery, total } = cartDetails();
    if (!items.length) {
      wrap.innerHTML = "";
      if (empty) empty.classList.remove("d-none");
    } else {
      if (empty) empty.classList.add("d-none");
      wrap.innerHTML = items.map(i => `
        <div class="card shadow-sm">
          <div class="card-body d-flex align-items-center gap-3">
            <img src="${i.image}" width="96" height="96" class="rounded" style="object-fit:cover" alt="${i.name}">
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h3 class="h6 mb-1">${i.name}</h3>
                  <div class="text-muted small">${i.category}</div>
                </div>
                <span class="price">${rupee(i.price)}</span>
              </div>
              <div class="d-flex align-items-center mt-2">
                <input class="form-control form-control-sm qty-input me-2" type="number" min="1" value="${i.qty}" onchange="App.updateQty(${i.id}, this.value)">
                <button class="btn btn-sm btn-outline-danger" onclick="App.removeFromCart(${i.id})"><i class="fa-solid fa-trash"></i></button>
                <span class="ms-auto fw-semibold">${rupee(i.total)}</span>
              </div>
            </div>
          </div>
        </div>
      `).join("");
    }
    if (sub) sub.textContent = rupee(subtotal);
    if (del) del.textContent = rupee(delivery);
    if (tot) tot.textContent = rupee(total);
  };

  // --- Checkout ---
  const renderCheckoutSummary = () => {
    const list = document.getElementById("checkout-items");
    const sub = document.getElementById("subtotal");
    const del = document.getElementById("delivery");
    const tot = document.getElementById("total");
    if (!list) return;

    const { items, subtotal, delivery, total } = cartDetails();
    list.innerHTML = items.map(i => `
      <div class="d-flex justify-content-between">
        <span>${i.name} × ${i.qty}</span>
        <span>${rupee(i.total)}</span>
      </div>
    `).join("") || '<div class="text-muted">No items in cart.</div>';

    sub.textContent = rupee(subtotal);
    del.textContent = rupee(delivery);
    tot.textContent = rupee(total);
  };

  const bindPaymentSwitch = () => {
    const method = document.getElementById("payment-method");
    const upiWrap = document.getElementById("upi-wrap");
    const cardWrap = document.getElementById("card-wrap");
    if (!method) return;
    method.addEventListener("change", () => {
      upiWrap.classList.add("d-none");
      cardWrap.classList.add("d-none");
      if (method.value === "upi") upiWrap.classList.remove("d-none");
      if (method.value === "card") cardWrap.classList.remove("d-none");
    });
  };

  const bindCheckoutSubmit = () => {
    const form = document.getElementById("checkout-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // Simple validation for payment choice
      const pm = document.getElementById("payment-method").value;
      if (!pm) { alert("Please select a payment method."); return; }
      if (pm === "upi" && !document.getElementById("upi-id").value.trim()) {
        alert("Please enter a UPI ID."); return;
      }
      if (pm === "card") {
        const num = document.getElementById("card-number").value.trim();
        const exp = document.getElementById("card-exp").value.trim();
        const cvv = document.getElementById("card-cvv").value.trim();
        if (!num || !exp || !cvv) { alert("Please enter full card details."); return; }
      }
      // Mock payment success
      localStorage.removeItem("fb_cart");
      window.location.href = "success.html";
    });
  };

  // --- Page initializers ---
  const initCommon = () => {
    setYear();
    updateCartBadge();
  };

  const initHome = () => {
    initCommon();
    // show first 4 products as featured
    renderProducts("featured-products", PRODUCTS.slice(0,4));
  };

  const initShop = () => {
    initCommon();
    const container = "shop-products";
    const search = document.getElementById("search");
    const category = document.getElementById("category");
    const sort = document.getElementById("sort");

    let filtered = [...PRODUCTS];

    const apply = () => {
      let items = [...filtered];

      // category
      const cat = category.value;
      if (cat) items = items.filter(p => p.category === cat);

      // search
      const q = search.value.toLowerCase();
      if (q) items = items.filter(p => p.name.toLowerCase().includes(q));

      // sort
      switch (sort.value) {
        case "price-asc": items.sort((a,b)=>a.price-b.price); break;
        case "price-desc": items.sort((a,b)=>b.price-a.price); break;
        case "name-asc": items.sort((a,b)=>a.name.localeCompare(b.name)); break;
      }

      renderProducts(container, items);
    };

    search.addEventListener("input", apply);
    category.addEventListener("change", apply);
    sort.addEventListener("change", apply);

    apply();
  };

  const initCart = () => { initCommon(); renderCart(); };
  const initCheckout = () => { initCommon(); renderCheckoutSummary(); bindPaymentSwitch(); bindCheckoutSubmit(); };

  // Public API for onclick attrs
  return {
    initHome, initShop, initCart, initCheckout, addToCart, removeFromCart, updateQty,
    buyNow: (id) => { addToCart(id); window.location.href = "checkout.html"; },
    setYear
  };
})();