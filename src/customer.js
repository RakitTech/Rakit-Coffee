import { Store } from './store.js';

let cart = [];
let myOrderIds = [];
let currentModalMaxQty = Infinity;
let renderCount = 0;

function showLoading(msg = 'Memproses...') {
  let loader = document.getElementById('global-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `
      <div style="background: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; color: white; flex-direction: column;">
        <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--color-accent); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <div style="margin-top: 16px; font-weight: 600;" id="loader-msg"></div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      </div>
    `;
    document.body.appendChild(loader);
  }
  document.getElementById('loader-msg').textContent = msg;
  loader.style.display = 'flex';
}

function hideLoading() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.style.display = 'none';
}

async function applyCmsSettings() {
  const settings = await Store.applyGlobalTheme();


  // Apply Hero Elements
  const heroImg = document.getElementById('cms-hero-img');
  const heroTitle = document.getElementById('cms-hero-title');
  const heroSubtitle = document.getElementById('cms-hero-subtitle');

  if (heroImg && settings.heroImage) heroImg.src = settings.heroImage;
  if (heroTitle && settings.heroTitle) {
    heroTitle.textContent = settings.heroTitle;
    if (settings.heroTitleColor) heroTitle.style.color = settings.heroTitleColor;
    if (settings.heroTitleFont) heroTitle.style.fontFamily = settings.heroTitleFont;
    else heroTitle.style.fontFamily = 'var(--font-heading)';
  }
  if (heroSubtitle && settings.heroSubtitle) {
    heroSubtitle.textContent = settings.heroSubtitle;
    if (settings.heroSubtitleColor) heroSubtitle.style.color = settings.heroSubtitleColor;
    if (settings.heroSubtitleFont) heroSubtitle.style.fontFamily = settings.heroSubtitleFont;
    else heroSubtitle.style.fontFamily = 'var(--font-body)';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await applyCmsSettings();
  renderMenu();
  setupNavigation();
  setupModal();
  updateCartUI();
  updateTrackerStatus();

  // Membaca nomor meja dinamis dari URL query (?table=X atau ?meja=X)
  const urlParams = new URLSearchParams(window.location.search);
  const tableNum = urlParams.get('table') || urlParams.get('meja') || '12';
  const tableBadge = document.querySelector('.table-badge .text-label');
  if (tableBadge) {
    tableBadge.textContent = `MEJA ${tableNum}`;
  }

  // Scroll Spy for Category Tabs
  window.addEventListener('scroll', () => {
    if (typeof isClickScrolling !== 'undefined' && isClickScrolling) return;

    const sections = Array.from(document.querySelectorAll('.category-section'));
    const tabs = document.querySelectorAll('.category-tab');
    const indicator = document.getElementById('category-indicator');
    
    if (sections.length === 0 || tabs.length === 0) return;

    let currentActive = null;
    for (let i = sections.length - 1; i >= 0; i--) {
      const rect = sections[i].getBoundingClientRect();
      if (rect.top <= 350) {
        currentActive = sections[i];
        break;
      }
    }
    
    if (!currentActive) {
      currentActive = sections[0];
    }

    if (currentActive) {
      const heading = currentActive.querySelector('.category-heading');
      if (!heading) return;
      const catName = heading.textContent.trim();
      tabs.forEach(tab => {
        if (tab.textContent.trim() === catName && !tab.classList.contains('active')) {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          if (indicator) {
            indicator.style.width = tab.offsetWidth + 'px';
            indicator.style.left = tab.offsetLeft + 'px';
            
            // Auto scroll the category-list horizontally without interrupting window scroll
            const list = tab.closest('.category-list');
            if (list) {
              const scrollLeft = tab.offsetLeft - (list.clientWidth / 2) + (tab.clientWidth / 2);
              list.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
          }
        }
      });
    }
  }, { passive: true });

  // Listen for changes from Admin/Kitchen
  Store.subscribe(() => {
    renderMenu();
    if (myOrderIds.length > 0) {
      updateTrackerStatus();
    }
  });
});

async function renderMenu() {
  renderCount++;
  const currentRender = renderCount;
  showLoading('Memuat menu...');
  const menuContainer = document.getElementById('menu-container');
  const categoryList = document.querySelector('.category-list');
  const menus = await Store.getMenu();
  
  if (currentRender !== renderCount) return;
  
  menuContainer.innerHTML = '';

  // Get ordered categories from Store, filter and deduplicate them case-insensitively
  const storeCategories = await Store.getCategories();
  hideLoading();
  
  const seenCategories = new Set();
  const categories = [];
  storeCategories.forEach(cat => {
    const upper = cat.toUpperCase();
    if (!seenCategories.has(upper) && menus.some(m => m.category.toUpperCase() === upper)) {
      seenCategories.add(upper);
      categories.push(cat);
    }
  });

  // Render Category Tabs dynamically
  if (categoryList) {
    const activeTabEl = categoryList.querySelector('.category-tab.active');
    const activeCatName = activeTabEl ? activeTabEl.textContent.trim() : null;
    
    let indicator = document.getElementById('category-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'tab-indicator';
      indicator.id = 'category-indicator';
    }
    
    categoryList.innerHTML = '';
    
    categories.forEach((cat, idx) => {
      const li = document.createElement('li');
      li.className = 'category-tab';
      const isCurrentActive = activeCatName ? (cat.toUpperCase() === activeCatName.toUpperCase()) : (idx === 0);
      if (isCurrentActive) li.classList.add('active');
      li.textContent = cat;
      categoryList.appendChild(li);
    });
    
    categoryList.appendChild(indicator);
    setupCategoryFilter();
  }

  categories.forEach(category => {
    const categoryItems = menus.filter(m => m.category.toUpperCase() === category.toUpperCase());
    
    if (categoryItems.length > 0) {
      const section = document.createElement('div');
      section.className = 'category-section';
      section.id = 'cat-' + category.replace(/\s+/g, '-');

      const heading = document.createElement('h2');
      heading.className = 'category-heading';
      heading.textContent = category;
      section.appendChild(heading);

      const grid = document.createElement('div');
      grid.className = 'menu-grid';

      categoryItems.forEach(item => {
    const card = document.createElement('article');
    card.className = `menu-card ${!item.available ? 'disabled' : ''}`;
    
    const totalQty = cart.filter(c => c.id === item.id).reduce((sum, c) => sum + c.qty, 0);

    let actionHtml = '';
    if (item.available) {
      if (totalQty > 0) {
        const isLimit = item.remainingStock !== null && totalQty >= item.remainingStock;
        actionHtml = `
          <div style="display: flex; align-items: center; gap: 8px; background: var(--color-surface-container); padding: 4px; border-radius: 20px;">
            <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-lowest); color: var(--color-primary);" onclick="quickDecrement('${item.id}')">
              <span class="material-symbols-outlined" style="font-size: 16px;">remove</span>
            </button>
            <span style="font-weight: bold; font-size: 14px; min-width: 16px; text-align: center;">${totalQty}</span>
            <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-lowest); color: var(--color-primary); ${isLimit ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${isLimit ? 'disabled' : ''} onclick="openCustomizationModal('${item.id}')">
              <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
            </button>
          </div>
        `;
      } else {
        const isLimit = item.remainingStock !== null && item.remainingStock <= 0;
        if (isLimit) {
          actionHtml = `<span style="font-size: 12px; color: var(--color-error); font-weight: bold; padding: 4px 8px;">Habis</span>`;
        } else {
          actionHtml = `
            <button class="btn-icon" onclick="openCustomizationModal('${item.id}')">
              <span class="material-symbols-outlined">add</span>
            </button>
          `;
        }
      }
    }

    card.innerHTML = `
      <div class="menu-img-container">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="menu-info">
        <div>
          <h3 class="menu-title">${item.name}</h3>
          <p class="menu-desc line-clamp-2">${item.desc}</p>
        </div>
        <div class="menu-footer">
          <span class="menu-price">Rp ${item.price.toLocaleString('id-ID')}</span>
          ${actionHtml}
        </div>
      </div>
    `;
        grid.appendChild(card);
      });
      section.appendChild(grid);
      menuContainer.appendChild(section);
    }
  });
}

let isClickScrolling = false;

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href').substring(1);
      
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      views.forEach(view => {
        if (view.id === targetId) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
      
      updateCartUI();
      
      if (targetId === 'view-cart') {
        renderCartPage();
      }
    });
  });
  
    // Floating Cart Bar Click
  document.getElementById('floating-cart-bar').addEventListener('click', () => {
    document.querySelector('.nav-item[href="#view-cart"]').click();
  });
}

function setupCategoryFilter() {
  const tabs = document.querySelectorAll('.category-tab');
  const indicator = document.getElementById('category-indicator');

  function updateIndicator(activeTab) {
    if (!indicator || !activeTab) return;
    indicator.style.width = activeTab.offsetWidth + 'px';
    indicator.style.left = activeTab.offsetLeft + 'px';
  }

  // Set initial position
  const initialActive = document.querySelector('.category-tab.active');
  if (initialActive) {
    // Need a slight delay to ensure fonts/layout are rendered for correct offsetWidth
    setTimeout(() => updateIndicator(initialActive), 100);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      isClickScrolling = true;
      setTimeout(() => { isClickScrolling = false; }, 800); // Wait for smooth scroll to finish

      const catName = tab.textContent.trim();
      
      if (catName === 'SEMUA') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetId = 'cat-' + catName.replace(/\s+/g, '-');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
      
      // Update active styling
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateIndicator(tab);
      
      // Also scroll the nav list horizontally to center the active tab
      const list = tab.closest('.category-list');
      if (list) {
        const scrollLeft = tab.offsetLeft - (list.clientWidth / 2) + (tab.clientWidth / 2);
        list.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    });
  });
}

window.recalculateModalPrice = function() {
  const priceEl = document.getElementById('modal-price');
  const basePrice = parseInt(priceEl.dataset.basePrice) || 0;
  const qty = parseInt(document.getElementById('modal-quantity-val').value) || 1;
  
  let modifierTotal = 0;
  document.querySelectorAll('.modifier-input:checked').forEach(input => {
    modifierTotal += parseInt(input.dataset.price) || 0;
  });

  const finalPrice = (basePrice + modifierTotal) * qty;
  priceEl.textContent = `Rp ${finalPrice.toLocaleString('id-ID')}`;
};

function renderDynamicModifiers(menuItem, cartItem = null) {
  const container = document.getElementById('dynamic-modifiers-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!menuItem.modifierGroups || menuItem.modifierGroups.length === 0) return;

  const previousSelections = cartItem ? (cartItem.selectedModifiers || []) : [];

  menuItem.modifierGroups.forEach((group, groupIdx) => {
    const isSingle = group.type === 'single';
    const inputType = isSingle ? 'radio' : 'checkbox';
    const nameAttr = `mod_${groupIdx}`;
    
    // Find previous selection for this group
    const prevGroup = previousSelections.find(g => g.groupName === group.name);
    const prevSelectedNames = prevGroup ? prevGroup.selected.map(s => s.name) : [];

    const optionsHtml = group.options.map((opt, optIdx) => {
      // opt.available bernilai false jika stok modifier bersangkutan habis (dihitung oleh backend)
      const isOutOfStock = opt.available === false;
      const isChecked = !isOutOfStock && (prevSelectedNames.includes(opt.name) || (isSingle && optIdx === 0 && !cartItem));
      const priceText = opt.priceAdd > 0 ? ` (+Rp ${opt.priceAdd.toLocaleString('id-ID')})` : '';
      const stockText = isOutOfStock ? ' <span style="color: var(--color-error); font-size: 12px; font-weight: bold;">(Habis)</span>' : '';
      
      return `
        <label class="${isSingle ? 'radio-item' : 'checkbox-item'} ${isOutOfStock ? 'disabled-option' : ''}" style="${isOutOfStock ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
          <span>${opt.name}${priceText}${stockText}</span>
          <input type="${inputType}" name="${nameAttr}" value="${opt.name}" data-price="${opt.priceAdd}" data-stock-id="${opt.stockItemId || ''}" data-stock-qty="${opt.stockQty || 0}" class="modifier-input" data-group="${group.name}" ${isChecked ? 'checked' : ''} ${isOutOfStock ? 'disabled' : ''} onchange="recalculateModalPrice()">
        </label>
      `;
    }).join('');

    const groupHtml = `
      <div class="form-group">
        <label class="form-label">${group.name} ${group.required && isSingle ? '<span style="color: var(--color-error);">*</span>' : ''}</label>
        <div class="${isSingle ? 'radio-group' : 'checkbox-group'}">
          ${optionsHtml}
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', groupHtml);
  });
}

window.openCustomizationModal = async function(itemId) {
  showLoading('Memuat menu...');
  const menus = await Store.getMenu();
  hideLoading();
  const item = menus.find(m => m.id === itemId);
  if (!item) return;

  const totalInCart = cart
    .filter(c => c.id === item.id)
    .reduce((sum, c) => sum + c.qty, 0);

  if (item.remainingStock !== null && totalInCart >= item.remainingStock) {
    alert(`Stok tidak mencukupi. Semua stok tersedia (${item.remainingStock}) sudah dimasukkan ke keranjang.`);
    return;
  }

  currentModalMaxQty = item.remainingStock !== null ? Math.max(0, item.remainingStock - totalInCart) : Infinity;

  document.getElementById('modal-item-id').value = item.id;
  document.getElementById('modal-cart-index').value = '';
  document.getElementById('modal-title').textContent = item.name;
  document.getElementById('modal-desc').textContent = item.desc;
  document.getElementById('modal-img').src = item.image;
  
  // Reset form and quantity
  document.getElementById('customization-form').reset();
  document.getElementById('modal-quantity-val').value = 1;
  document.getElementById('modal-quantity-display').textContent = '1';

  document.getElementById('modal-price').dataset.basePrice = item.price;
  
  renderDynamicModifiers(item);
  recalculateModalPrice();
  
  // Show modal
  document.getElementById('customization-modal').classList.add('active');
  document.getElementById('modal-overlay').classList.add('active');
};

window.openEditModal = async function(cartIndex) {
  const cartItem = cart[cartIndex];
  if (!cartItem) return;

  showLoading('Memuat...');
  const menus = await Store.getMenu();
  hideLoading();
  const menuDef = menus.find(m => m.id === cartItem.id);
  if (!menuDef) return;

  const totalInCartOthers = cart
    .filter((c, idx) => c.id === menuDef.id && idx !== cartIndex)
    .reduce((sum, c) => sum + c.qty, 0);

  currentModalMaxQty = menuDef.remainingStock !== null ? Math.max(1, menuDef.remainingStock - totalInCartOthers) : Infinity;

  document.getElementById('modal-item-id').value = cartItem.id;
  document.getElementById('modal-cart-index').value = cartIndex;
  
  document.getElementById('modal-title').textContent = cartItem.name;
  document.getElementById('modal-desc').textContent = menuDef.desc;
  document.getElementById('modal-img').src = cartItem.image;
  
  document.getElementById('modal-price').dataset.basePrice = cartItem.price;
  
  // Set form values
  document.getElementById('customization-form').reset();
  
  renderDynamicModifiers(menuDef, cartItem);
  
  const noteTextarea = document.querySelector('textarea[name="note"]');
  if (noteTextarea && cartItem.note) {
    noteTextarea.value = cartItem.note;
  }

  document.getElementById('modal-quantity-val').value = cartItem.qty;
  document.getElementById('modal-quantity-display').textContent = cartItem.qty;
  
  recalculateModalPrice();
  
  // Show modal
  document.getElementById('customization-modal').classList.add('active');
  document.getElementById('modal-overlay').classList.add('active');
};

window.quickDecrement = function(itemId) {
  let targetIndex = -1;
  for (let i = cart.length - 1; i >= 0; i--) {
    if (cart[i].id === itemId) {
      targetIndex = i;
      break;
    }
  }
  
  if (targetIndex !== -1) {
    cart[targetIndex].qty--;
    if (cart[targetIndex].qty <= 0) {
      cart.splice(targetIndex, 1);
    }
    updateCartUI();
    renderCartPage();
    renderMenu();
  }
};

window.updateModalQuantity = function(change) {
  const input = document.getElementById('modal-quantity-val');
  const display = document.getElementById('modal-quantity-display');
  
  let currentVal = parseInt(input.value) || 1;
  let newVal = currentVal + change;
  if (newVal < 1) newVal = 1;
  if (newVal > currentModalMaxQty) {
    alert(`Stok terbatas. Hanya dapat memesan maksimal ${currentModalMaxQty} porsi.`);
    newVal = currentModalMaxQty;
  }
  
  input.value = newVal;
  display.textContent = newVal;
  
  recalculateModalPrice();
};

function setupModal() {
  const modal = document.getElementById('customization-modal');
  const overlay = document.getElementById('modal-overlay');
  
  const closeModal = () => {
    modal.classList.remove('active');
    overlay.classList.remove('active');
  };
  
  document.getElementById('close-modal').addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  document.getElementById('customization-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading('Menyiapkan...');
    const menus = await Store.getMenu();
    hideLoading();
    const itemId = document.getElementById('modal-item-id').value;
    const cartIndexStr = document.getElementById('modal-cart-index').value;
    const item = menus.find(m => m.id === itemId);
    
    const formData = new FormData(e.target);
    const note = formData.get('note');
    const qty = parseInt(formData.get('quantity')) || 1;
    
    // Collect dynamic modifiers
    const selectedModifiers = [];
    let modifierTotal = 0;
    
    if (item.modifierGroups) {
      item.modifierGroups.forEach((group, idx) => {
        const inputs = document.querySelectorAll(`input[name="mod_${idx}"]:checked`);
        if (inputs.length > 0) {
          const selectedOpts = Array.from(inputs).map(input => {
            const priceAdd = parseInt(input.dataset.price) || 0;
            const stockItemId = input.dataset.stockId || null;
            const stockQty = parseFloat(input.dataset.stockQty) || 0;
            modifierTotal += priceAdd;
            return { name: input.value, priceAdd: priceAdd, stockItemId, stockQty };
          });
          selectedModifiers.push({
            groupName: group.name,
            selected: selectedOpts
          });
        }
      });
    }

    const cartItemData = {
      ...item,
      note,
      qty: qty,
      selectedModifiers: selectedModifiers,
      modifierTotal: modifierTotal
    };

    if (cartIndexStr !== '') {
      const idx = parseInt(cartIndexStr);
      cartItemData.cartId = cart[idx].cartId;
      cart[idx] = cartItemData;
      updateCartUI();
      renderCartPage();
      renderMenu();
    } else {
      cartItemData.cartId = Date.now().toString();
      addToCart(cartItemData);
    }
    
    closeModal();
  });
}

function addToCart(item) {
  cart.push(item);
  updateCartUI();
  renderMenu();
}

function updateCartUI() {
  const floatingBar = document.getElementById('floating-cart-bar');
  const isCartView = document.getElementById('view-cart').classList.contains('active');
  
  if (cart.length > 0 && !isCartView) {
    const total = cart.reduce((sum, item) => sum + ((item.price + (item.modifierTotal || 0)) * item.qty), 0);
    document.getElementById('cart-count').textContent = `${cart.length} ITEM`;
    document.getElementById('cart-total').textContent = `Rp ${total.toLocaleString('id-ID')}`;
    floatingBar.style.display = 'flex';
  } else {
    floatingBar.style.display = 'none';
  }
}

function renderCartPage() {
  const cartContainer = document.getElementById('cart-items-container');
  const checkoutBtn = document.getElementById('btn-checkout');
  
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p class="text-center" style="padding: 32px 0;">Keranjang kosong.</p>';
    checkoutBtn.disabled = true;
    document.getElementById('cart-page-total').textContent = 'Rp 0';
    return;
  }
  
  checkoutBtn.disabled = false;
  let total = 0;
  cartContainer.innerHTML = '';
  
  cart.forEach((item, index) => {
    const itemFinalPrice = item.price + (item.modifierTotal || 0);
    total += itemFinalPrice * item.qty;
    
    let modsHtml = '';
    // Backward compatibility for old orders with sugar
    if (item.sugar && item.sugar !== 'Normal') {
      modsHtml += `<p class="menu-desc" style="margin-bottom: 2px;">Gula: ${item.sugar}</p>`;
    }
    // New dynamic modifiers
    if (item.selectedModifiers && item.selectedModifiers.length > 0) {
      item.selectedModifiers.forEach(modGroup => {
        const selectedNames = modGroup.selected.map(s => s.name).join(', ');
        modsHtml += `<p class="menu-desc" style="margin-bottom: 2px;">${modGroup.groupName}: ${selectedNames}</p>`;
      });
    }

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img src="${item.image}" class="cart-item-img" alt="${item.name}">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.name}</h4>
        ${modsHtml}
        <p class="menu-desc" style="margin-bottom: 2px;">${item.note ? `Catatan: ${item.note}` : ''}</p>
        <p class="cart-item-price">Rp ${itemFinalPrice.toLocaleString('id-ID')}</p>
      </div>
      <div class="cart-item-actions" style="display: flex; gap: 8px;">
        <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-variant); color: var(--color-accent);" onclick="duplicateCartItem(${index})" title="Duplikat dan Sesuaikan">
          <span class="material-symbols-outlined" style="font-size: 16px;">content_copy</span>
        </button>
        <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-variant); color: var(--color-primary);" onclick="openEditModal(${index})">
          <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
        </button>
        <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-variant); color: var(--color-error);" onclick="removeFromCart(${index})">
          <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
        </button>
      </div>
    `;
    cartContainer.appendChild(itemEl);
  });
  
  document.getElementById('cart-page-total').textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  updateCartUI();
  renderCartPage();
  renderMenu();
};

window.duplicateCartItem = function(index) {
  const item = cart[index];
  if (!item) return;
  
  // Clone item but generate a new cartId and set qty to 1
  const cloned = {
    ...item,
    cartId: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    qty: 1
  };
  
  // Insert next to original item
  cart.splice(index + 1, 0, cloned);
  updateCartUI();
  renderCartPage();
  renderMenu();
};

window.processCheckout = async function() {
  const nameInput = document.getElementById('customer-name').value;
  if (!nameInput) {
    alert('Silakan masukkan nama Anda.');
    return;
  }
  
  if (cart.length === 0) return;
  
  showLoading('Memproses pesanan Anda...');
  const total = cart.reduce((sum, item) => sum + ((item.price + (item.modifierTotal || 0)) * item.qty), 0);
  
  // Baca nomor meja dinamis
  const urlParams = new URLSearchParams(window.location.search);
  const tableNum = urlParams.get('table') || urlParams.get('meja') || '12';

  // Baca metode pembayaran terpilih
  const paymentMethodInput = document.querySelector('input[name="payment-method"]:checked');
  const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'qris';

  try {
    const order = await Store.addOrder({
      customerName: nameInput,
      items: [...cart],
      total: total,
      table: tableNum,
      paymentMethod: paymentMethod.toUpperCase(),
      paymentStatus: 'Belum Bayar'
    });
    
    hideLoading();
    showPaymentSimulationModal(order, paymentMethod);
  } catch (err) {
    hideLoading();
    alert(err.message || 'Gagal memproses pesanan. Silakan coba lagi.');
  }
};

function showPaymentSimulationModal(order, paymentMethod) {
  const modalDiv = document.createElement('div');
  modalDiv.id = 'payment-simulation-modal';
  modalDiv.style = `
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(15, 23, 42, 0.95);
    display: flex; justify-content: center; align-items: center;
    z-index: 99999; backdrop-filter: blur(12px);
    font-family: var(--font-body, 'Outfit', sans-serif);
    color: #fff; padding: var(--space-md);
  `;

  const formattedTotal = `Rp ${order.total.toLocaleString('id-ID')}`;
  
  const isManual = paymentMethod.toLowerCase() === 'manual';
  const isVa = paymentMethod.toLowerCase() === 'va';

  modalDiv.innerHTML = `
    <div style="
      background: #1e293b;
      padding: 32px;
      border-radius: 16px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
    ">
      <div style="font-size: 14px; color: var(--color-accent, #e2e8f0); font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">
        Rakit Coffee Payment
      </div>
      <h3 style="font-size: 22px; margin-bottom: 16px; font-family: var(--font-heading, sans-serif); color: #fff;">
        Selesaikan Pembayaran
      </h3>
      
      <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <span style="font-size: 12px; color: #94a3b8; display: block; margin-bottom: 4px;">TOTAL TAGIHAN</span>
        <span style="font-size: 24px; font-weight: 700; color: #f8fafc;">${formattedTotal}</span>
      </div>

      <div style="margin-bottom: 24px;">
        ${isManual ? `
          <p style="font-size: 14px; color: #94a3b8; margin-bottom: 16px; line-height: 1.5;">
            Silakan tunjukkan nomor pesanan Anda ke Kasir untuk pembayaran Tunai / Debit / QRIS Kasir:
          </p>
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; font-size: 20px; font-weight: 800; color: var(--color-accent, #AF8C53); letter-spacing: 1px; border: 1px dashed var(--color-accent, #AF8C53);">
            ${order.id}
          </div>
        ` : isVa ? `
          <p style="font-size: 14px; color: #94a3b8; margin-bottom: 16px; line-height: 1.5;">
            Salin nomor Virtual Account Mandiri / BCA berikut untuk membayar:
          </p>
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; font-size: 20px; font-weight: 800; color: var(--color-accent, #AF8C53); letter-spacing: 2px; margin-bottom: 12px;">
            88012${order.id.replace(/\D/g, '').padEnd(8, '0')}
          </div>
          <span style="font-size: 11px; color: #64748b;">(Simulasi bank transfer otomatis)</span>
        ` : `
          <p style="font-size: 14px; color: #94a3b8; margin-bottom: 16px; line-height: 1.5;">
            Pindai kode QR di bawah ini menggunakan aplikasi e-wallet Anda:
          </p>
          <!-- Mock QR Code SVG -->
          <div style="background: white; padding: 16px; display: inline-block; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 29 29" shape-rendering="crispEdges">
              <path fill="#ffffff" d="M0 0h29v29H0z"/>
              <path fill="#0f172a" d="M0 0h7v7H0zm22 0h7v7h-7zM0 22h7v7H0zm10 0h2v2h-2zm2 2h2v2h-2zm-2 2h2v3h-2zm8-18h2v2h-2zm2 2h2v2h-2zm-2 2h2v3h-2zm-8 4h2v2h-2zm2 2h2v2h-2zm-2 2h2v3h-2zm12-4h2v2h-2zm2 2h2v2h-2zm-2 2h2v3h-2zM9 1h5v1H9zm1 2h3v1h-3zm-1 2h5v1H9zm11-4h5v1h-5zm1 2h3v1h-3zm-1 2h5v1h-5zM2 9h3v1H2zm0 2h3v1H2zm0 2h3v1H2zm21-4h3v1h-3zm0 2h3v1h-3zm0 2h3v1h-3z"/>
            </svg>
          </div>
        `}
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button id="btn-simulate-pay" class="btn btn-primary" style="width: 100%; padding: 12px; font-weight: 600;">
          ${isManual ? 'Kasir Konfirmasi Lunas' : 'Simulasi Bayar Sukses'}
        </button>
        <button id="btn-cancel-pay" class="btn btn-outline" style="width: 100%; padding: 12px; color: #cbd5e1; border-color: #475569; background: transparent;">
          Batalkan Pembayaran
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalDiv);

  // Event handler for simulate successful payment
  document.getElementById('btn-simulate-pay').onclick = async () => {
    modalDiv.querySelector('#btn-simulate-pay').disabled = true;
    modalDiv.querySelector('#btn-simulate-pay').textContent = 'Memproses...';
    try {
      await Store.updateOrderPayment(order.id, 'Lunas', paymentMethod.toUpperCase());
      alert('Pembayaran Berhasil! Pesanan Anda telah diteruskan ke dapur.');
      
      // Kosongkan keranjang HANYA setelah pembayaran berhasil
      myOrderIds.push(order.id);
      cart = []; // Empty cart
      updateCartUI();
      renderMenu();
      
      modalDiv.remove();
      // Navigate to tracker
      document.querySelector('.nav-item[href="#view-tracker"]').click();
      updateTrackerStatus();
    } catch (e) {
      alert('Gagal memproses pembayaran.');
      modalDiv.querySelector('#btn-simulate-pay').disabled = false;
      modalDiv.querySelector('#btn-simulate-pay').textContent = 'Simulasi Bayar Sukses';
    }
  };

  // Event handler untuk membatalkan pembayaran
  document.getElementById('btn-cancel-pay').onclick = () => {
    if (confirm('Apakah Anda yakin ingin membatalkan pembayaran? Keranjang belanja Anda akan tetap disimpan.')) {
      modalDiv.remove();
    }
  };
}

async function updateTrackerStatus() {
  const emptyState = document.getElementById('tracker-empty-state');
  const activeState = document.getElementById('tracker-active-state');

  if (myOrderIds.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    if (activeState) activeState.style.display = 'none';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  if (activeState) activeState.style.display = 'block';
  
  // Refresh order data
  const allOrders = await Store.getOrders();
  const myOrders = myOrderIds.map(id => allOrders.find(o => o.id === id)).filter(Boolean).reverse();
  
  activeState.innerHTML = '';
  
  const statusMap = {
    'Diterima': 1,
    'Dimasak': 2,
    'Siap': 3
  };
  
  myOrders.forEach(order => {
    const currentStep = statusMap[order.status] || 1;
    
    const card = document.createElement('div');
    card.style.marginBottom = '32px';
    card.style.padding = '24px';
    card.style.backgroundColor = 'var(--color-surface-lowest)';
    card.style.borderRadius = 'var(--radius-lg)';
    card.style.boxShadow = 'var(--shadow-sm)';
    
    const itemsHtml = order.items.map(item => {
      let modsHtml = '';
      if (item.sugar && item.sugar !== 'Normal') {
        modsHtml += `<div style="color: var(--color-text-muted); font-size: 12px; margin-top: 2px;">Gula: ${item.sugar}</div>`;
      }
      if (item.selectedModifiers && item.selectedModifiers.length > 0) {
        item.selectedModifiers.forEach(modGroup => {
          const selectedNames = modGroup.selected.map(s => s.name).join(', ');
          modsHtml += `<div style="color: var(--color-text-muted); font-size: 12px; margin-top: 2px;">${modGroup.groupName}: ${selectedNames}</div>`;
        });
      }
      
      const itemFinalPrice = item.price + (item.modifierTotal || 0);

      return `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <div style="flex: 1; padding-right: 16px;">
          <span style="font-weight: 600;">${item.qty}x ${item.name}</span>
          ${modsHtml}
          ${item.note ? `<div style="color: var(--color-text-muted); font-size: 12px; margin-top: 2px;">Catatan: ${item.note}</div>` : ''}
        </div>
        <div style="font-weight: 500;">Rp ${(itemFinalPrice * item.qty).toLocaleString('id-ID')}</div>
      </div>
    `}).join('');
    
    card.innerHTML = `
      <div style="text-align: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--color-surface-variant);">
        <h2 style="font-size: 18px; margin-bottom: 4px;">Order ID: ${order.id}</h2>
        <p class="text-label" style="color: var(--color-text-muted);">${order.items.length} ITEM • Rp ${order.total.toLocaleString('id-ID')}</p>
        <p style="font-size: 14px; margin-top: 8px; font-weight: 500;">Atas Nama: <span style="color: var(--color-primary);">${order.customerName}</span></p>
      </div>

      <div style="margin-bottom: 24px; background: var(--color-surface-container); padding: 16px; border-radius: var(--radius-md);">
        ${itemsHtml}
      </div>

      <div class="stepper" style="margin-bottom: ${order.status === 'Siap' ? '24px' : '0'};">
        <div class="step ${currentStep >= 1 ? (currentStep === 1 ? 'active' : 'completed') : ''}">
          <div class="step-icon"><span class="material-symbols-outlined">receipt_long</span></div>
          <div class="step-content">
            <h3>Diterima</h3>
            <p>Pesanan Anda telah diterima.</p>
          </div>
        </div>
        <div class="step ${currentStep >= 2 ? (currentStep === 2 ? 'active' : 'completed') : ''}">
          <div class="step-icon"><span class="material-symbols-outlined">soup_kitchen</span></div>
          <div class="step-content">
            <h3>Sedang Dimasak</h3>
            <p>Pesanan sedang disiapkan koki.</p>
          </div>
        </div>
        <div class="step ${currentStep >= 3 ? (currentStep === 3 ? 'active' : 'completed') : ''}">
          <div class="step-icon"><span class="material-symbols-outlined">room_service</span></div>
          <div class="step-content">
            <h3>Siap Diantar</h3>
            <p>Akan segera diantar ke meja.</p>
          </div>
        </div>
      </div>

      ${order.status === 'Siap' ? `
      <div style="margin-top: 24px; border-top: 1px dashed var(--color-surface-variant); padding-top: 20px;">
        <button class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600;" onclick="viewCustomerInvoice('${order.id}')">
          <span class="material-symbols-outlined" style="font-size: 20px;">receipt_long</span>
          Lihat & Unduh Invoice
        </button>
      </div>
      ` : ''}
    `;
    activeState.appendChild(card);
  });
}

window.viewCustomerInvoice = async function(orderId) {
  const allOrders = await Store.getOrders();
  const order = allOrders.find(o => o.id === orderId);
  if (!order) {
    alert('Pesanan tidak ditemukan.');
    return;
  }

  const orderDate = new Date(order.timestamp);
  const formattedDate = orderDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = orderDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const invoiceModal = document.createElement('div');
  invoiceModal.id = 'invoice-modal-overlay';
  invoiceModal.style = `
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(15, 23, 42, 0.85);
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    z-index: 99999; backdrop-filter: blur(8px);
    font-family: 'Outfit', 'Inter', sans-serif;
    padding: 16px;
    box-sizing: border-box;
  `;

  const itemsListHtml = order.items.map(item => {
    let modsHtml = '';
    if (item.selectedModifiers && item.selectedModifiers.length > 0) {
      const allMods = item.selectedModifiers.flatMap(g => g.selected.map(s => s.name)).join(', ');
      modsHtml = `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">(${allMods})</div>`;
    }
    const itemFinalPrice = item.price + (item.modifierTotal || 0);
    return `
      <div style="display: flex; justify-content: space-between; font-size: 13px; color: #1e293b; margin-bottom: 8px;">
        <div style="flex: 1; padding-right: 12px;">
          <div><strong>${item.qty}x</strong> ${item.name}</div>
          ${modsHtml}
          ${item.note ? `<div style="font-size: 11px; color: #64748b; font-style: italic;">Catatan: ${item.note}</div>` : ''}
        </div>
        <div style="font-weight: 600; color: #1e293b;">Rp ${(itemFinalPrice * item.qty).toLocaleString('id-ID')}</div>
      </div>
    `;
  }).join('');

  invoiceModal.innerHTML = `
    <div style="background: transparent; width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; max-height: 90vh;" class="hide-scrollbar">
      <!-- RENDER TARGET FOR HTML2CANVAS -->
      <div id="invoice-capture-target" style="background: #ffffff; padding: 32px 24px; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); color: #1e293b; box-sizing: border-box; border: 1px solid #e2e8f0; position: relative;">
        <!-- Watermark / Background Accent -->
        <div style="position: absolute; top: 12px; right: 24px; font-size: 10px; font-weight: 700; color: #10b981; border: 1.5px solid #10b981; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; transform: rotate(5deg); font-family: sans-serif;">
          ${order.paymentStatus === 'Lunas' ? 'Lunas' : 'Belum Bayar'}
        </div>

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #1e293b; margin-bottom: 4px;">Rakit Coffee</h2>
          <p style="font-size: 11px; color: #64748b; letter-spacing: 0.5px;">Rakit Rasa, Bangun Cerita</p>
          <div style="margin: 16px 0; border-top: 1px dashed #cbd5e1;"></div>
        </div>

        <!-- Info Grid -->
        <div style="font-size: 12px; color: #475569; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-bottom: 20px;">
          <div>
            <span style="color: #94a3b8; display: block; font-size: 10px; text-transform: uppercase;">ID Pesanan</span>
            <strong style="color: #1e293b; font-family: monospace; font-size: 13px;">${order.id}</strong>
          </div>
          <div style="text-align: right;">
            <span style="color: #94a3b8; display: block; font-size: 10px; text-transform: uppercase;">Nomor Meja</span>
            <strong style="color: #1e293b; font-size: 14px;">Meja ${order.table}</strong>
          </div>
          <div>
            <span style="color: #94a3b8; display: block; font-size: 10px; text-transform: uppercase;">Nama Pelanggan</span>
            <strong style="color: #1e293b;">${order.customerName}</strong>
          </div>
          <div style="text-align: right;">
            <span style="color: #94a3b8; display: block; font-size: 10px; text-transform: uppercase;">Tanggal & Waktu</span>
            <strong style="color: #1e293b;">${formattedDate}, ${formattedTime}</strong>
          </div>
        </div>

        <div style="border-top: 1px dashed #cbd5e1; margin-bottom: 16px;"></div>

        <!-- Items -->
        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; letter-spacing: 0.5px;">Rincian Pesanan</h4>
          ${itemsListHtml}
        </div>

        <div style="border-top: 1px dashed #cbd5e1; margin: 16px 0;"></div>

        <!-- Total -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 13px; color: #475569; font-weight: 500;">Metode Pembayaran</span>
          <strong style="font-size: 13px; color: #1e293b;">${order.paymentMethod || 'QRIS'}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <span style="font-size: 15px; color: #1e293b; font-weight: 700;">TOTAL BAYAR</span>
          <strong style="font-size: 18px; color: var(--color-accent, #AF8C53); font-weight: 800;">Rp ${order.total.toLocaleString('id-ID')}</strong>
        </div>

        <!-- Footer Note -->
        <div style="text-align: center; margin-top: 24px; border-top: 1px dashed #cbd5e1; padding-top: 16px;">
          <p style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Terima kasih atas kunjungan Anda!</p>
          <p style="font-size: 10px; color: #94a3b8;">Silakan berkunjung kembali.</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 12px;">
        <button id="btn-download-invoice" class="btn btn-primary" style="flex: 1; padding: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <span class="material-symbols-outlined">download</span>
          Unduh PNG
        </button>
        <button id="btn-close-invoice" class="btn btn-outline" style="flex: 1; padding: 12px; color: #cbd5e1; border-color: #475569; background: #1e293b;">
          Tutup
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(invoiceModal);

  // Close Action
  document.getElementById('btn-close-invoice').onclick = () => {
    invoiceModal.remove();
  };

  // Download Action using html2canvas
  document.getElementById('btn-download-invoice').onclick = () => {
    const target = document.getElementById('invoice-capture-target');
    const downloadBtn = document.getElementById('btn-download-invoice');
    
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Memproses...';

    html2canvas(target, {
      scale: 3, // High quality render
      backgroundColor: '#ffffff',
      useCORS: true
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `Invoice_${order.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `<span class="material-symbols-outlined">download</span> Unduh PNG`;
    }).catch(err => {
      console.error(err);
      alert('Gagal mengunduh gambar invoice.');
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `<span class="material-symbols-outlined">download</span> Unduh PNG`;
    });
  };
};
