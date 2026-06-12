import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { Store } from './store.js';

let salesChartInstance = null;
let ordersChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  await Store.applyGlobalTheme();
  if (!Store.isAuthenticated()) {
    window.location.replace('/login.html');
    return;
  }
  renderMenuTable();

  Store.subscribe(() => {
    renderMenuTable();
  });

  // Modal event listener
  const closeModalBtn = document.getElementById('close-order-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('order-detail-modal').style.display = 'none';
    });
  }

  setupSorting();
  initCustomSelects();

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      await Store.logout();
      window.location.replace('/login.html');
    });
  }
});

function initCustomSelects() {
  document.querySelectorAll('select.filter-modern').forEach(select => {
    if (select.closest('.custom-select-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    if (select.style.width) wrapper.style.width = select.style.width;
    if (select.style.display) wrapper.style.display = select.style.display;

    select.style.display = 'none';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    // Inherit specific inline styles to make it look like a form input if specified
    if (select.style.border) trigger.style.border = select.style.border;
    if (select.style.padding) trigger.style.padding = select.style.padding;
    if (select.style.borderRadius) trigger.style.borderRadius = select.style.borderRadius;
    if (select.style.minHeight) trigger.style.minHeight = select.style.minHeight;
    
    const triggerText = document.createElement('span');
    triggerText.textContent = select.options[select.selectedIndex]?.textContent || '';
    
    const triggerIcon = document.createElement('span');
    triggerIcon.className = 'material-symbols-outlined';
    triggerIcon.style.fontSize = '18px';
    triggerIcon.style.color = 'var(--color-text-muted)';
    triggerIcon.textContent = 'expand_more';

    trigger.appendChild(triggerText);
    trigger.appendChild(triggerIcon);
    wrapper.appendChild(trigger);

    const dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown';
    wrapper.appendChild(dropdown);

    function renderOptions() {
      dropdown.innerHTML = '';
      Array.from(select.options).forEach(option => {
        const optEl = document.createElement('div');
        optEl.className = 'custom-select-option';
        if (option.selected) optEl.classList.add('selected');
        optEl.textContent = option.textContent;
        
        optEl.addEventListener('click', (e) => {
          e.stopPropagation();
          select.value = option.value;
          triggerText.textContent = option.textContent;
          wrapper.classList.remove('open');
          
          dropdown.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('selected'));
          optEl.classList.add('selected');

          select.dispatchEvent(new Event('change', { bubbles: true }));
        });
        dropdown.appendChild(optEl);
      });
    }

    renderOptions();

    const observer = new MutationObserver(() => {
      renderOptions();
      triggerText.textContent = select.options[select.selectedIndex]?.textContent || '';
    });
    observer.observe(select, { childList: true });

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
        if (w !== wrapper) w.classList.remove('open');
      });
      wrapper.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
      }
    });
  });
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.sidebar-item');
  const views = document.querySelectorAll('.admin-view');

  function handleRoute() {
    const hash = window.location.hash || '#dashboard';
    const targetId = hash.substring(1);
    
    navItems.forEach(item => {
      if (item.getAttribute('href') === hash) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    views.forEach(view => {
      if (view.id === `view-${targetId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
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

  const toggleVisibility = (el, display) => {
    const wrapper = el.closest('.custom-select-wrapper');
    if (wrapper) wrapper.style.display = display;
    else el.style.display = display;
  };

  modeSelect.addEventListener('change', (e) => {
    inputDaily.style.display = 'none';
    inputMonthly.style.display = 'none';
    toggleVisibility(inputYearly, 'none');
    inputRange.style.display = 'none';

    if (e.target.value === 'daily') inputDaily.style.display = 'block';
    if (e.target.value === 'monthly') inputMonthly.style.display = 'block';
    if (e.target.value === 'yearly') toggleVisibility(inputYearly, 'block');
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

  const toggleVisibilityMenu = (el, display) => {
    const wrapper = el.closest('.custom-select-wrapper');
    if (wrapper) wrapper.style.display = display;
    else el.style.display = display;
  };

  modeSelect.addEventListener('change', (e) => {
    inputDaily.style.display = 'none';
    inputMonthly.style.display = 'none';
    toggleVisibilityMenu(inputYearly, 'none');
    inputRange.style.display = 'none';

    if (e.target.value === 'daily') inputDaily.style.display = 'inline-block';
    if (e.target.value === 'monthly') inputMonthly.style.display = 'inline-block';
    if (e.target.value === 'yearly') toggleVisibilityMenu(inputYearly, 'inline-block');
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

async function renderDashboard() {
  const allOrders = await Store.getOrders();
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

  // Chart Logic
  const mode = document.getElementById('global-filter-mode').value;
  const salesChartWrapper = document.getElementById('salesChartWrapper');
  const salesChartEmptyState = document.getElementById('chart-empty-state');
  const ordersChartWrapper = document.getElementById('ordersChartWrapper');
  const ordersChartEmptyState = document.getElementById('orders-chart-empty-state');
  
  if (salesChartWrapper && ordersChartWrapper) {
    if (mode === 'daily') {
      salesChartWrapper.style.display = 'none';
      salesChartEmptyState.style.display = 'flex';
      ordersChartWrapper.style.display = 'none';
      ordersChartEmptyState.style.display = 'flex';
      
      // Destroy charts if exists to free memory
      if (salesChartInstance) {
        salesChartInstance.destroy();
        salesChartInstance = null;
      }
      if (ordersChartInstance) {
        ordersChartInstance.destroy();
        ordersChartInstance = null;
      }
    } else {
      salesChartWrapper.style.display = 'block';
      salesChartEmptyState.style.display = 'none';
      ordersChartWrapper.style.display = 'block';
      ordersChartEmptyState.style.display = 'none';
      
      renderSalesChart(globalFilteredOrders);
      renderOrdersChart(globalFilteredOrders);
    }
  }

  // Render Sales Table with filtered data
  renderSalesTable(globalFilteredOrders);
}

function renderSalesChart(orders) {
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;

  // Aggregate by day
  const dailyData = {};
  orders.forEach(o => {
    // Format timestamp to local date string (YYYY-MM-DD)
    const dateObj = new Date(o.timestamp);
    const dateKey = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        timestamp: dateObj.setHours(0,0,0,0), // For sorting
        revenue: 0
      };
    }
    dailyData[dateKey].revenue += o.total;
  });

  // Sort by timestamp
  const sortedKeys = Object.keys(dailyData).sort((a, b) => dailyData[a].timestamp - dailyData[b].timestamp);
  
  const labels = sortedKeys;
  const dataPoints = sortedKeys.map(k => dailyData[k].revenue);

  if (salesChartInstance) {
    salesChartInstance.destroy();
  }

  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#AF8C53';

  salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pendapatan',
        data: dataPoints,
        borderColor: primaryColor,
        backgroundColor: 'rgba(175, 140, 83, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: primaryColor,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Rp ' + context.parsed.y.toLocaleString('id-ID');
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'Rp ' + value.toLocaleString('id-ID');
            }
          }
        }
      }
    }
  });
}

function renderOrdersChart(orders) {
  const ctx = document.getElementById('ordersChart');
  if (!ctx) return;

  const dailyData = {};
  orders.forEach(o => {
    const dateObj = new Date(o.timestamp);
    const dateKey = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        timestamp: dateObj.setHours(0,0,0,0),
        count: 0
      };
    }
    dailyData[dateKey].count += 1;
  });

  const sortedKeys = Object.keys(dailyData).sort((a, b) => dailyData[a].timestamp - dailyData[b].timestamp);
  
  const labels = sortedKeys;
  const dataPoints = sortedKeys.map(k => dailyData[k].count);

  if (ordersChartInstance) {
    ordersChartInstance.destroy();
  }

  // Recommended blue color for orders
  const primaryColor = '#3b82f6';

  ordersChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Pesanan',
        data: dataPoints,
        borderColor: primaryColor,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: primaryColor,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.y + ' Pesanan';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return value;
            }
          }
        }
      }
    }
  });
}

async function renderDashboardMenu() {
  const allOrders = await Store.getOrders();
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
  const menuMaster = await Store.getMenu();
  Object.values(itemSales).forEach(itemStat => {
    const menuItem = menuMaster.find(m => m.id === itemStat.id);
    if (menuItem) {
      itemStat.category = menuItem.category;
    }
  });

  // Convert to array and sort based on state
  let sortedSales = Object.values(itemSales);

  sortedSales.sort((a, b) => {
    let valA, valB;
    switch(sortStateMenu.col) {
      case 'rank':
      case 'qty':
        valA = a.qtySold; valB = b.qtySold; break;
      case 'name':
        valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
      case 'category':
        valA = a.category.toLowerCase(); valB = b.category.toLowerCase(); break;
      case 'revenue':
        valA = a.revenue; valB = b.revenue; break;
      default:
        valA = a.qtySold; valB = b.qtySold;
    }
    if (valA < valB) return sortStateMenu.dir === 'asc' ? -1 : 1;
    if (valA > valB) return sortStateMenu.dir === 'asc' ? 1 : -1;
    return 0;
  });

  // Apply filters
  const analysisSearch = document.getElementById('analysis-search');
  const analysisCat = document.getElementById('analysis-filter-category');
  
  const searchTerm = analysisSearch ? analysisSearch.value.toLowerCase() : '';
  const catTerm = analysisCat ? analysisCat.value : 'ALL';

  if (searchTerm || catTerm !== 'ALL') {
    sortedSales = sortedSales.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm);
      const matchCat = catTerm === 'ALL' || item.category === catTerm;
      return matchSearch && matchCat;
    });
  }

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

async function renderSalesTable(baseOrders) {
  const orders = baseOrders || getGlobalFilteredOrders(await Store.getOrders());
  const menus = await Store.getMenu();
  const searchInput = document.getElementById('sales-search');
  const catFilter = document.getElementById('sales-filter-category');
  const tbody = document.getElementById('sales-table-body');
  
  if (!tbody) return;

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const catTerm = catFilter ? catFilter.value : 'ALL';

  // Filter orders
  let filteredOrders = orders.filter(order => {
    const matchIdOrName = order.id.toLowerCase().includes(searchTerm) || order.customerName.toLowerCase().includes(searchTerm);
    const matchItem = order.items.some(item => item.name.toLowerCase().includes(searchTerm));
    const matchSearch = matchIdOrName || matchItem;
    
    const matchCat = catTerm === 'ALL' || order.items.some(item => {
      const menuItem = menus.find(m => m.id === item.id);
      return menuItem && menuItem.category === catTerm;
    });

    return matchSearch && matchCat;
  });

  // Sort based on state
  filteredOrders.sort((a, b) => {
    let valA, valB;
    switch(sortStateSales.col) {
      case 'no':
      case 'date':
      case 'time':
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
        break;
      case 'id':
        valA = a.id; valB = b.id; break;
      case 'customer':
        valA = a.customerName.toLowerCase(); valB = b.customerName.toLowerCase(); break;
      case 'table':
        valA = a.table; valB = b.table; break;
      case 'total':
        valA = a.total; valB = b.total; break;
      case 'status':
        valA = a.status; valB = b.status; break;
      default:
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
    }
    
    if (valA < valB) return sortStateSales.dir === 'asc' ? -1 : 1;
    if (valA > valB) return sortStateSales.dir === 'asc' ? 1 : -1;
    return 0;
  });

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

window.viewOrderDetails = async function(orderId, event) {
  const orders = await Store.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  // Calculate daily queue number
  const orderDateStr = new Date(order.timestamp).toDateString();
  const sameDayOrders = orders.filter(o => new Date(o.timestamp).toDateString() === orderDateStr);
  sameDayOrders.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort chronological
  const queueNo = sameDayOrders.findIndex(o => o.id === order.id) + 1;

  document.getElementById('modal-order-id').textContent = `Order ${order.id}`;
  const queueEl = document.getElementById('modal-queue-num');
  if (queueEl) queueEl.textContent = `#${queueNo}`;
  
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
document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('sales-search');
  const salesCatFilter = document.getElementById('sales-filter-category');
  if (searchInput) searchInput.addEventListener('input', () => renderSalesTable());
  if (salesCatFilter) salesCatFilter.addEventListener('change', () => renderSalesTable());

  const menus = await Store.getMenu();

  const analysisSearch = document.getElementById('analysis-search');
  const analysisCat = document.getElementById('analysis-filter-category');
  if (analysisSearch) analysisSearch.addEventListener('input', renderDashboardMenu);
  if (analysisCat) analysisCat.addEventListener('change', renderDashboardMenu);

  const manageMenuSearch = document.getElementById('manage-menu-search');
  if (manageMenuSearch) manageMenuSearch.addEventListener('input', renderMenuTable);

  // Populate category options
  const categories = [...new Set(menus.map(m => m.category))];
  
  if (analysisCat) {
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      analysisCat.appendChild(opt);
    });
  }
  
  if (salesCatFilter) {
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      salesCatFilter.appendChild(opt);
    });
  }
});

async function renderMenuTable() {
  const menus = await Store.getMenu();
  const searchInput = document.getElementById('manage-menu-search');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  
  const filteredMenus = menus.filter(item => 
    item.name.toLowerCase().includes(searchTerm)
  );

  const tbody = document.getElementById('menu-table-body');
  if(!tbody) return;
  tbody.innerHTML = '';

  if (filteredMenus.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px;">Tidak ada menu yang sesuai.</td></tr>';
    return;
  }

  filteredMenus.forEach(item => {
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
          <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="openEditMenu('${item.id}')">Edit</button>
          <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; border-color: var(--color-error); color: var(--color-error);" onclick="deleteMenu('${item.id}')">Hapus</button>
        </td>
    `;
    tbody.appendChild(tr);
  });
}

window.toggleMenu = async function (id, isAvailable) {
  await Store.updateMenu(id, { available: isAvailable });
};

// Sorting Logic State
let sortStateSales = { col: 'date', dir: 'desc' };
let sortStateMenu = { col: 'qty', dir: 'desc' };

function setupSorting() {
  document.querySelectorAll('#view-dashboard .sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (sortStateSales.col === col) {
        sortStateSales.dir = sortStateSales.dir === 'asc' ? 'desc' : 'asc';
      } else {
        sortStateSales.col = col;
        sortStateSales.dir = 'asc';
      }
      updateSortIcons('#view-dashboard', sortStateSales);
      renderSalesTable();
    });
  });

  document.querySelectorAll('#view-dashboard-menu .sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (sortStateMenu.col === col) {
        sortStateMenu.dir = sortStateMenu.dir === 'asc' ? 'desc' : 'asc';
      } else {
        sortStateMenu.col = col;
        sortStateMenu.dir = 'asc';
      }
      updateSortIcons('#view-dashboard-menu', sortStateMenu);
      renderDashboardMenu();
    });
  });
}

function updateSortIcons(containerSelector, state) {
  document.querySelectorAll(`${containerSelector} .sortable`).forEach(th => {
    th.classList.remove('active');
    const icon = th.querySelector('.sort-icon');
    if(icon) icon.textContent = 'swap_vert';
    
    if (th.dataset.sort === state.col) {
      th.classList.add('active');
      icon.textContent = state.dir === 'asc' ? 'arrow_upward' : 'arrow_downward';
    }
  });
}

// =======================
// MODIFIER GROUPS BUILDER HELPERS
// =======================

function createModifierOptionRowHTML(name = '', price = 0) {
  return `
    <div class="modifier-option-row">
      <span class="material-symbols-outlined drag-handle">drag_indicator</span>
      <input type="text" class="filter-modern option-name-input" placeholder="Nama Opsi (cth: Large)" required value="${name}">
      <div class="price-input-wrapper">
        <span class="price-prefix">+Rp</span>
        <input type="text" inputmode="numeric" class="filter-modern option-price-input price-format" placeholder="0" required value="${price ? parseInt(price).toLocaleString('id-ID') : ''}">
      </div>
      <button type="button" class="btn-remove-option-row" title="Hapus Opsi">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  `;
}

function createModifierGroupCardHTML(groupId, group = { name: '', type: 'single', options: [] }) {
  const optionsHtml = (group.options && group.options.length > 0)
    ? group.options.map(opt => createModifierOptionRowHTML(opt.name, opt.priceAdd)).join('')
    : createModifierOptionRowHTML('', 0);

  return `
    <div class="modifier-group-card animate-slide-up" id="${groupId}">
      <div class="group-header">
        <input type="text" class="filter-modern group-name-input" placeholder="Nama Spesifikasi (cth: Pilihan Ukuran)" required value="${group.name}">
        <button type="button" class="btn-remove-group" title="Hapus Spesifikasi">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
      <div class="type-selector">
        <label class="type-chip">
          <input type="radio" name="type_${groupId}" value="single" ${group.type === 'single' ? 'checked' : ''}>
          <span class="chip-label">Pilihan Tunggal</span>
        </label>
        <label class="type-chip">
          <input type="radio" name="type_${groupId}" value="multi" ${group.type !== 'single' ? 'checked' : ''}>
          <span class="chip-label">Pilihan Ganda</span>
        </label>
      </div>
      <div class="modifier-options-container">
        ${optionsHtml}
      </div>
      <button type="button" class="btn btn-outline btn-add-option-row">
        <span class="material-symbols-outlined">add</span> Tambah Opsi
      </button>
    </div>
  `;
}

function updateModifierEmptyState(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const cards = container.querySelectorAll('.modifier-group-card');
  const existingEmpty = container.querySelector('.modifier-empty-state');
  
  if (cards.length === 0) {
    if (!existingEmpty) {
      container.innerHTML = `
        <div class="modifier-empty-state">
          <span class="material-symbols-outlined">tune</span>
          <p>Belum ada spesifikasi kustom untuk menu ini.</p>
          <span>Klik "+ Tambah Spesifikasi" di atas untuk membuat baru.</span>
        </div>
      `;
    }
  } else {
    if (existingEmpty) {
      existingEmpty.remove();
    }
  }
}

function addModifierGroupCard(containerId, group = { name: '', type: 'single', options: [] }) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Remove empty state if present
  const emptyState = container.querySelector('.modifier-empty-state');
  if (emptyState) {
    container.innerHTML = '';
  }
  
  const groupId = 'mod-group-' + Date.now() + Math.random().toString(36).substr(2, 9);
  const cardHtml = createModifierGroupCardHTML(groupId, group);
  container.insertAdjacentHTML('beforeend', cardHtml);
}

function setupModifierFormEvents(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.addEventListener('click', (e) => {
    // 1. Tambah Opsi click
    const btnAddOption = e.target.closest('.btn-add-option-row');
    if (btnAddOption) {
      e.preventDefault();
      const card = btnAddOption.closest('.modifier-group-card');
      const optionsContainer = card.querySelector('.modifier-options-container');
      if (optionsContainer) {
        const rowHtml = createModifierOptionRowHTML('', 0);
        optionsContainer.insertAdjacentHTML('beforeend', rowHtml);
      }
      return;
    }

    // 2. Hapus Opsi click
    const btnRemoveOption = e.target.closest('.btn-remove-option-row');
    if (btnRemoveOption) {
      e.preventDefault();
      const row = btnRemoveOption.closest('.modifier-option-row');
      if (row) {
        row.remove();
      }
      return;
    }

    // 3. Hapus Grup click
    const btnRemoveGroup = e.target.closest('.btn-remove-group');
    if (btnRemoveGroup) {
      e.preventDefault();
      const card = btnRemoveGroup.closest('.modifier-group-card');
      if (card) {
        card.remove();
        updateModifierEmptyState(containerId);
      }
      return;
    }
  });
}

function collectModifierGroups(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  
  const modifierGroups = [];
  const groupCards = container.querySelectorAll('.modifier-group-card');
  
  groupCards.forEach(card => {
    const groupNameInput = card.querySelector('.group-name-input');
    if (!groupNameInput) return;
    
    const groupName = groupNameInput.value.trim();
    if (!groupName) return;
    
    // Get type
    const typeInput = card.querySelector('input[type="radio"]:checked');
    const type = typeInput ? typeInput.value : 'single';
    
    const options = [];
    card.querySelectorAll('.modifier-option-row').forEach(row => {
      const optNameInput = row.querySelector('.option-name-input');
      const optPriceInput = row.querySelector('.option-price-input');
      if (optNameInput && optPriceInput) {
        const optName = optNameInput.value.trim();
        const optPrice = parseInt(optPriceInput.value.replace(/\D/g, '')) || 0;
        if (optName) {
          options.push({ name: optName, priceAdd: optPrice });
        }
      }
    });
    
    if (options.length > 0) {
      modifierGroups.push({
        name: groupName,
        type: type,
        required: type === 'single',
        options: options
      });
    }
  });
  
  return modifierGroups;
}

// =======================
// EDIT MENU LOGIC
// =======================
window.openEditMenu = async function(id) {
  const menus = await Store.getMenu();
  const menu = menus.find(m => m.id === id);
  if (!menu) return;

  await renderCategoryOptions('edit-menu-category');

  document.getElementById('edit-menu-id').value = menu.id;
  document.getElementById('edit-menu-name').value = menu.name;
  document.getElementById('edit-menu-category').value = menu.category;
  document.getElementById('edit-menu-price').value = menu.price ? menu.price.toLocaleString('id-ID') : '';
  document.getElementById('edit-menu-desc').value = menu.desc;
  
  const preview = document.getElementById('edit-menu-preview');
  if (menu.image) {
    preview.src = menu.image;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }

  const container = document.getElementById('modifier-groups-container-edit');
  if (container) {
    container.innerHTML = '';
    if (menu.modifierGroups && menu.modifierGroups.length > 0) {
      menu.modifierGroups.forEach(group => {
        addModifierGroupCard('modifier-groups-container-edit', group);
      });
    } else {
      updateModifierEmptyState('modifier-groups-container-edit');
    }
  }

  const viewMenu = document.getElementById('view-menu');
  const viewEdit = document.getElementById('view-edit-menu');
  
  if (viewMenu && viewEdit) {
    viewMenu.classList.remove('active');
    viewEdit.classList.add('active');
  }
};

// =======================
// CATEGORY MANAGEMENT
// =======================
window.renderCategoryOptions = async function(selectId = 'add-menu-category') {
  const selectEl = document.getElementById(selectId);
  if (!selectEl) return;
  const categories = await Store.getCategories();
  selectEl.innerHTML = '<option value="" disabled selected>Pilih kategori menu</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    selectEl.appendChild(opt);
  });
};

window.setupCategoryManager = function() {
  const btnKelola = document.getElementById('btn-kelola-kategori');
  const btnBack = document.getElementById('btn-back-kategori');
  const viewManage = document.getElementById('view-manage-categories');
  const viewMenu = document.getElementById('view-menu');

  if (btnKelola) {
    btnKelola.addEventListener('click', async () => {
      if(viewMenu) viewMenu.classList.remove('active');
      if(viewManage) viewManage.classList.add('active');
      renderCategoryManagerTable();
    });
  }

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if(viewManage) viewManage.classList.remove('active');
      if(viewMenu) viewMenu.classList.add('active');
    });
  }

  const btnAdd = document.getElementById('btn-add-category');
  if (btnAdd) {
    btnAdd.addEventListener('click', async () => {
      const input = document.getElementById('new-category-name');
      const name = input.value.trim();
      if (name) {
        const categories = await Store.getCategories();
        if (!categories.includes(name)) {
          categories.push(name);
          await Store.saveCategories(categories);
          input.value = '';
          renderCategoryManagerTable();
        } else {
          alert('Kategori sudah ada!');
        }
      }
    });
  }
};

window.renderCategoryManagerTable = async function() {
  const tbody = document.getElementById('category-table-body');
  if (!tbody) return;
  const categories = await Store.getCategories();
  
  if (categories.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Belum ada kategori.</td></tr>';
    return;
  }

  tbody.innerHTML = categories.map((cat, index) => `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      <td>
        <input type="text" class="filter-modern" value="${cat}" onchange="updateCategoryName(${index}, this.value)" style="width: 100%; border: 1px solid transparent; padding: 4px;">
      </td>
      <td style="text-align: center; display: flex; gap: 4px; justify-content: center;">
        <button class="btn-icon" onclick="moveCategory(${index}, -1)" ${index === 0 ? 'disabled' : ''} title="Geser ke Atas">
          <span class="material-symbols-outlined" style="font-size: 18px;">arrow_upward</span>
        </button>
        <button class="btn-icon" onclick="moveCategory(${index}, 1)" ${index === categories.length - 1 ? 'disabled' : ''} title="Geser ke Bawah">
          <span class="material-symbols-outlined" style="font-size: 18px;">arrow_downward</span>
        </button>
        <button class="btn-icon" onclick="deleteCategory(${index})" title="Hapus Kategori" style="color: #dc3545;">
          <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
};

window.updateCategoryName = async function(index, newName) {
  newName = newName.trim();
  if (!newName) return;
  const categories = await Store.getCategories();
  const oldName = categories[index];
  
  if (newName !== oldName && categories.includes(newName)) {
    alert('Nama kategori sudah digunakan!');
    renderCategoryManagerTable(); // revert
    return;
  }

  categories[index] = newName;
  await Store.saveCategories(categories);
  
  // Update all menus that used the old category name
  const menus = await Store.getMenu();
  let menuUpdated = false;
  menus.forEach(async m => {
    if (m.category === oldName) {
      await Store.updateMenu(m.id, { category: newName });
      menuUpdated = true;
    }
  });

  if (!menuUpdated) {
    // Manually render table if no menu was updated (since updateMenu fires storage event)
    renderCategoryManagerTable();
  }
};

window.moveCategory = async function(index, direction) {
  const categories = await Store.getCategories();
  if (index + direction < 0 || index + direction >= categories.length) return;

  // Swap elements
  const temp = categories[index];
  categories[index] = categories[index + direction];
  categories[index + direction] = temp;

  await Store.saveCategories(categories);
  renderCategoryManagerTable();
};

window.deleteCategory = async function(index) {
  const categories = await Store.getCategories();
  const catName = categories[index];
  
  // Check if any menus are using this category
  const menus = await Store.getMenu();
  const menusUsingCat = menus.filter(m => m.category === catName);
  
  if (menusUsingCat.length > 0) {
    alert(`Tidak bisa menghapus kategori ini karena masih digunakan oleh ${menusUsingCat.length} menu. Pindahkan menu ke kategori lain terlebih dahulu.`);
    return;
  }

  if (confirm(`Hapus kategori "${catName}"?`)) {
    categories.splice(index, 1);
    await Store.saveCategories(categories);
    renderCategoryManagerTable();
  }
};

// ADD MENU & EDIT MENU LOGIC
document.addEventListener('DOMContentLoaded', () => {
  setupCategoryManager();

  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('price-format') || e.target.classList.contains('option-price-input')) {
      let val = e.target.value.replace(/\D/g, '');
      if (val === '') {
        e.target.value = '';
      } else {
        e.target.value = parseInt(val, 10).toLocaleString('id-ID');
      }
    }
  });
  const btnTambah = document.getElementById('btn-tambah-menu');
  const btnCancelAdd = document.getElementById('btn-cancel-add-menu');
  const btnCancelEdit = document.getElementById('btn-cancel-edit-menu');
  
  if (btnTambah) {
    btnTambah.addEventListener('click', () => {
      renderCategoryOptions('add-menu-category');
      
      // Reset modifiers
      const containerAdd = document.getElementById('modifier-groups-container-add');
      if (containerAdd) {
        containerAdd.innerHTML = '';
        updateModifierEmptyState('modifier-groups-container-add');
      }
      
      document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-add-menu').classList.add('active');
    });
  }

  if (btnCancelAdd) {
    btnCancelAdd.addEventListener('click', () => {
      document.getElementById('add-menu-form').reset();
      document.getElementById('add-menu-preview').style.display = 'none';
      document.getElementById('view-add-menu').classList.remove('active');
      document.getElementById('view-menu').classList.add('active');
    });
  }

  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
      document.getElementById('edit-menu-form').reset();
      document.getElementById('edit-menu-preview').style.display = 'none';
      document.getElementById('view-edit-menu').classList.remove('active');
      document.getElementById('view-menu').classList.add('active');
    });
  }

  let currentCropper = null;
  let currentPreviewTarget = null;

  const openCropperModal = (file, previewTargetId) => {
    if (currentCropper) {
      currentCropper.destroy();
      currentCropper = null;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const cropTarget = document.getElementById('crop-image-target');
      cropTarget.src = e.target.result;
      document.getElementById('crop-image-modal').style.display = 'flex';
      
      currentPreviewTarget = previewTargetId;
      
      setTimeout(() => {
        currentCropper = new Cropper(cropTarget, {
          aspectRatio: 1, // 1:1 Square
          viewMode: 1,
        });
      }, 100);
    };
    reader.readAsDataURL(file);
  };

  const addImageInput = document.getElementById('add-menu-image');
  if (addImageInput) {
    addImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) openCropperModal(file, 'add-menu-preview');
    });
  }

  const editImageInput = document.getElementById('edit-menu-image');
  if (editImageInput) {
    editImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) openCropperModal(file, 'edit-menu-preview');
    });
  }

  const closeCrop = () => {
    document.getElementById('crop-image-modal').style.display = 'none';
    if (currentCropper) {
      currentCropper.destroy();
      currentCropper = null;
    }
    document.getElementById('add-menu-image').value = '';
    document.getElementById('edit-menu-image').value = '';
  };

  document.getElementById('btn-cancel-crop')?.addEventListener('click', closeCrop);
  document.getElementById('close-crop-modal')?.addEventListener('click', closeCrop);

  document.getElementById('btn-save-crop')?.addEventListener('click', () => {
    if (!currentCropper) return;
    const croppedImageBase64 = currentCropper.getCroppedCanvas({
      width: 600,
      height: 600,
      fillColor: '#fff',
    }).toDataURL('image/jpeg', 0.8);

    const preview = document.getElementById(currentPreviewTarget);
    if (preview) {
      preview.src = croppedImageBase64;
      preview.style.display = 'block';
    }
    document.getElementById('crop-image-modal').style.display = 'none';
    if (currentCropper) {
      currentCropper.destroy();
      currentCropper = null;
    }
  });

  // Setup modifier form add/edit button clicks & delegation events
  const btnAddGroupAdd = document.getElementById('btn-add-modifier-group-add');
  if (btnAddGroupAdd) {
    btnAddGroupAdd.addEventListener('click', () => {
      addModifierGroupCard('modifier-groups-container-add');
    });
  }

  const btnAddGroupEdit = document.getElementById('btn-add-modifier-group-edit');
  if (btnAddGroupEdit) {
    btnAddGroupEdit.addEventListener('click', () => {
      addModifierGroupCard('modifier-groups-container-edit');
    });
  }

  setupModifierFormEvents('modifier-groups-container-add');
  setupModifierFormEvents('modifier-groups-container-edit');

  const addForm = document.getElementById('add-menu-form');
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('add-menu-name').value.trim();
      const category = document.getElementById('add-menu-category').value.trim();
      const price = parseInt(document.getElementById('add-menu-price').value.replace(/\D/g, '')) || 0;
      const desc = document.getElementById('add-menu-desc').value.trim();
      const imgPreview = document.getElementById('add-menu-preview');
      const img = imgPreview.style.display === 'block' ? imgPreview.src : '';

      const modifierGroups = collectModifierGroups('modifier-groups-container-add');

      const id = name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 10) + '_' + Date.now().toString().slice(-4);

      await Store.addMenu({
        id: id,
        name: name,
        category: category,
        price: price,
        desc: desc,
        image: img,
        modifierGroups: modifierGroups,
        available: true
      });

      const categories = await Store.getCategories();
      if (!categories.includes(category)) {
        categories.push(category);
        await Store.saveCategories(categories);
      }

      alert('Menu berhasil ditambahkan!');
      addForm.reset();
      imgPreview.style.display = 'none';
      
      const containerAdd = document.getElementById('modifier-groups-container-add');
      if (containerAdd) {
        containerAdd.innerHTML = '';
        updateModifierEmptyState('modifier-groups-container-add');
      }

      document.getElementById('view-add-menu').classList.remove('active');
      document.getElementById('view-menu').classList.add('active');
      renderMenuTable();
    });
  }

  const editForm = document.getElementById('edit-menu-form');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-menu-id').value;
      const name = document.getElementById('edit-menu-name').value.trim();
      const category = document.getElementById('edit-menu-category').value.trim();
      const price = parseInt(document.getElementById('edit-menu-price').value.replace(/\D/g, '')) || 0;
      const desc = document.getElementById('edit-menu-desc').value.trim();
      
      const modifierGroups = collectModifierGroups('modifier-groups-container-edit');
      
      const updateData = { name, category, price, desc, modifierGroups };
      
      const imgPreview = document.getElementById('edit-menu-preview');
      if (imgPreview.style.display === 'block') {
        updateData.image = imgPreview.src;
      }

      await Store.updateMenu(id, updateData);

      const categories = await Store.getCategories();
      if (!categories.includes(category)) {
        categories.push(category);
        await Store.saveCategories(categories);
      }

      alert('Menu berhasil diupdate!');
      document.getElementById('view-edit-menu').classList.remove('active');
      document.getElementById('view-menu').classList.add('active');
      renderMenuTable();
    });
  }
});

async function renderCategoryOptionsDuplicate(datalistId) {
  const datalist = document.getElementById(datalistId);
  if (!datalist) return;
  datalist.innerHTML = '';
  (await Store.getCategories()).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    datalist.appendChild(opt);
  });
}

window.deleteMenu = async function(id) {
  if (confirm('Yakin ingin menghapus menu ini secara permanen?')) {
    await Store.deleteMenu(id);
    alert('Menu berhasil dihapus!');
    renderMenuTable();
  }
};
