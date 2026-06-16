import { Store } from './store.js';

const API_BASE_URL = 'http://localhost:3001/api';

async function getStockItems() {
  const res = await fetch(`${API_BASE_URL}/stock/items`);
  return res.json();
}

async function saveStockItem(data, id = null) {
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE_URL}/stock/items/${id}` : `${API_BASE_URL}/stock/items`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function deleteStockItem(id) {
  const res = await fetch(`${API_BASE_URL}/stock/items/${id}`, { method: 'DELETE' });
  return res.json();
}

async function getStockTransactions(startDate, endDate) {
  let url = `${API_BASE_URL}/stock/transactions`;
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  const res = await fetch(url);
  return res.json();
}

async function saveStockTransaction(data) {
  const res = await fetch(`${API_BASE_URL}/stock/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function getMenuRecipes(menuId) {
  const res = await fetch(`${API_BASE_URL}/stock/recipes/${menuId}`);
  return res.json();
}

async function addMenuRecipe(data) {
  const res = await fetch(`${API_BASE_URL}/stock/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function updateMenuRecipe(id, data) {
  const res = await fetch(`${API_BASE_URL}/stock/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function deleteMenuRecipe(id) {
  const res = await fetch(`${API_BASE_URL}/stock/recipes/${id}`, { method: 'DELETE' });
  return res.json();
}

document.addEventListener('DOMContentLoaded', async () => {
  await Store.applyGlobalTheme();
  if (!Store.isAuthenticated()) {
    window.location.replace('/login.html');
    return;
  }

  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await Store.logout();
    window.location.replace('/login.html');
  });

  // Tabs
  const tabMaster = document.getElementById('tab-master');
  const tabHistory = document.getElementById('tab-history');
  const tabRecipes = document.getElementById('tab-recipes');
  const viewMaster = document.getElementById('view-master');
  const viewHistory = document.getElementById('view-history');
  const viewRecipes = document.getElementById('view-recipes');

  function hideAllTabs() {
    tabMaster.classList.remove('active');
    tabHistory.classList.remove('active');
    tabRecipes.classList.remove('active');
    viewMaster.style.display = 'none';
    viewHistory.style.display = 'none';
    viewRecipes.style.display = 'none';
  }

  tabMaster.addEventListener('click', () => {
    hideAllTabs();
    tabMaster.classList.add('active');
    viewMaster.style.display = 'block';
    renderMaster();
  });

  tabHistory.addEventListener('click', () => {
    hideAllTabs();
    tabHistory.classList.add('active');
    viewHistory.style.display = 'block';
    renderHistory();
  });

  tabRecipes.addEventListener('click', () => {
    hideAllTabs();
    tabRecipes.classList.add('active');
    viewRecipes.style.display = 'block';
    renderRecipeList();
  });

  // Filter Period
  const filterPeriod = document.getElementById('filter-period');
  const customRange = document.getElementById('filter-custom-range');
  const startDate = document.getElementById('history-start-date');
  const endDate = document.getElementById('history-end-date');

  function setFilterDates() {
    const today = new Date();
    const period = filterPeriod.value;
    customRange.style.display = period === 'custom' ? 'flex' : 'none';

    if (period === 'today') {
      const d = today.toISOString().split('T')[0];
      startDate.value = d;
      endDate.value = d;
    } else if (period === 'week') {
      const first = today.getDate() - today.getDay(); // Sunday as first day
      const firstDay = new Date(today.setDate(first)).toISOString().split('T')[0];
      const lastDay = new Date(today.setDate(first + 6)).toISOString().split('T')[0];
      startDate.value = firstDay;
      endDate.value = lastDay;
    } else if (period === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      startDate.value = firstDay;
      endDate.value = lastDay;
    } else if (period === 'year') {
      startDate.value = `${today.getFullYear()}-01-01`;
      endDate.value = `${today.getFullYear()}-12-31`;
    }
  }

  setFilterDates(); // init
  filterPeriod.addEventListener('change', () => {
    setFilterDates();
    renderHistory();
  });
  startDate.addEventListener('change', renderHistory);
  endDate.addEventListener('change', renderHistory);

  // Export CSV
  document.getElementById('btn-export-csv').addEventListener('click', async () => {
    const start = startDate.value;
    const end = endDate.value;
    const transactions = await getStockTransactions(start, end);

    if (transactions.length === 0) {
      alert('Tidak ada data transaksi untuk di-export pada rentang waktu ini.');
      return;
    }

    const headers = ['Tanggal', 'Jam', 'Item Stok', 'Tipe Transaksi', 'Jumlah', 'Satuan', 'Catatan'];
    const rows = transactions.map(t => {
      const dateObj = new Date(t.date);
      const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const type = t.type === 'IN' ? 'Masuk' : 'Keluar';
      const notes = t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '""';

      return [
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${t.stockItem.name}"`,
        `"${type}"`,
        t.qty,
        `"${t.stockItem.unit}"`,
        notes
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for BOM (Excel UTF-8 support)
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Stok_${start || 'All'}_to_${end || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Modals
  const modalItem = document.getElementById('modal-item');
  const modalTrans = document.getElementById('modal-transaction');
  const modalRecipe = document.getElementById('modal-recipe');
  
  document.getElementById('btn-add-item').addEventListener('click', () => {
    document.getElementById('form-item').reset();
    document.getElementById('item-id').value = '';
    document.getElementById('modal-item-title').textContent = 'Tambah Item Stok';
    
    document.getElementById('item-unit').value = '';
    document.getElementById('item-unit-trigger-text').textContent = 'Pilih Satuan';
    Array.from(document.getElementById('item-unit-dropdown')?.children || []).forEach(c => c.classList.remove('selected'));
    
    modalItem.style.display = 'flex';
  });
  
  document.getElementById('close-item-modal').addEventListener('click', () => {
    modalItem.style.display = 'none';
  });

  document.getElementById('btn-add-transaction').addEventListener('click', async () => {
    document.getElementById('form-transaction').reset();
    document.getElementById('trans-item-id').value = '';
    document.getElementById('trans-item-trigger-text').textContent = '-- Pilih Item --';
    document.getElementById('trans-type').value = 'IN';
    document.getElementById('trans-type-trigger-text').textContent = 'Masuk (Penambahan)';
    
    const typeDropdown = document.getElementById('trans-type-dropdown');
    if (typeDropdown) {
      Array.from(typeDropdown.children).forEach(c => {
        if(c.getAttribute('data-value') === 'IN') c.classList.add('selected');
        else c.classList.remove('selected');
      });
    }

    const items = await getStockItems();
    const dropdown = document.getElementById('trans-item-dropdown');
    dropdown.innerHTML = items.map(i => `<div class="custom-select-option" data-value="${i.id}" data-name="${i.name} (${i.unit})">${i.name} (${i.unit})</div>`).join('');
    
    Array.from(dropdown.children).forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-value');
        const name = opt.getAttribute('data-name');
        document.getElementById('trans-item-id').value = val;
        document.getElementById('trans-item-trigger-text').textContent = name;
        document.getElementById('trans-item-custom-select').classList.remove('open');
        Array.from(dropdown.children).forEach(c => c.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    modalTrans.style.display = 'flex';
  });

  document.getElementById('close-transaction-modal').addEventListener('click', () => {
    modalTrans.style.display = 'none';
  });

  document.getElementById('close-recipe-modal').addEventListener('click', () => {
    modalRecipe.style.display = 'none';
  });

  // Custom Select Logic for Recipe Stock
  const customSelectWrapper = document.getElementById('recipe-stock-custom-select');
  const customSelectTrigger = document.getElementById('recipe-stock-trigger');
  const customSelectDropdown = document.getElementById('recipe-stock-dropdown');
  const customSelectInput = document.getElementById('recipe-stock-id');
  const customSelectText = document.getElementById('recipe-stock-trigger-text');

  customSelectTrigger?.addEventListener('click', () => {
    customSelectWrapper.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (customSelectWrapper && !customSelectWrapper.contains(e.target)) {
      customSelectWrapper.classList.remove('open');
    }
  });

  function populateCustomSelect(items, selectedId = null) {
    if (!customSelectDropdown) return;
    customSelectDropdown.innerHTML = '';
    let selectedItemName = 'Pilih Bahan Stok';

    items.forEach(i => {
      const option = document.createElement('div');
      option.className = 'custom-select-option' + (i.id === selectedId ? ' selected' : '');
      option.textContent = `${i.name} (${i.unit})`;
      
      if (i.id === selectedId) selectedItemName = `${i.name} (${i.unit})`;

      option.addEventListener('click', () => {
        customSelectInput.value = i.id;
        customSelectText.textContent = `${i.name} (${i.unit})`;
        document.getElementById('recipe-unit-hint').textContent = `Satuan: ${i.unit}`;
        
        customSelectWrapper.classList.remove('open');
        
        // Update selected class
        Array.from(customSelectDropdown.children).forEach(child => child.classList.remove('selected'));
        option.classList.add('selected');
      });

      customSelectDropdown.appendChild(option);
    });

    customSelectText.textContent = selectedItemName;
    customSelectInput.value = selectedId || '';
  }

  // Custom Select Logic for Item Unit
  const unitWrapper = document.getElementById('item-unit-custom-select');
  const unitTrigger = document.getElementById('item-unit-trigger');
  const unitDropdown = document.getElementById('item-unit-dropdown');
  const unitInput = document.getElementById('item-unit');
  const unitText = document.getElementById('item-unit-trigger-text');

  unitTrigger?.addEventListener('click', () => {
    unitWrapper.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (unitWrapper && !unitWrapper.contains(e.target)) {
      unitWrapper.classList.remove('open');
    }
  });

  Array.from(unitDropdown?.children || []).forEach(opt => {
    opt.addEventListener('click', () => {
      const val = opt.getAttribute('data-value');
      unitInput.value = val;
      unitText.textContent = val;
      unitWrapper.classList.remove('open');
      Array.from(unitDropdown.children).forEach(c => c.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // Custom Select Logic for Transaction Types & Items
  const transItemWrapper = document.getElementById('trans-item-custom-select');
  const transItemTrigger = document.getElementById('trans-item-trigger');
  
  transItemTrigger?.addEventListener('click', () => {
    transItemWrapper.classList.toggle('open');
  });

  const transTypeWrapper = document.getElementById('trans-type-custom-select');
  const transTypeTrigger = document.getElementById('trans-type-trigger');
  const transTypeDropdown = document.getElementById('trans-type-dropdown');
  const transTypeInput = document.getElementById('trans-type');
  const transTypeText = document.getElementById('trans-type-trigger-text');

  transTypeTrigger?.addEventListener('click', () => {
    transTypeWrapper.classList.toggle('open');
  });

  Array.from(transTypeDropdown?.children || []).forEach(opt => {
    opt.addEventListener('click', () => {
      const val = opt.getAttribute('data-value');
      const name = opt.textContent;
      transTypeInput.value = val;
      transTypeText.textContent = name;
      transTypeWrapper.classList.remove('open');
      Array.from(transTypeDropdown.children).forEach(c => c.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  document.addEventListener('click', (e) => {
    if (transItemWrapper && !transItemWrapper.contains(e.target)) transItemWrapper.classList.remove('open');
    if (transTypeWrapper && !transTypeWrapper.contains(e.target)) transTypeWrapper.classList.remove('open');
  });

  // Forms
  document.getElementById('form-item').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    const data = {
      name: document.getElementById('item-name').value,
      unit: document.getElementById('item-unit').value,
      minQty: document.getElementById('item-minQty').value
    };
    await saveStockItem(data, id || null);
    modalItem.style.display = 'none';
    renderMaster();
  });

  document.getElementById('form-transaction').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      stockItemId: document.getElementById('trans-item-id').value,
      type: document.getElementById('trans-type').value,
      qty: document.getElementById('trans-qty').value,
      notes: document.getElementById('trans-notes').value
    };
    await saveStockTransaction(data);
    modalTrans.style.display = 'none';
    renderHistory();
  });

  document.getElementById('form-recipe').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('recipe-id').value;
    const stockItemId = document.getElementById('recipe-stock-id').value;
    
    if (!stockItemId) {
      alert('Silakan pilih bahan stok terlebih dahulu.');
      return;
    }

    const data = {
      menuId: document.getElementById('recipe-menu-id').value,
      stockItemId: stockItemId,
      qty: document.getElementById('recipe-qty').value
    };
    if (id) {
      await updateMenuRecipe(id, data);
    } else {
      await addMenuRecipe(data);
    }
    modalRecipe.style.display = 'none';
    renderRecipeList();
  });

  // Search Recipe
  document.getElementById('recipe-search').addEventListener('input', renderRecipeList);

  // Populate Recipe Categories
  const menusForCats = await Store.getMenu();
  const cats = [...new Set(menusForCats.map(m => m.category))];
  
  const catInput = document.getElementById('recipe-filter-category');
  const catTriggerText = document.getElementById('recipe-category-trigger-text');
  const catDropdown = document.getElementById('recipe-category-dropdown');
  const catWrapper = document.getElementById('recipe-category-custom-select');

  document.getElementById('recipe-category-trigger')?.addEventListener('click', () => {
    catWrapper.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (catWrapper && !catWrapper.contains(e.target)) {
      catWrapper.classList.remove('open');
    }
  });

  // Default option
  const allOpt = document.createElement('div');
  allOpt.className = 'custom-select-option selected';
  allOpt.textContent = 'Semua Kategori';
  allOpt.addEventListener('click', () => {
    catInput.value = 'ALL';
    catTriggerText.textContent = 'Semua Kategori';
    catWrapper.classList.remove('open');
    Array.from(catDropdown.children).forEach(child => child.classList.remove('selected'));
    allOpt.classList.add('selected');
    renderRecipeList();
  });
  catDropdown.appendChild(allOpt);

  cats.forEach(c => {
    const opt = document.createElement('div');
    opt.className = 'custom-select-option';
    opt.textContent = c;
    opt.addEventListener('click', () => {
      catInput.value = c;
      catTriggerText.textContent = c;
      catWrapper.classList.remove('open');
      Array.from(catDropdown.children).forEach(child => child.classList.remove('selected'));
      opt.classList.add('selected');
      renderRecipeList();
    });
    catDropdown.appendChild(opt);
  });

  // Global methods for inline HTML calling
  window.editItem = async (id) => {
    const items = await getStockItems();
    const item = items.find(i => i.id === id);
    if(item) {
      document.getElementById('item-id').value = item.id;
      document.getElementById('item-name').value = item.name;
      document.getElementById('item-unit').value = item.unit;
      document.getElementById('item-minQty').value = item.minQty;
      document.getElementById('modal-item-title').textContent = 'Edit Item Stok';
      
      const unitText = document.getElementById('item-unit-trigger-text');
      const unitDropdown = document.getElementById('item-unit-dropdown');
      unitText.textContent = item.unit || 'Pilih Satuan';
      if (unitDropdown) {
        Array.from(unitDropdown.children).forEach(c => {
          if(c.getAttribute('data-value') === item.unit) c.classList.add('selected');
          else c.classList.remove('selected');
        });
      }

      modalItem.style.display = 'flex';
    }
  };

  window.deleteItem = async (id) => {
    if(confirm('Apakah Anda yakin ingin menghapus item ini? Semua riwayat transaksi stoknya juga akan terhapus.')) {
      await deleteStockItem(id);
      renderMaster();
    }
  };

  window.openAddRecipeModal = async (menuId, menuName) => {
    document.getElementById('form-recipe').reset();
    document.getElementById('recipe-id').value = '';
    document.getElementById('recipe-menu-id').value = menuId;
    document.getElementById('modal-recipe-title').textContent = 'Tambah Bahan Baku';
    document.getElementById('recipe-menu-name-label').textContent = `Menu: ${menuName}`;
    document.getElementById('btn-submit-recipe').textContent = 'Tambahkan Bahan';
    
    const items = await getStockItems();
    populateCustomSelect(items, null);
    document.getElementById('recipe-unit-hint').textContent = '';
    
    modalRecipe.style.display = 'flex';
  };

  window.editRecipe = async (id, menuId, menuName, stockItemId, qty, unit) => {
    document.getElementById('form-recipe').reset();
    document.getElementById('recipe-id').value = id;
    document.getElementById('recipe-menu-id').value = menuId;
    document.getElementById('modal-recipe-title').textContent = 'Edit Bahan Baku';
    document.getElementById('recipe-menu-name-label').textContent = `Menu: ${menuName}`;
    document.getElementById('recipe-qty').value = qty;
    document.getElementById('btn-submit-recipe').textContent = 'Simpan Perubahan';
    
    const items = await getStockItems();
    populateCustomSelect(items, stockItemId);
    document.getElementById('recipe-unit-hint').textContent = `Satuan: ${unit}`;
    
    modalRecipe.style.display = 'flex';
  };

  window.deleteRecipe = async (recipeId) => {
    if(confirm('Hapus bahan ini dari resep menu?')) {
      await deleteMenuRecipe(recipeId);
      renderRecipeList();
    }
  };

  // Initial render
  renderMaster();
});

async function renderMaster() {
  const items = await getStockItems();
  const tbody = document.getElementById('stock-items-body');
  
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Belum ada item stok.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map((item, index) => {
    const isLow = item.qty <= item.minQty;
    const qtyColor = isLow ? 'color: #dc3545; font-weight: bold;' : 'color: var(--color-success); font-weight: bold;';
    
    return `
      <tr>
        <td>${index + 1}</td>
        <td style="font-weight: 600;">${item.name}</td>
        <td style="${qtyColor}">${item.qty}</td>
        <td>${item.unit}</td>
        <td>${item.minQty}</td>
        <td>
          <button class="btn btn-outline" style="padding: 4px 12px; font-size: 12px;" onclick="editItem('${item.id}')">Edit</button>
          <button class="btn btn-outline" style="padding: 4px 12px; font-size: 12px; color: #dc3545; border-color: #dc3545;" onclick="deleteItem('${item.id}')">Hapus</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function renderHistory() {
  const start = document.getElementById('history-start-date').value;
  const end = document.getElementById('history-end-date').value;
  
  const transactions = await getStockTransactions(start, end);
  const tbody = document.getElementById('stock-history-body');

  if (transactions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Tidak ada riwayat pada rentang waktu ini.</td></tr>';
    return;
  }

  tbody.innerHTML = transactions.map((t) => {
    const dateObj = new Date(t.date);
    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const typeHtml = t.type === 'IN' ? '<span class="transaction-type in">Masuk</span>' : '<span class="transaction-type out">Keluar</span>';
    const prefix = t.type === 'IN' ? '+' : '-';
    
    return `
      <tr>
        <td>${dateStr}</td>
        <td>${timeStr}</td>
        <td style="font-weight: 600;">${t.stockItem.name}</td>
        <td>${typeHtml}</td>
        <td style="font-weight: bold;">${prefix} ${t.qty} ${t.stockItem.unit}</td>
        <td style="color: var(--color-text-muted); font-size: 14px;">${t.notes || '-'}</td>
      </tr>
    `;
  }).join('');
}

async function renderRecipeList() {
  const menus = await Store.getMenu();
  const search = document.getElementById('recipe-search').value.toLowerCase();
  const catFilter = document.getElementById('recipe-filter-category').value;
  
  const filteredMenus = menus.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search);
    const matchCat = catFilter === 'ALL' || m.category === catFilter;
    return matchSearch && matchCat;
  });
  
  const container = document.getElementById('recipe-list-container');
  if (filteredMenus.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--color-text-muted);">Tidak ada menu ditemukan.</div>';
    return;
  }

  container.innerHTML = '';
  
  for (const menu of filteredMenus) {
    const recipes = await getMenuRecipes(menu.id);
    
    let recipesHtml = '';
    if (recipes.length === 0) {
      recipesHtml = '<div style="font-size: 14px; color: var(--color-text-muted); font-style: italic; margin-top: 8px;">Belum ada bahan yang ditambahkan.</div>';
    } else {
      recipesHtml = recipes.map(r => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px dashed var(--color-surface-variant);">
          <div>
            <span style="font-weight: 600;">${r.stockItem.name}</span>
            <span style="font-size: 12px; color: var(--color-text-muted); margin-left: 8px;">(Butuh ${r.qty} ${r.stockItem.unit})</span>
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="btn-icon" onclick="editRecipe('${r.id}', '${menu.id}', '${menu.name.replace(/'/g, "\\'")}', '${r.stockItemId}', ${r.qty}, '${r.stockItem.unit}')" title="Edit Bahan" style="color: var(--color-accent);">
              <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
            </button>
            <button class="btn-icon" onclick="deleteRecipe('${r.id}')" title="Hapus Bahan" style="color: #dc3545;">
              <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
            </button>
          </div>
        </div>
      `).join('');
    }

    const card = document.createElement('div');
    card.style.border = '1px solid var(--color-surface-variant)';
    card.style.borderRadius = 'var(--radius-md)';
    card.style.padding = '16px';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div>
          <h4 style="margin: 0; font-size: 16px; font-weight: 600;">${menu.name}</h4>
          <span style="font-size: 12px; color: var(--color-text-muted); background: var(--color-surface-variant); padding: 2px 6px; border-radius: 4px;">${menu.category}</span>
        </div>
        <button class="btn btn-outline" style="padding: 4px 12px; font-size: 12px;" onclick="openAddRecipeModal('${menu.id}', '${menu.name.replace(/'/g, "\\'")}')">
          + Tambah Bahan
        </button>
      </div>
      <div style="background-color: var(--color-surface-container); border-radius: var(--radius-sm); padding: 8px;">
        ${recipesHtml}
      </div>
    `;
    container.appendChild(card);
  }
}
