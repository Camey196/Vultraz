const PRODUCTS=[
 {id:"p1",title:"Conversion Kit Alpha",cat:"kits",description:"Turn any bike into an e-bike.",price:299,image:"https://images.unsplash.com/photo-1602080871985-3792e6b39f87?w=800"},
 {id:"p2",title:"Display Pro",cat:"displays",description:"Smart LCD display for speed & battery.",price:79,image:"https://images.unsplash.com/photo-1599232388705-96dd575c9027?w=800"},
 {id:"p3",title:"Battery Pack 500Wh",cat:"batteries",description:"High capacity lithium battery.",price:199,image:"https://images.unsplash.com/photo-1606813902734-cda9b35d6c8f?w=800"},
 {id:"p4",title:"Throttle Control",cat:"throttle",description:"Responsive twist throttle.",price:39,image:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800"},
 {id:"p5",title:"Comfort Seat",cat:"seat",description:"Ergonomic black seat.",price:49,image:"https://images.unsplash.com/photo-1602080871903-0193f1df59fe?w=800"},
 {id:"p6",title:"Street Tires",cat:"tires",description:"Durable road tires.",price:59,image:"https://images.unsplash.com/photo-1519751138087-5bf79df62d5a?w=800"},
 {id:"p7",title:"Grip Set",cat:"grips",description:"Anti-slip handle grips.",price:19,image:"https://images.unsplash.com/photo-1600093463590-9f2a7351f18c?w=800"},
 {id:"p8",title:"Bars Carbon",cat:"bars",description:"Lightweight carbon handlebars.",price:89,image:"https://images.unsplash.com/photo-1589558928675-9425d85d1f5a?w=800"},
 {id:"p9",title:"Motor 250W",cat:"motors",description:"Efficient hub motor.",price:149,image:"https://images.unsplash.com/photo-1606813902677-c49f3e83b081?w=800"}
];

const el=s=>document.querySelector(s),elAll=s=>[...document.querySelectorAll(s)];
let cart=JSON.parse(localStorage.getItem("cart")||"{}");

function saveCart(){localStorage.setItem("cart",JSON.stringify(cart));updateCartUI();}

function updateCartUI(){
 el("#cart-count").textContent=Object.values(cart).reduce((s,p)=>s+p.qty,0);
 elAll("#cart-items, #checkout-items").forEach(container=>{
   container&&(container.innerHTML="",Object.values(cart).forEach(it=>{
     const div=document.createElement("div");
     div.innerHTML=`${it.title} €${it.price} × ${it.qty}
     <button data-id="${it.id}" class="plus">+</button>
     <button data-id="${it.id}" class="minus">-</button>`;
     container.appendChild(div);
   }));
 });
 let sub=Object.values(cart).reduce((s,p)=>s+p.price*p.qty,0);
 elAll("#subtotal").forEach(s=>s.textContent="€"+sub.toFixed(2));
 let ship=sub>50||sub===0?0:4.99;
 elAll("#shipping").forEach(s=>s.textContent="€"+ship.toFixed(2));
 elAll("#total").forEach(s=>s.textContent="€"+(sub+ship).toFixed(2));
 elAll(".plus").forEach(b=>b.onclick=()=>{cart[b.dataset.id].qty++;saveCart()});
 elAll(".minus").forEach(b=>b.onclick=()=>{if(cart[b.dataset.id].qty>1)cart[b.dataset.id].qty--;else delete cart[b.dataset.id];saveCart()});
}

function render(list,target="#products"){
 const container=el(target);container.innerHTML="";
 list.forEach(p=>{
   const c=document.createElement("div");c.className="card";
   c.innerHTML=`<img src="${p.image}" alt=""><h4>${p.title}</h4><div class="price">€${p.price}</div><p>${p.description}</p>
   <div class="actions"><button data-id="${p.id}">Add</button></div>`;
   container.appendChild(c);
   c.querySelector("button").onclick=()=>{if(!cart[p.id])cart[p.id]={...p,qty:0};cart[p.id].qty++;saveCart();showToast("Added")};
 });
}

function showToast(msg){const t=el("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1500);}

document.addEventListener("DOMContentLoaded",()=>{
 render(PRODUCTS);updateCartUI();
 elAll(".dropdown-content a").forEach(a=>a.onclick=e=>{
   e.preventDefault();
   const c=a.dataset.cat;
   if(c==="account"){showToast("Stripe login placeholder")}
   else{render(PRODUCTS.filter(p=>p.cat===c))}
 });
 el("#search")?.addEventListener("input",e=>{
   const q=e.target.value.toLowerCase();
   render(PRODUCTS.filter(p=>(p.title+p.description).toLowerCase().includes(q)));
 });
});
