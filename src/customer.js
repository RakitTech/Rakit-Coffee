import { Store } from './store.js';

let cart = [];
let myOrderIds = [];

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  setupNavigation();
  setupCategoryFilter();
  setupModal();
  updateCartUI();
  updateTrackerStatus();

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

function renderMenu() {
  const menuContainer = document.getElementById('menu-container');
  const menus = Store.getMenu();
  
  menuContainer.innerHTML = '';

  const categories = [...new Set(menus.map(m => m.category))]; // Dynamic categories

  categories.forEach(category => {
    const categoryItems = menus.filter(m => m.category === category);
    
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
        actionHtml = `
          <div style="display: flex; align-items: center; gap: 8px; background: var(--color-surface-container); padding: 4px; border-radius: 20px;">
            <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-lowest); color: var(--color-primary);" onclick="quickDecrement('${item.id}')">
              <span class="material-symbols-outlined" style="font-size: 16px;">remove</span>
            </button>
            <span style="font-weight: bold; font-size: 14px; min-width: 16px; text-align: center;">${totalQty}</span>
            <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-lowest); color: var(--color-primary);" onclick="openCustomizationModal('${item.id}')">
              <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
            </button>
          </div>
        `;
      } else {
        actionHtml = `
          <button class="btn-icon" onclick="openCustomizationModal('${item.id}')">
            <span class="material-symbols-outlined">add</span>
          </button>
        `;
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

window.openCustomizationModal = function(itemId) {
  const item = Store.getMenu().find(m => m.id === itemId);
  if (!item) return;

  document.getElementById('modal-item-id').value = item.id;
  document.getElementById('modal-cart-index').value = '';
  document.getElementById('modal-title').textContent = item.name;
  document.getElementById('modal-desc').textContent = item.desc;
  document.getElementById('modal-img').src = item.image;
  
  document.getElementById('modal-price').dataset.basePrice = item.price;
  document.getElementById('modal-price').textContent = `Rp ${item.price.toLocaleString('id-ID')}`;
  
  // Reset form and quantity
  document.getElementById('customization-form').reset();
  document.getElementById('modal-quantity-val').value = 1;
  document.getElementById('modal-quantity-display').textContent = '1';
  
  // Show modal
  document.getElementById('customization-modal').classList.add('active');
  document.getElementById('modal-overlay').classList.add('active');
};

window.openEditModal = function(cartIndex) {
  const cartItem = cart[cartIndex];
  if (!cartItem) return;

  const menuDef = Store.getMenu().find(m => m.id === cartItem.id);
  if (!menuDef) return;

  document.getElementById('modal-item-id').value = cartItem.id;
  document.getElementById('modal-cart-index').value = cartIndex;
  
  document.getElementById('modal-title').textContent = cartItem.name;
  document.getElementById('modal-desc').textContent = menuDef.desc;
  document.getElementById('modal-img').src = cartItem.image;
  
  document.getElementById('modal-price').dataset.basePrice = cartItem.price;
  
  // Set form values
  document.getElementById('customization-form').reset();
  
  if (cartItem.sugar) {
    const sugarRadio = document.querySelector(`input[name="sugar"][value="${cartItem.sugar}"]`);
    if (sugarRadio) sugarRadio.checked = true;
  }
  
  const noteTextarea = document.querySelector('textarea[name="note"]');
  if (noteTextarea && cartItem.note) {
    noteTextarea.value = cartItem.note;
  }

  document.getElementById('modal-quantity-val').value = cartItem.qty;
  document.getElementById('modal-quantity-display').textContent = cartItem.qty;
  
  const totalPrice = cartItem.price * cartItem.qty;
  document.getElementById('modal-price').textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
  
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
  const priceEl = document.getElementById('modal-price');
  
  let currentVal = parseInt(input.value) || 1;
  let newVal = currentVal + change;
  if (newVal < 1) newVal = 1;
  
  input.value = newVal;
  display.textContent = newVal;
  
  const basePrice = parseInt(priceEl.dataset.basePrice) || 0;
  const totalPrice = basePrice * newVal;
  priceEl.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
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
  
  document.getElementById('customization-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const itemId = document.getElementById('modal-item-id').value;
    const cartIndexStr = document.getElementById('modal-cart-index').value;
    const item = Store.getMenu().find(m => m.id === itemId);
    
    const formData = new FormData(e.target);
    const sugar = formData.get('sugar');
    const note = formData.get('note');
    const qty = parseInt(formData.get('quantity')) || 1;
    
    const cartItemData = {
      ...item,
      sugar,
      note,
      qty: qty
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
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
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
    total += item.price * item.qty;
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img src="${item.image}" class="cart-item-img" alt="${item.name}">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.name}</h4>
        <p class="menu-desc" style="margin-bottom: 2px;">${item.sugar ? `Gula: ${item.sugar}` : ''}</p>
        <p class="menu-desc" style="margin-bottom: 2px;">${item.note ? `Catatan: ${item.note}` : ''}</p>
        <p class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</p>
      </div>
      <div class="cart-item-actions">
        <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-variant); color: var(--color-primary);" onclick="openEditModal(${index})">
          <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
        </button>
        <button class="btn-icon" style="width: 28px; height: 28px; background: var(--color-surface-variant); color: var(--color-error);" onclick="removeFromCart(${index})">
          <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
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

window.processCheckout = function() {
  const nameInput = document.getElementById('customer-name').value;
  if (!nameInput) {
    alert('Silakan masukkan nama Anda.');
    return;
  }
  
  if (cart.length === 0) return;
  
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  const order = Store.addOrder({
    customerName: nameInput,
    items: [...cart],
    total: total,
    table: '12' // Hardcoded for prototype
  });
  
  myOrderIds.push(order.id);
  cart = []; // Empty cart
  updateCartUI();
  renderMenu();
  
  alert('Pembayaran Berhasil! Pesanan sedang diproses.');
  
  // Navigate to tracker
  document.querySelector('.nav-item[href="#view-tracker"]').click();
  updateTrackerStatus();
};

function updateTrackerStatus() {
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
  const allOrders = Store.getOrders();
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
    
    const itemsHtml = order.items.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <div style="flex: 1; padding-right: 16px;">
          <span style="font-weight: 600;">${item.qty}x ${item.name}</span>
          ${item.sugar ? `<div style="color: var(--color-text-muted); font-size: 12px; margin-top: 2px;">Gula: ${item.sugar}</div>` : ''}
          ${item.note ? `<div style="color: var(--color-text-muted); font-size: 12px; margin-top: 2px;">Catatan: ${item.note}</div>` : ''}
        </div>
        <div style="font-weight: 500;">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</div>
      </div>
    `).join('');
    
    card.innerHTML = `
      <div style="text-align: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--color-surface-variant);">
        <h2 style="font-size: 18px; margin-bottom: 4px;">Order ID: ${order.id}</h2>
        <p class="text-label" style="color: var(--color-text-muted);">${order.items.length} ITEM • Rp ${order.total.toLocaleString('id-ID')}</p>
        <p style="font-size: 14px; margin-top: 8px; font-weight: 500;">Atas Nama: <span style="color: var(--color-primary);">${order.customerName}</span></p>
      </div>

      <div style="margin-bottom: 24px; background: var(--color-surface-container); padding: 16px; border-radius: var(--radius-md);">
        ${itemsHtml}
      </div>

      <div class="stepper">
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
    `;
    activeState.appendChild(card);
  });
}
