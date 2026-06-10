import{t as e}from"./store-Cz5k5dBT.js";var t=[],n=[];document.addEventListener(`DOMContentLoaded`,()=>{r(),a(),o(),s(),l(),d(),window.addEventListener(`scroll`,()=>{if(i!==void 0&&i)return;let e=Array.from(document.querySelectorAll(`.category-section`)),t=document.querySelectorAll(`.category-tab`),n=document.getElementById(`category-indicator`);if(e.length===0||t.length===0)return;let r=null;for(let t=e.length-1;t>=0;t--)if(e[t].getBoundingClientRect().top<=350){r=e[t];break}if(r||=e[0],r){let e=r.querySelector(`.category-heading`);if(!e)return;let i=e.textContent.trim();t.forEach(e=>{if(e.textContent.trim()===i&&!e.classList.contains(`active`)&&(t.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),n)){n.style.width=e.offsetWidth+`px`,n.style.left=e.offsetLeft+`px`;let t=e.closest(`.category-list`);if(t){let n=e.offsetLeft-t.clientWidth/2+e.clientWidth/2;t.scrollTo({left:n,behavior:`smooth`})}}})}},{passive:!0}),e.subscribe(()=>{r(),n.length>0&&d()})});function r(){let n=document.getElementById(`menu-container`),r=e.getMenu();n.innerHTML=``,[...new Set(r.map(e=>e.category))].forEach(e=>{let i=r.filter(t=>t.category===e);if(i.length>0){let r=document.createElement(`div`);r.className=`category-section`,r.id=`cat-`+e.replace(/\s+/g,`-`);let a=document.createElement(`h2`);a.className=`category-heading`,a.textContent=e,r.appendChild(a);let o=document.createElement(`div`);o.className=`menu-grid`,i.forEach(e=>{let n=document.createElement(`article`);n.className=`menu-card ${e.available?``:`disabled`}`;let r=t.filter(t=>t.id===e.id).reduce((e,t)=>e+t.qty,0),i=``;e.available&&(i=r>0?`
          <div style="display: flex; align-items: center; gap: 8px; background: var(--color-surface-container); padding: 4px; border-radius: 20px;">
            <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-lowest); color: var(--color-primary);" onclick="quickDecrement('${e.id}')">
              <span class="material-symbols-outlined" style="font-size: 16px;">remove</span>
            </button>
            <span style="font-weight: bold; font-size: 14px; min-width: 16px; text-align: center;">${r}</span>
            <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-lowest); color: var(--color-primary);" onclick="openCustomizationModal('${e.id}')">
              <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
            </button>
          </div>
        `:`
          <button class="btn-icon" onclick="openCustomizationModal('${e.id}')">
            <span class="material-symbols-outlined">add</span>
          </button>
        `),n.innerHTML=`
      <div class="menu-img-container">
        <img src="${e.image}" alt="${e.name}">
      </div>
      <div class="menu-info">
        <div>
          <h3 class="menu-title">${e.name}</h3>
          <p class="menu-desc line-clamp-2">${e.desc}</p>
        </div>
        <div class="menu-footer">
          <span class="menu-price">Rp ${e.price.toLocaleString(`id-ID`)}</span>
          ${i}
        </div>
      </div>
    `,o.appendChild(n)}),r.appendChild(o),n.appendChild(r)}})}var i=!1;function a(){let e=document.querySelectorAll(`.nav-item`),t=document.querySelectorAll(`.view-section`);e.forEach(n=>{n.addEventListener(`click`,r=>{r.preventDefault();let i=n.getAttribute(`href`).substring(1);e.forEach(e=>e.classList.remove(`active`)),n.classList.add(`active`),t.forEach(e=>{e.id===i?e.classList.add(`active`):e.classList.remove(`active`)}),l(),i===`view-cart`&&u()})}),document.getElementById(`floating-cart-bar`).addEventListener(`click`,()=>{document.querySelector(`.nav-item[href="#view-cart"]`).click()})}function o(){let e=document.querySelectorAll(`.category-tab`),t=document.getElementById(`category-indicator`);function n(e){!t||!e||(t.style.width=e.offsetWidth+`px`,t.style.left=e.offsetLeft+`px`)}let r=document.querySelector(`.category-tab.active`);r&&setTimeout(()=>n(r),100),e.forEach(t=>{t.addEventListener(`click`,()=>{i=!0,setTimeout(()=>{i=!1},800);let r=t.textContent.trim();if(r===`SEMUA`)window.scrollTo({top:0,behavior:`smooth`});else{let e=`cat-`+r.replace(/\s+/g,`-`),t=document.getElementById(e);t&&t.scrollIntoView({behavior:`smooth`})}e.forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),n(t);let a=t.closest(`.category-list`);if(a){let e=t.offsetLeft-a.clientWidth/2+t.clientWidth/2;a.scrollTo({left:e,behavior:`smooth`})}})})}window.openCustomizationModal=function(t){let n=e.getMenu().find(e=>e.id===t);n&&(document.getElementById(`modal-item-id`).value=n.id,document.getElementById(`modal-cart-index`).value=``,document.getElementById(`modal-title`).textContent=n.name,document.getElementById(`modal-desc`).textContent=n.desc,document.getElementById(`modal-img`).src=n.image,document.getElementById(`modal-price`).dataset.basePrice=n.price,document.getElementById(`modal-price`).textContent=`Rp ${n.price.toLocaleString(`id-ID`)}`,document.getElementById(`customization-form`).reset(),document.getElementById(`modal-quantity-val`).value=1,document.getElementById(`modal-quantity-display`).textContent=`1`,document.getElementById(`customization-modal`).classList.add(`active`),document.getElementById(`modal-overlay`).classList.add(`active`))},window.openEditModal=function(n){let r=t[n];if(!r)return;let i=e.getMenu().find(e=>e.id===r.id);if(!i)return;if(document.getElementById(`modal-item-id`).value=r.id,document.getElementById(`modal-cart-index`).value=n,document.getElementById(`modal-title`).textContent=r.name,document.getElementById(`modal-desc`).textContent=i.desc,document.getElementById(`modal-img`).src=r.image,document.getElementById(`modal-price`).dataset.basePrice=r.price,document.getElementById(`customization-form`).reset(),r.sugar){let e=document.querySelector(`input[name="sugar"][value="${r.sugar}"]`);e&&(e.checked=!0)}let a=document.querySelector(`textarea[name="note"]`);a&&r.note&&(a.value=r.note),document.getElementById(`modal-quantity-val`).value=r.qty,document.getElementById(`modal-quantity-display`).textContent=r.qty;let o=r.price*r.qty;document.getElementById(`modal-price`).textContent=`Rp ${o.toLocaleString(`id-ID`)}`,document.getElementById(`customization-modal`).classList.add(`active`),document.getElementById(`modal-overlay`).classList.add(`active`)},window.quickDecrement=function(e){let n=-1;for(let r=t.length-1;r>=0;r--)if(t[r].id===e){n=r;break}n!==-1&&(t[n].qty--,t[n].qty<=0&&t.splice(n,1),l(),u(),r())},window.updateModalQuantity=function(e){let t=document.getElementById(`modal-quantity-val`),n=document.getElementById(`modal-quantity-display`),r=document.getElementById(`modal-price`),i=(parseInt(t.value)||1)+e;i<1&&(i=1),t.value=i,n.textContent=i,r.textContent=`Rp ${((parseInt(r.dataset.basePrice)||0)*i).toLocaleString(`id-ID`)}`};function s(){let n=document.getElementById(`customization-modal`),i=document.getElementById(`modal-overlay`),a=()=>{n.classList.remove(`active`),i.classList.remove(`active`)};document.getElementById(`close-modal`).addEventListener(`click`,a),i.addEventListener(`click`,a),document.getElementById(`customization-form`).addEventListener(`submit`,n=>{n.preventDefault();let i=document.getElementById(`modal-item-id`).value,o=document.getElementById(`modal-cart-index`).value,s=e.getMenu().find(e=>e.id===i),d=new FormData(n.target),f=d.get(`sugar`),p=d.get(`note`),m=parseInt(d.get(`quantity`))||1,h={...s,sugar:f,note:p,qty:m};if(o!==``){let e=parseInt(o);h.cartId=t[e].cartId,t[e]=h,l(),u(),r()}else h.cartId=Date.now().toString(),c(h);a()})}function c(e){t.push(e),l(),r()}function l(){let e=document.getElementById(`floating-cart-bar`),n=document.getElementById(`view-cart`).classList.contains(`active`);if(t.length>0&&!n){let n=t.reduce((e,t)=>e+t.price*t.qty,0);document.getElementById(`cart-count`).textContent=`${t.length} ITEM`,document.getElementById(`cart-total`).textContent=`Rp ${n.toLocaleString(`id-ID`)}`,e.style.display=`flex`}else e.style.display=`none`}function u(){let e=document.getElementById(`cart-items-container`),n=document.getElementById(`btn-checkout`);if(t.length===0){e.innerHTML=`<p class="text-center" style="padding: 32px 0;">Keranjang kosong.</p>`,n.disabled=!0,document.getElementById(`cart-page-total`).textContent=`Rp 0`;return}n.disabled=!1;let r=0;e.innerHTML=``,t.forEach((t,n)=>{r+=t.price*t.qty;let i=document.createElement(`div`);i.className=`cart-item`,i.innerHTML=`
      <img src="${t.image}" class="cart-item-img" alt="${t.name}">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${t.name}</h4>
        <p class="menu-desc" style="margin-bottom: 2px;">${t.sugar?`Gula: ${t.sugar}`:``}</p>
        <p class="menu-desc" style="margin-bottom: 2px;">${t.note?`Catatan: ${t.note}`:``}</p>
        <p class="cart-item-price">Rp ${t.price.toLocaleString(`id-ID`)}</p>
      </div>
      <div class="cart-item-actions">
        <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-variant); color: var(--color-primary);" onclick="openEditModal(${n})">
          <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
        </button>
        <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-variant); color: var(--color-error);" onclick="removeFromCart(${n})">
          <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
        </button>
      </div>
    `,e.appendChild(i)}),document.getElementById(`cart-page-total`).textContent=`Rp ${r.toLocaleString(`id-ID`)}`}window.removeFromCart=function(e){t.splice(e,1),l(),u(),r()},window.processCheckout=function(){let i=document.getElementById(`customer-name`).value;if(!i){alert(`Silakan masukkan nama Anda.`);return}if(t.length===0)return;let a=t.reduce((e,t)=>e+t.price*t.qty,0),o=e.addOrder({customerName:i,items:[...t],total:a,table:`12`});n.push(o.id),t=[],l(),r(),alert(`Pembayaran Berhasil! Pesanan sedang diproses.`),document.querySelector(`.nav-item[href="#view-tracker"]`).click(),d()};function d(){let t=document.getElementById(`tracker-empty-state`),r=document.getElementById(`tracker-active-state`);if(n.length===0){t&&(t.style.display=`flex`),r&&(r.style.display=`none`);return}t&&(t.style.display=`none`),r&&(r.style.display=`block`);let i=e.getOrders(),a=n.map(e=>i.find(t=>t.id===e)).filter(Boolean).reverse();r.innerHTML=``;let o={Diterima:1,Dimasak:2,Siap:3};a.forEach(e=>{let t=o[e.status]||1,n=document.createElement(`div`);n.style.marginBottom=`32px`,n.style.padding=`24px`,n.style.backgroundColor=`var(--color-surface-lowest)`,n.style.borderRadius=`var(--radius-lg)`,n.style.boxShadow=`var(--shadow-sm)`;let i=e.items.map(e=>`
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <div style="flex: 1; padding-right: 16px;">
          <span style="font-weight: 600;">${e.qty}x ${e.name}</span>
          ${e.sugar?`<div style="color: var(--color-text-muted); font-size: 12px; margin-top: 2px;">Gula: ${e.sugar}</div>`:``}
          ${e.note?`<div style="color: var(--color-text-muted); font-size: 12px; margin-top: 2px;">Catatan: ${e.note}</div>`:``}
        </div>
        <div style="font-weight: 500;">Rp ${(e.price*e.qty).toLocaleString(`id-ID`)}</div>
      </div>
    `).join(``);n.innerHTML=`
      <div style="text-align: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--color-surface-variant);">
        <h2 style="font-size: 18px; margin-bottom: 4px;">Order ID: ${e.id}</h2>
        <p class="text-label" style="color: var(--color-text-muted);">${e.items.length} ITEM • Rp ${e.total.toLocaleString(`id-ID`)}</p>
        <p style="font-size: 14px; margin-top: 8px; font-weight: 500;">Atas Nama: <span style="color: var(--color-primary);">${e.customerName}</span></p>
      </div>

      <div style="margin-bottom: 24px; background: var(--color-surface-container); padding: 16px; border-radius: var(--radius-md);">
        ${i}
      </div>

      <div class="stepper">
        <div class="step ${t>=1?t===1?`active`:`completed`:``}">
          <div class="step-icon"><span class="material-symbols-outlined">receipt_long</span></div>
          <div class="step-content">
            <h3>Diterima</h3>
            <p>Pesanan Anda telah diterima.</p>
          </div>
        </div>
        <div class="step ${t>=2?t===2?`active`:`completed`:``}">
          <div class="step-icon"><span class="material-symbols-outlined">soup_kitchen</span></div>
          <div class="step-content">
            <h3>Sedang Dimasak</h3>
            <p>Pesanan sedang disiapkan koki.</p>
          </div>
        </div>
        <div class="step ${t>=3?t===3?`active`:`completed`:``}">
          <div class="step-icon"><span class="material-symbols-outlined">room_service</span></div>
          <div class="step-content">
            <h3>Siap Diantar</h3>
            <p>Akan segera diantar ke meja.</p>
          </div>
        </div>
      </div>
    `,r.appendChild(n)})}