import { Store } from './store.js';

const API_BASE_URL = 'http://localhost:3001/api';

async function getStockItems() {
  const res = await fetch(`${API_BASE_URL}/stock/items`);
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
  const viewMaster = document.getElementById('view-master');
  const viewHistory = document.getElementById('view-history');

  function hideAllTabs() {
    tabMaster.classList.remove('active');
    tabHistory.classList.remove('active');
    viewMaster.style.display = 'none';
    viewHistory.style.display = 'none';
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
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Stok_${start || 'All'}_to_${end || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Modal Transactions
  const modalTrans = document.getElementById('modal-transaction');
  
  // Helper to open transaction modal
  window.openTransactionModal = async (stockItemId = '', stockItemName = '') => {
    document.getElementById('form-transaction').reset();
    document.getElementById('trans-item-id').value = stockItemId;
    document.getElementById('trans-item-trigger-text').textContent = stockItemName || '-- Pilih Item --';
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
    dropdown.innerHTML = items.map(i => `<div class="custom-select-option ${i.id === stockItemId ? 'selected' : ''}" data-value="${i.id}" data-name="${i.name} (${i.unit})">${i.name} (${i.unit})</div>`).join('');
    
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
  };

  document.getElementById('btn-add-transaction').addEventListener('click', () => {
    window.openTransactionModal('', '');
  });

  document.getElementById('close-transaction-modal').addEventListener('click', () => {
    modalTrans.style.display = 'none';
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
  document.getElementById('form-transaction').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      stockItemId: document.getElementById('trans-item-id').value,
      type: document.getElementById('trans-type').value,
      qty: parseFloat(document.getElementById('trans-qty').value),
      notes: document.getElementById('trans-notes').value
    };
    await saveStockTransaction(data);
    modalTrans.style.display = 'none';
    if (tabMaster.classList.contains('active')) {
      renderMaster();
    } else {
      renderHistory();
    }
  });

  // Initial render
  renderMaster();
});

async function renderMaster() {
  const items = await getStockItems();
  const tbody = document.getElementById('stock-items-body');
  
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Belum ada menu dengan stok terlacak.</td></tr>';
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
          <button class="btn btn-primary" style="padding: 4px 12px; font-size: 12px;" onclick="openTransactionModal('${item.id}', '${item.name.replace(/'/g, "\\'")}')">+ Transaksi</button>
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
