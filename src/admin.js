import { Store } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  initGlobalFilters();
  initMenuFilters();
  renderDashboard();
  renderDashboardMenu();
  renderMenuTable();

  Store.subscribe(() => {
    renderDashboard();
    renderDashboardMenu();
    renderMenuTable();
  });

  // Modal event listener
  const closeModalBtn = document.getElementById('close-order-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('order-detail-modal').style.display = 'none';
    });
  }
});

function setupNavigation() {
  const navItems = document.querySelectorAll('.sidebar-item');
  const views = document.querySelectorAll('.admin-view');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href').substring(1);
      
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      views.forEach(view => {
        if (view.id === `view-${targetId}`) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
    });
  });
}

function initGlobalFilters() {
  const modeSelect = document.getElementById('global-filter-mode');
  const inputDaily = document.getElementById('filter-daily');
  const inputMonthly = document.getElementById('filter-monthly');
  const inputYearly = document.getElementById('filter-yearly');
  const inputRange = document.getElementById('filter-range');
  const rangeStart = document.getElementById('filter-range-start');
  const rangeEnd = document.getElementById('filter-range-end');

  if (!modeSelect) return;

  const today = new Date();
  const yearStr = today.getFullYear();
  const monthStr = String(today.getMonth() + 1).padStart(2, '0');
  const dayStr = String(today.getDate()).padStart(2, '0');
  const todayDateStr = `${yearStr}-${monthStr}-${dayStr}`;
  const todayMonthStr = `${yearStr}-${monthStr}`;

  inputDaily.value = todayDateStr;
  inputMonthly.value = todayMonthStr;
  rangeStart.value = todayDateStr;
  rangeEnd.value = todayDateStr;

  for (let y = yearStr; y >= yearStr - 5; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    inputYearly.appendChild(opt);
  }

  modeSelect.addEventListener('change', (e) => {
    inputDaily.style.display = 'none';
    inputMonthly.style.display = 'none';
    inputYearly.style.display = 'none';
    inputRange.style.display = 'none';

    if (e.target.value === 'daily') inputDaily.style.display = 'block';
    if (e.target.value === 'monthly') inputMonthly.style.display = 'block';
    if (e.target.value === 'yearly') inputYearly.style.display = 'block';
    if (e.target.value === 'range') inputRange.style.display = 'flex';
    
    renderDashboard();
  });

  [inputDaily, inputMonthly, inputYearly, rangeStart, rangeEnd].forEach(el => {
    el.addEventListener('change', renderDashboard);
  });
}

function initMenuFilters() {
  const modeSelect = document.getElementById('menu-filter-mode');
  const inputDaily = document.getElementById('menu-filter-daily');
  const inputMonthly = document.getElementById('menu-filter-monthly');
  const inputYearly = document.getElementById('menu-filter-yearly');
  const inputRange = document.getElementById('menu-filter-range');
  const rangeStart = document.getElementById('menu-filter-range-start');
  const rangeEnd = document.getElementById('menu-filter-range-end');

  if (!modeSelect) return;

  const today = new Date();
  const yearStr = today.getFullYear();
  const monthStr = String(today.getMonth() + 1).padStart(2, '0');
  const dayStr = String(today.getDate()).padStart(2, '0');
  const todayDateStr = `${yearStr}-${monthStr}-${dayStr}`;
  const todayMonthStr = `${yearStr}-${monthStr}`;

  inputDaily.value = todayDateStr;
  inputMonthly.value = todayMonthStr;
  rangeStart.value = todayDateStr;
  rangeEnd.value = todayDateStr;

  for (let y = yearStr; y >= yearStr - 5; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    inputYearly.appendChild(opt);
  }

  modeSelect.addEventListener('change', (e) => {
    inputDaily.style.display = 'none';
    inputMonthly.style.display = 'none';
    inputYearly.style.display = 'none';
    inputRange.style.display = 'none';

    if (e.target.value === 'daily') inputDaily.style.display = 'inline-block';
    if (e.target.value === 'monthly') inputMonthly.style.display = 'inline-block';
    if (e.target.value === 'yearly') inputYearly.style.display = 'inline-block';
    if (e.target.value === 'range') inputRange.style.display = 'flex';
    
    renderDashboardMenu();
  });

  [inputDaily, inputMonthly, inputYearly, rangeStart, rangeEnd].forEach(el => {
    el.addEventListener('change', renderDashboardMenu);
  });
}

function getGlobalFilteredOrders(orders) {
  const modeSelect = document.getElementById('global-filter-mode');
  if (!modeSelect) return orders;

  const mode = modeSelect.value;
  return orders.filter(order => {
    const orderDate = new Date(order.timestamp);
    const orderY = orderDate.getFullYear();
    const orderM = orderDate.getMonth() + 1;
    const orderD = orderDate.getDate();

    if (mode === 'daily') {
      const val = document.getElementById('filter-daily').value;
      if (!val) return true;
      const [y, m, d] = val.split('-').map(Number);
      return orderY === y && orderM === m && orderD === d;
    } else if (mode === 'monthly') {
      const val = document.getElementById('filter-monthly').value;
      if (!val) return true;
      const [y, m] = val.split('-').map(Number);
      return orderY === y && orderM === m;
    } else if (mode === 'yearly') {
      const val = parseInt(document.getElementById('filter-yearly').value);
      if (!val) return true;
      return orderY === val;
    } else if (mode === 'range') {
      const startVal = document.getElementById('filter-range-start').value;
      const endVal = document.getElementById('filter-range-end').value;
      if (!startVal || !endVal) return true;
      const start = new Date(startVal).setHours(0,0,0,0);
      const end = new Date(endVal).setHours(23,59,59,999);
      const time = orderDate.getTime();
      return time >= start && time <= end;
    }
    return true;
  });
}

function getMenuFilteredOrders(orders) {
  const modeSelect = document.getElementById('menu-filter-mode');
  if (!modeSelect) return orders;

  const mode = modeSelect.value;
  return orders.filter(order => {
    const orderDate = new Date(order.timestamp);
    const orderY = orderDate.getFullYear();
    const orderM = orderDate.getMonth() + 1;
    const orderD = orderDate.getDate();

    if (mode === 'daily') {
      const val = document.getElementById('menu-filter-daily').value;
      if (!val) return true;
      const [y, m, d] = val.split('-').map(Number);
      return orderY === y && orderM === m && orderD === d;
    } else if (mode === 'monthly') {
      const val = document.getElementById('menu-filter-monthly').value;
      if (!val) return true;
      const [y, m] = val.split('-').map(Number);
      return orderY === y && orderM === m;
    } else if (mode === 'yearly') {
      const val = parseInt(document.getElementById('menu-filter-yearly').value);
      if (!val) return true;
      return orderY === val;
    } else if (mode === 'range') {
      const startVal = document.getElementById('menu-filter-range-start').value;
      const endVal = document.getElementById('menu-filter-range-end').value;
      if (!startVal || !endVal) return true;
      const start = new Date(startVal).setHours(0,0,0,0);
      const end = new Date(endVal).setHours(23,59,59,999);
      const time = orderDate.getTime();
      return time >= start && time <= end;
    }
    return true;
  });
}

function renderDashboard() {
  const allOrders = Store.getOrders();
  const globalFilteredOrders = getGlobalFilteredOrders(allOrders);
  
  // Calculate metrics
  const totalOrders = globalFilteredOrders.length;
  // Pendapatan hanya menghitung status "Siap"
  const totalRevenue = globalFilteredOrders
    .filter(o => o.status === 'Siap')
    .reduce((sum, order) => sum + order.total, 0);
  
  const metricOrders = document.getElementById('metric-orders');
  if (metricOrders) metricOrders.textContent = totalOrders;
  
  const metricRevenue = document.getElementById('metric-revenue');
  if (metricRevenue) metricRevenue.textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;

  const modeSelect = document.getElementById('global-filter-mode');
  if (modeSelect) {
    const modeLabels = {
      'daily': '(Harian)',
      'monthly': '(Bulanan)',
      'yearly': '(Tahunan)',
      'range': '(Periode)'
    };
    const suffix = modeLabels[modeSelect.value] || '';
    
    const ordersTitle = document.getElementById('metric-orders-title');
    if (ordersTitle) ordersTitle.textContent = `Total Pesanan ${suffix}`;
    
    const revenueTitle = document.getElementById('metric-revenue-title');
    if (revenueTitle) revenueTitle.textContent = `Pendapatan ${suffix}`;
  }

  // Render Sales Table with filtered data
  renderSalesTable(globalFilteredOrders);
}

function renderDashboardMenu() {
  const allOrders = Store.getOrders();
  const menuFilteredOrders = getMenuFilteredOrders(allOrders);

  // We only count items from "Siap" orders
  const completedOrders = menuFilteredOrders.filter(o => o.status === 'Siap');
  
  // Aggregate sales per menu item
  const itemSales = {};
  
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemSales[item.id]) {
        itemSales[item.id] = {
          id: item.id,
          name: item.name,
          category: 'Kopi', // Default if not found
          qtySold: 0,
          revenue: 0
        };
      }
      itemSales[item.id].qtySold += item.qty;
      itemSales[item.id].revenue += (item.qty * item.price);
    });
  });

  // Fetch true category from Store
  const menuMaster = Store.getMenu();
  Object.values(itemSales).forEach(itemStat => {
    const menuItem = menuMaster.find(m => m.id === itemStat.id);
    if (menuItem) {
      itemStat.category = menuItem.category;
    }
  });

  // Convert to array and sort by quantity sold descending
  const sortedSales = Object.values(itemSales).sort((a, b) => b.qtySold - a.qtySold);

  const tbody = document.getElementById('menu-analysis-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (sortedSales.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px;">Tidak ada data penjualan menu pada periode ini.</td></tr>';
    return;
  }

  sortedSales.forEach((item, index) => {
    const rank = index + 1;
    let rankHtml = `<span>${rank}</span>`;
    
    // Highlight top 3
    if (rank === 1) rankHtml = `<span style="background-color: #FFD700; color: #000; padding: 4px 8px; border-radius: 4px; font-weight: bold;">🥇 1</span>`;
    else if (rank === 2) rankHtml = `<span style="background-color: #C0C0C0; color: #000; padding: 4px 8px; border-radius: 4px; font-weight: bold;">🥈 2</span>`;
    else if (rank === 3) rankHtml = `<span style="background-color: #CD7F32; color: #FFF; padding: 4px 8px; border-radius: 4px; font-weight: bold;">🥉 3</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: center;">${rankHtml}</td>
      <td style="font-weight: 600;">${item.name}</td>
      <td><span style="background-color: var(--color-surface-variant); padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${item.category}</span></td>
      <td style="text-align: center; font-weight: 600; color: var(--color-accent);">${item.qtySold}</td>
      <td style="text-align: right; font-weight: 600;">Rp ${item.revenue.toLocaleString('id-ID')}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSalesTable(baseOrders) {
  const orders = baseOrders || Store.getOrders();
  const searchInput = document.getElementById('sales-search');
  const statusFilter = document.getElementById('sales-filter-status');
  const tbody = document.getElementById('sales-table-body');
  
  if (!tbody) return;

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const statusTerm = statusFilter ? statusFilter.value : 'ALL';

  // Filter orders
  let filteredOrders = orders.filter(order => {
    const matchSearch = order.id.toLowerCase().includes(searchTerm) || order.customerName.toLowerCase().includes(searchTerm);
    const matchStatus = statusTerm === 'ALL' || order.status === statusTerm;
    return matchSearch && matchStatus;
  });

  // Sort descending by timestamp
  filteredOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  tbody.innerHTML = '';

  if (filteredOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 24px;">Tidak ada data penjualan.</td></tr>';
    return;
  }

  filteredOrders.forEach((order, index) => {
    const timeStr = new Date(order.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date(order.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const no = filteredOrders.length - index;
    const originalIndex = orders.findIndex(o => o.id === order.id);
    const orderNumber = originalIndex + 1;

    let statusStyle = '';
    if (order.status === 'Diterima') statusStyle = 'color: var(--color-primary); font-weight: 600;';
    else if (order.status === 'Dimasak') statusStyle = 'color: var(--color-accent); font-weight: 600;';
    else if (order.status === 'Siap') statusStyle = 'color: var(--color-success); font-weight: 600;';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${orderNumber}</td>
      <td style="font-family: monospace;">${order.id}</td>
      <td>${dateStr}</td>
      <td>${timeStr}</td>
      <td style="font-weight: 600;">${order.customerName}</td>
      <td>Meja ${order.table}</td>
      <td style="font-weight: 600;">Rp ${order.total.toLocaleString('id-ID')}</td>
      <td style="${statusStyle}">${order.status}</td>
      <td>
        <button class="btn btn-outline" style="padding: 4px 12px; font-size: 12px;" onclick="viewOrderDetails('${order.id}', event)">Detail</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.viewOrderDetails = function(orderId, event) {
  const orders = Store.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  document.getElementById('modal-order-id').textContent = `Order ${order.id}`;
  document.getElementById('modal-customer-name').textContent = order.customerName;
  document.getElementById('modal-table-num').textContent = order.table;
  document.getElementById('modal-order-total').textContent = `Rp ${order.total.toLocaleString('id-ID')}`;

  const itemsContainer = document.getElementById('modal-order-items');
  itemsContainer.innerHTML = '';

  order.items.forEach(item => {
    let noteHtml = '';
    if (item.sugar && item.sugar !== 'Normal') noteHtml += `<div style="font-size: 12px; color: var(--color-text-muted);">Gula: ${item.sugar}</div>`;
    if (item.note) noteHtml += `<div style="font-size: 12px; color: var(--color-text-muted);">Catatan: ${item.note}</div>`;

    const itemRow = document.createElement('div');
    itemRow.style.display = 'flex';
    itemRow.style.justifyContent = 'space-between';
    itemRow.style.alignItems = 'flex-start';
    itemRow.style.padding = '8px';
    itemRow.style.backgroundColor = 'var(--color-surface-container)';
    itemRow.style.borderRadius = 'var(--radius-sm)';

    itemRow.innerHTML = `
      <div>
        <div style="font-weight: 600; font-size: 14px;">${item.qty}x ${item.name}</div>
        ${noteHtml}
      </div>
      <div style="font-weight: 600; font-size: 14px;">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</div>
    `;
    itemsContainer.appendChild(itemRow);
  });

  const modal = document.getElementById('order-detail-modal');
  const modalContent = modal.querySelector('.modal-content');
  modal.style.display = 'flex';

  if (event && event.currentTarget) {
    const btnRect = event.currentTarget.getBoundingClientRect();
    const btnCenterX = btnRect.left + (btnRect.width / 2);
    const btnCenterY = btnRect.top + (btnRect.height / 2);
    
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    
    const translateX = btnCenterX - screenCenterX;
    const translateY = btnCenterY - screenCenterY;
    
    modalContent.animate([
      { transform: `translate(${translateX}px, ${translateY}px) scale(0.1)`, opacity: 0 },
      { transform: `translate(0px, 0px) scale(1)`, opacity: 1 }
    ], {
      duration: 350,
      easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
      fill: 'forwards'
    });
  }
};

// Setup Event Listeners for Filters
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('sales-search');
  const statusFilter = document.getElementById('sales-filter-status');
  if (searchInput) searchInput.addEventListener('input', () => renderSalesTable());
  if (statusFilter) statusFilter.addEventListener('change', () => renderSalesTable());
});

function renderMenuTable() {
  const menus = Store.getMenu();
  const tbody = document.getElementById('menu-table-body');
  if(!tbody) return;
  tbody.innerHTML = '';

  menus.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="font-weight: 600;">${item.name}</div>
      </td>
      <td>
        <span style="background-color: var(--color-surface-variant); padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${item.category}</span>
      </td>
      <td>Rp ${item.price.toLocaleString('id-ID')}</td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox" ${item.available ? 'checked' : ''} onchange="toggleMenu('${item.id}', this.checked)">
          <span class="slider"></span>
        </label>
      </td>
      <td>
        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;">Edit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.toggleMenu = function (id, isAvailable) {
  Store.updateMenu(id, { available: isAvailable });
};
