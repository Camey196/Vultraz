// ---- VULTRAS Store Core ----
(function(){
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));

  // --- Catalog (add featured:true where needed) ---
  const PRODUCTS = [
    {id:"p1", title:"Conversion Kit Pro", cat:"kits", price:499, featured:true,  image:"https://images.unsplash.com/photo-1602080871985-3792e6b39f87?w=1200&q=80"},
    {id:"p2", title:"LCD Display X2",      cat:"displays", price:99,  featured:true,  image:"https://images.unsplash.com/photo-1599232388705-96dd575c9027?w=1200&q=80"},
    {id:"p3", title:"48V Battery Pack",    cat:"batteries", price:299, featured:true,  image:"https://images.unsplash.com/photo-1606813902734-cda9b35d6c8f?w=1200&q=80"},
    {id:"p4", title:"Throttle Grip",       cat:"throttle", price:29,  featured:false, image:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80"},
    {id:"p5", title:"Racing Seat",         cat:"seat",     price:149, featured:false, image:"https://images.unsplash.com/photo-1602080871903-0193f1df59fe?w=1200&q=80"},
    {id:"p6", title:"All-Terrain Tires",   cat:"tires",    price:89,  featured:false, image:"https://images.unsplash.com/photo-1519751138087-5bf79df62d5a?w=1200&q=80"},
    {id:"p7", title:"Comfort Grips",       cat:"grips",    price:25,  featured:false, image:"https://images.unsplash.com/photo-1600093463590-9f2a7351f18c?w=1200&q=80"},
    {id:"p8", title:"Carbon Bars",         cat:"bars",     price:199, featured:false, image:"https://images.unsplash.com/photo-1589558928675-9425d85d1f5a?w=1200&q=80"},
    {id:"p9", title:"Motor 250W",          cat:"motors",   price:229, featured:true,  image:"https://images.unsplash.com/photo-1606813902677-c49f3e83b081?w=1200&q=80"}
  ];

  // --- State (persisted cart) ---
  let cart = JSON.parse(localStorage.getItem("vultras_cart")||"{}");
  function save(){ localStorage.setItem("vultras_cart", JSON.stringify(cart)); }

  // --- UI helpers ---
  function toast(msg){
    const t = $("#toast"); if(!t) return;
    t.textContent = msg; t.classList.add("show");
    setTimeout(()=>t.classList.remove("show"),1500);
  }

  function updateCartBadge(){
    const count = Object.values(cart).reduce((s,i)=>s+i.qty,0);
    $$(".cart-count").forEach(b=>b.textContent = count);
  }

  // --- Catalog rendering ---
  function cardHTML(p){
    return `
      <div class="card">
        <img src="${p.image}" alt="${p.title}">
        <h4>${p.title}</h4>
        <div class="price">€${p.price}</div>
        <div class="actions">
          <button data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    `;
  }

  function render(list, targetSel="#grid"){
    const target = $(targetSel);
    if(!target) return;
    target.innerHTML = list.map(cardHTML).join("");
    // bind add-to-cart
    $$("button[data-add]", target).forEach(btn=>{
      btn.addEventListener("click",()=>{
        const id = btn.getAttribute("data-add");
        const prod = PRODUCTS.find(x=>x.id===id);
        if(!cart[id]) cart[id] = {id:prod.id, title:prod.title, price:prod.price, qty:0};
        cart[id].qty++;
        save(); updateCartBadge(); toast("Added to cart");
      });
    });
  }

  // --- Featured + Filters on landing ---
  function renderFeatured(targetSel="#grid"){
    render(PRODUCTS.filter(p=>p.featured), targetSel);
    // enable dropdown category filtering (re-uses the same target)
    $$(".dropdown-content a[data-cat]").forEach(a=>{
      a.addEventListener("click", e=>{
        e.preventDefault();
        const c = a.dataset.cat;
        if(c==="featured") return render(PRODUCTS.filter(p=>p.featured), targetSel);
        if(c==="all")      return render(PRODUCTS, targetSel);
        render(PRODUCTS.filter(p=>p.cat===c), targetSel);
      });
    });
  }

  // --- Cart page rendering ---
  function renderCart(targetSel="#cart-items"){
    const container = $(targetSel);
    if(!container) return;
    const items = Object.values(cart);
    container.innerHTML = items.length
      ? items.map(it => `
          <div class="line" data-id="${it.id}">
            <div class="info">
              <strong>${it.title}</strong><br>
              <span class="muted">€${it.price} each</span>
            </div>
            <div class="qty-controls">
              <button class="qty-btn" data-act="dec">−</button>
              <span>${it.qty}</span>
              <button class="qty-btn" data-act="inc">+</button>
              <button class="remove-btn btn-link" data-act="rm">Remove</button>
            </div>
            <div><strong>€${(it.price*it.qty).toFixed(2)}</strong></div>
          </div>
        `).join("")
      : `<p class="muted">Your cart is empty.</p>`;

    // Bind qty controls
    $$(".line", container).forEach(row=>{
      const id = row.dataset.id;
      $$("[data-act]", row).forEach(btn=>{
        btn.addEventListener("click", ()=>{
          const act = btn.dataset.act;
          if(act==="inc"){ cart[id].qty++; }
          if(act==="dec"){ cart[id].qty--; if(cart[id].qty<=0) delete cart[id]; }
          if(act==="rm"){ delete cart[id]; }
          save(); updateCartBadge(); renderCart(targetSel);
        });
      });
    });

    // Totals
    const subtotal = Object.values(cart).reduce((s,i)=>s+i.price*i.qty,0);
    const shipping = (subtotal===0 || subtotal>50) ? 0 : 4.99;
    const total = subtotal + shipping;
    $$("#subtotal").forEach(n=>n.textContent = "€"+subtotal.toFixed(2));
    $$("#shipping").forEach(n=>n.textContent = "€"+shipping.toFixed(2));
    $$("#total").forEach(n=>n.textContent = "€"+total.toFixed(2));
  }

  function clearCart(){
    cart = {};
    save(); updateCartBadge();
  }

  // --- Expose small API for pages ---
  window.VULTRAS = {
    renderFeatured,
    render,
    renderCart,
    clearCart,
    toast
  };

  // Init common badge on every page
  document.addEventListener("DOMContentLoaded", updateCartBadge);
})();
