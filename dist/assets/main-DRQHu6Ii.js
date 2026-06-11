import{n as e,r as t,t as n}from"./store-D5WFV2-G.js";/* empty css                      */t((()=>{e();var t=[],r=[];function i(e=`Memproses...`){let t=document.getElementById(`global-loader`);t||(t=document.createElement(`div`),t.id=`global-loader`,t.innerHTML=`
      <div style="background: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; color: white; flex-direction: column;">
        <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--color-accent); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <div style="margin-top: 16px; font-weight: 600;" id="loader-msg"></div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      </div>
    `,document.body.appendChild(t)),document.getElementById(`loader-msg`).textContent=e,t.style.display=`flex`}function a(){let e=document.getElementById(`global-loader`);e&&(e.style.display=`none`)}async function o(){let e=await n.getCmsSettings();if(document.documentElement.style.setProperty(`--color-accent`,e.themeColor),document.documentElement.style.setProperty(`--color-accent-light`,e.themeColor+`15`),document.documentElement.style.setProperty(`--shadow-accent`,`0 8px 30px ${e.themeColor}4D`),document.documentElement.style.setProperty(`--font-heading`,e.fontFamily),e.fontFamily.includes(`Lora`)||e.fontFamily.includes(`Montserrat`)||e.fontFamily.includes(`Poppins`)||e.fontFamily.includes(`Oswald`)){let t=e.fontFamily.split(`,`)[0].replace(/'/g,``).trim(),n=document.createElement(`link`);n.href=`https://fonts.googleapis.com/css2?family=${t.replace(/ /g,`+`)}:wght@400;600;700&display=swap`,n.rel=`stylesheet`,document.head.appendChild(n)}let t=document.getElementById(`cms-hero-img`),r=document.getElementById(`cms-hero-title`),i=document.getElementById(`cms-hero-subtitle`);t&&e.heroImage&&(t.src=e.heroImage),r&&e.heroTitle&&(r.textContent=e.heroTitle),i&&e.heroSubtitle&&(i.textContent=e.heroSubtitle)}document.addEventListener(`DOMContentLoaded`,async()=>{await o(),s(),l(),f(),m(),g(),window.addEventListener(`scroll`,()=>{if(c!==void 0&&c)return;let e=Array.from(document.querySelectorAll(`.category-section`)),t=document.querySelectorAll(`.category-tab`),n=document.getElementById(`category-indicator`);if(e.length===0||t.length===0)return;let r=null;for(let t=e.length-1;t>=0;t--)if(e[t].getBoundingClientRect().top<=350){r=e[t];break}if(r||=e[0],r){let e=r.querySelector(`.category-heading`);if(!e)return;let i=e.textContent.trim();t.forEach(e=>{if(e.textContent.trim()===i&&!e.classList.contains(`active`)&&(t.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),n)){n.style.width=e.offsetWidth+`px`,n.style.left=e.offsetLeft+`px`;let t=e.closest(`.category-list`);if(t){let n=e.offsetLeft-t.clientWidth/2+e.clientWidth/2;t.scrollTo({left:n,behavior:`smooth`})}}})}},{passive:!0}),n.subscribe(()=>{s(),r.length>0&&g()})});async function s(){i(`Memuat menu...`);let e=document.getElementById(`menu-container`),r=document.querySelector(`.category-list`),o=await n.getMenu();e.innerHTML=``;let s=await n.getCategories();a();let c=s.filter(e=>o.some(t=>t.category.toUpperCase()===e.toUpperCase()));if(r){let e=r.querySelector(`.category-tab.active`),t=e?e.textContent.trim():null,n=document.getElementById(`category-indicator`);n||(n=document.createElement(`div`),n.className=`tab-indicator`,n.id=`category-indicator`),r.innerHTML=``,c.forEach((e,n)=>{let i=document.createElement(`li`);i.className=`category-tab`,(t?e.toUpperCase()===t.toUpperCase():n===0)&&i.classList.add(`active`),i.textContent=e,r.appendChild(i)}),r.appendChild(n),u()}c.forEach(n=>{let r=o.filter(e=>e.category.toUpperCase()===n.toUpperCase());if(r.length>0){let i=document.createElement(`div`);i.className=`category-section`,i.id=`cat-`+n.replace(/\s+/g,`-`);let a=document.createElement(`h2`);a.className=`category-heading`,a.textContent=n,i.appendChild(a);let o=document.createElement(`div`);o.className=`menu-grid`,r.forEach(e=>{let n=document.createElement(`article`);n.className=`menu-card ${e.available?``:`disabled`}`;let r=t.filter(t=>t.id===e.id).reduce((e,t)=>e+t.qty,0),i=``;e.available&&(i=r>0?`
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
    `,o.appendChild(n)}),i.appendChild(o),e.appendChild(i)}})}var c=!1;function l(){let e=document.querySelectorAll(`.nav-item`),t=document.querySelectorAll(`.view-section`);e.forEach(n=>{n.addEventListener(`click`,r=>{r.preventDefault();let i=n.getAttribute(`href`).substring(1);e.forEach(e=>e.classList.remove(`active`)),n.classList.add(`active`),t.forEach(e=>{e.id===i?e.classList.add(`active`):e.classList.remove(`active`)}),m(),i===`view-cart`&&h()})}),document.getElementById(`floating-cart-bar`).addEventListener(`click`,()=>{document.querySelector(`.nav-item[href="#view-cart"]`).click()})}function u(){let e=document.querySelectorAll(`.category-tab`),t=document.getElementById(`category-indicator`);function n(e){!t||!e||(t.style.width=e.offsetWidth+`px`,t.style.left=e.offsetLeft+`px`)}let r=document.querySelector(`.category-tab.active`);r&&setTimeout(()=>n(r),100),e.forEach(t=>{t.addEventListener(`click`,()=>{c=!0,setTimeout(()=>{c=!1},800);let r=t.textContent.trim();if(r===`SEMUA`)window.scrollTo({top:0,behavior:`smooth`});else{let e=`cat-`+r.replace(/\s+/g,`-`),t=document.getElementById(e);t&&t.scrollIntoView({behavior:`smooth`})}e.forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),n(t);let i=t.closest(`.category-list`);if(i){let e=t.offsetLeft-i.clientWidth/2+t.clientWidth/2;i.scrollTo({left:e,behavior:`smooth`})}})})}window.recalculateModalPrice=function(){let e=document.getElementById(`modal-price`),t=parseInt(e.dataset.basePrice)||0,n=parseInt(document.getElementById(`modal-quantity-val`).value)||1,r=0;document.querySelectorAll(`.modifier-input:checked`).forEach(e=>{r+=parseInt(e.dataset.price)||0}),e.textContent=`Rp ${((t+r)*n).toLocaleString(`id-ID`)}`};function d(e,t=null){let n=document.getElementById(`dynamic-modifiers-container`);if(!n||(n.innerHTML=``,!e.modifierGroups||e.modifierGroups.length===0))return;let r=t&&t.selectedModifiers||[];e.modifierGroups.forEach((e,i)=>{let a=e.type===`single`,o=a?`radio`:`checkbox`,s=`mod_${i}`,c=r.find(t=>t.groupName===e.name),l=c?c.selected.map(e=>e.name):[],u=e.options.map((n,r)=>{let i=l.includes(n.name)||a&&r===0&&!t,c=n.priceAdd>0?` (+Rp ${n.priceAdd.toLocaleString(`id-ID`)})`:``;return`
        <label class="${a?`radio-item`:`checkbox-item`}">
          <span>${n.name}${c}</span>
          <input type="${o}" name="${s}" value="${n.name}" data-price="${n.priceAdd}" class="modifier-input" data-group="${e.name}" ${i?`checked`:``} onchange="recalculateModalPrice()">
        </label>
      `}).join(``),d=`
      <div class="form-group">
        <label class="form-label">${e.name} ${e.required&&a?`<span style="color: var(--color-error);">*</span>`:``}</label>
        <div class="${a?`radio-group`:`checkbox-group`}">
          ${u}
        </div>
      </div>
    `;n.insertAdjacentHTML(`beforeend`,d)})}window.openCustomizationModal=async function(e){i(`Memuat menu...`);let t=await n.getMenu();a();let r=t.find(t=>t.id===e);r&&(document.getElementById(`modal-item-id`).value=r.id,document.getElementById(`modal-cart-index`).value=``,document.getElementById(`modal-title`).textContent=r.name,document.getElementById(`modal-desc`).textContent=r.desc,document.getElementById(`modal-img`).src=r.image,document.getElementById(`modal-price`).dataset.basePrice=r.price,d(r),document.getElementById(`customization-form`).reset(),document.getElementById(`modal-quantity-val`).value=1,document.getElementById(`modal-quantity-display`).textContent=`1`,recalculateModalPrice(),document.getElementById(`customization-modal`).classList.add(`active`),document.getElementById(`modal-overlay`).classList.add(`active`))},window.openEditModal=async function(e){let r=t[e];if(!r)return;i(`Memuat...`);let o=await n.getMenu();a();let s=o.find(e=>e.id===r.id);if(!s)return;document.getElementById(`modal-item-id`).value=r.id,document.getElementById(`modal-cart-index`).value=e,document.getElementById(`modal-title`).textContent=r.name,document.getElementById(`modal-desc`).textContent=s.desc,document.getElementById(`modal-img`).src=r.image,document.getElementById(`modal-price`).dataset.basePrice=r.price,document.getElementById(`customization-form`).reset(),d(s,r);let c=document.querySelector(`textarea[name="note"]`);c&&r.note&&(c.value=r.note),document.getElementById(`modal-quantity-val`).value=r.qty,document.getElementById(`modal-quantity-display`).textContent=r.qty,recalculateModalPrice(),document.getElementById(`customization-modal`).classList.add(`active`),document.getElementById(`modal-overlay`).classList.add(`active`)},window.quickDecrement=function(e){let n=-1;for(let r=t.length-1;r>=0;r--)if(t[r].id===e){n=r;break}n!==-1&&(t[n].qty--,t[n].qty<=0&&t.splice(n,1),m(),h(),s())},window.updateModalQuantity=function(e){let t=document.getElementById(`modal-quantity-val`),n=document.getElementById(`modal-quantity-display`);document.getElementById(`modal-price`);let r=(parseInt(t.value)||1)+e;r<1&&(r=1),t.value=r,n.textContent=r,recalculateModalPrice()};function f(){let e=document.getElementById(`customization-modal`),r=document.getElementById(`modal-overlay`),o=()=>{e.classList.remove(`active`),r.classList.remove(`active`)};document.getElementById(`close-modal`).addEventListener(`click`,o),r.addEventListener(`click`,o),document.getElementById(`customization-form`).addEventListener(`submit`,async e=>{e.preventDefault(),i(`Menyiapkan...`);let r=await n.getMenu();a();let c=document.getElementById(`modal-item-id`).value,l=document.getElementById(`modal-cart-index`).value,u=r.find(e=>e.id===c),d=new FormData(e.target),f=d.get(`note`),g=parseInt(d.get(`quantity`))||1,_=[],v=0;u.modifierGroups&&u.modifierGroups.forEach((e,t)=>{let n=document.querySelectorAll(`input[name="mod_${t}"]:checked`);if(n.length>0){let t=Array.from(n).map(e=>{let t=parseInt(e.dataset.price)||0;return v+=t,{name:e.value,priceAdd:t}});_.push({groupName:e.name,selected:t})}});let y={...u,note:f,qty:g,selectedModifiers:_,modifierTotal:v};if(l!==``){let e=parseInt(l);y.cartId=t[e].cartId,t[e]=y,m(),h(),s()}else y.cartId=Date.now().toString(),p(y);o()})}function p(e){t.push(e),m(),s()}function m(){let e=document.getElementById(`floating-cart-bar`),n=document.getElementById(`view-cart`).classList.contains(`active`);if(t.length>0&&!n){let n=t.reduce((e,t)=>e+(t.price+(t.modifierTotal||0))*t.qty,0);document.getElementById(`cart-count`).textContent=`${t.length} ITEM`,document.getElementById(`cart-total`).textContent=`Rp ${n.toLocaleString(`id-ID`)}`,e.style.display=`flex`}else e.style.display=`none`}function h(){let e=document.getElementById(`cart-items-container`),n=document.getElementById(`btn-checkout`);if(t.length===0){e.innerHTML=`<p class="text-center" style="padding: 32px 0;">Keranjang kosong.</p>`,n.disabled=!0,document.getElementById(`cart-page-total`).textContent=`Rp 0`;return}n.disabled=!1;let r=0;e.innerHTML=``,t.forEach((t,n)=>{let i=t.price+(t.modifierTotal||0);r+=i*t.qty;let a=``;t.sugar&&t.sugar!==`Normal`&&(a+=`<p class="menu-desc" style="margin-bottom: 2px;">Gula: ${t.sugar}</p>`),t.selectedModifiers&&t.selectedModifiers.length>0&&t.selectedModifiers.forEach(e=>{let t=e.selected.map(e=>e.name).join(`, `);a+=`<p class="menu-desc" style="margin-bottom: 2px;">${e.groupName}: ${t}</p>`});let o=document.createElement(`div`);o.className=`cart-item`,o.innerHTML=`
      <img src="${t.image}" class="cart-item-img" alt="${t.name}">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${t.name}</h4>
        ${a}
        <p class="menu-desc" style="margin-bottom: 2px;">${t.note?`Catatan: ${t.note}`:``}</p>
        <p class="cart-item-price">Rp ${i.toLocaleString(`id-ID`)}</p>
      </div>
      <div class="cart-item-actions">
        <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-variant); color: var(--color-primary);" onclick="openEditModal(${n})">
          <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
        </button>
        <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-variant); color: var(--color-error);" onclick="removeFromCart(${n})">
          <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
        </button>
      </div>
    `,e.appendChild(o)}),document.getElementById(`cart-page-total`).textContent=`Rp ${r.toLocaleString(`id-ID`)}`}window.removeFromCart=function(e){t.splice(e,1),m(),h(),s()},window.processCheckout=async function(){let e=document.getElementById(`customer-name`).value;if(!e){alert(`Silakan masukkan nama Anda.`);return}if(t.length===0)return;i(`Memproses pesanan Anda...`);let o=t.reduce((e,t)=>e+(t.price+(t.modifierTotal||0))*t.qty,0),c=await n.addOrder({customerName:e,items:[...t],total:o,table:`12`});a(),r.push(c.id),t=[],m(),s(),alert(`Pembayaran Berhasil! Pesanan sedang diproses.`),document.querySelector(`.nav-item[href="#view-tracker"]`).click(),g()};async function g(){let e=document.getElementById(`tracker-empty-state`),t=document.getElementById(`tracker-active-state`);if(r.length===0){e&&(e.style.display=`flex`),t&&(t.style.display=`none`);return}e&&(e.style.display=`none`),t&&(t.style.display=`block`);let i=await n.getOrders(),a=r.map(e=>i.find(t=>t.id===e)).filter(Boolean).reverse();t.innerHTML=``;let o={Diterima:1,Dimasak:2,Siap:3};a.forEach(e=>{let n=o[e.status]||1,r=document.createElement(`div`);r.style.marginBottom=`32px`,r.style.padding=`24px`,r.style.backgroundColor=`var(--color-surface-lowest)`,r.style.borderRadius=`var(--radius-lg)`,r.style.boxShadow=`var(--shadow-sm)`;let i=e.items.map(e=>{let t=``;e.sugar&&e.sugar!==`Normal`&&(t+=`<div style="color: var(--color-text-muted); font-size: 12px; margin-top: 2px;">Gula: ${e.sugar}</div>`),e.selectedModifiers&&e.selectedModifiers.length>0&&e.selectedModifiers.forEach(e=>{let n=e.selected.map(e=>e.name).join(`, `);t+=`<div style="color: var(--color-text-muted); font-size: 12px; margin-top: 2px;">${e.groupName}: ${n}</div>`});let n=e.price+(e.modifierTotal||0);return`
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <div style="flex: 1; padding-right: 16px;">
          <span style="font-weight: 600;">${e.qty}x ${e.name}</span>
          ${t}
          ${e.note?`<div style="color: var(--color-text-muted); font-size: 12px; margin-top: 2px;">Catatan: ${e.note}</div>`:``}
        </div>
        <div style="font-weight: 500;">Rp ${(n*e.qty).toLocaleString(`id-ID`)}</div>
      </div>
    `}).join(``);r.innerHTML=`
      <div style="text-align: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--color-surface-variant);">
        <h2 style="font-size: 18px; margin-bottom: 4px;">Order ID: ${e.id}</h2>
        <p class="text-label" style="color: var(--color-text-muted);">${e.items.length} ITEM • Rp ${e.total.toLocaleString(`id-ID`)}</p>
        <p style="font-size: 14px; margin-top: 8px; font-weight: 500;">Atas Nama: <span style="color: var(--color-primary);">${e.customerName}</span></p>
      </div>

      <div style="margin-bottom: 24px; background: var(--color-surface-container); padding: 16px; border-radius: var(--radius-md);">
        ${i}
      </div>

      <div class="stepper">
        <div class="step ${n>=1?n===1?`active`:`completed`:``}">
          <div class="step-icon"><span class="material-symbols-outlined">receipt_long</span></div>
          <div class="step-content">
            <h3>Diterima</h3>
            <p>Pesanan Anda telah diterima.</p>
          </div>
        </div>
        <div class="step ${n>=2?n===2?`active`:`completed`:``}">
          <div class="step-icon"><span class="material-symbols-outlined">soup_kitchen</span></div>
          <div class="step-content">
            <h3>Sedang Dimasak</h3>
            <p>Pesanan sedang disiapkan koki.</p>
          </div>
        </div>
        <div class="step ${n>=3?n===3?`active`:`completed`:``}">
          <div class="step-icon"><span class="material-symbols-outlined">room_service</span></div>
          <div class="step-content">
            <h3>Siap Diantar</h3>
            <p>Akan segera diantar ke meja.</p>
          </div>
        </div>
      </div>
    `,t.appendChild(r)})}}))();