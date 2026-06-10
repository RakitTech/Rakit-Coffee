import { Store } from './store.js';

let salesChartInstance = null;
let ordersChartInstance = null;

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

  setupSorting();
  initCustomSelects();
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

function renderSalesTable(baseOrders) {
  const orders = baseOrders || getGlobalFilteredOrders(Store.getOrders());
  const menus = Store.getMenu();
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

window.viewOrderDetails = function(orderId, event) {
  const orders = Store.getOrders();
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
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('sales-search');
  const salesCatFilter = document.getElementById('sales-filter-category');
  if (searchInput) searchInput.addEventListener('input', () => renderSalesTable());
  if (salesCatFilter) salesCatFilter.addEventListener('change', () => renderSalesTable());

  const menus = Store.getMenu();

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

function renderMenuTable() {
  const menus = Store.getMenu();
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

window.toggleMenu = function (id, isAvailable) {
  Store.updateMenu(id, { available: isAvailable });
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
// EDIT MENU LOGIC
// =======================
let editBase64Image = null;

window.openEditMenu = function(id) {
  const menus = Store.getMenu();
  const menu = menus.find(m => m.id === id);
  if (!menu) return;

  document.getElementById('edit-menu-id').value = menu.id;
  document.getElementById('edit-menu-name').value = menu.name;
  document.getElementById('edit-menu-category').value = menu.category;
  document.getElementById('edit-menu-price').value = menu.price;
  document.getElementById('edit-menu-desc').value = menu.desc;
  
  const preview = document.getElementById('edit-menu-preview');
  if (menu.image) {
    preview.src = menu.image;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
  editBase64Image = null;

  const container = document.getElementById('modifier-groups-container-edit');
  if (container) {
    container.innerHTML = '';
    if (menu.modifierGroups) {
      menu.modifierGroups.forEach(group => {
        const groupId = 'mod-group-edit-' + Date.now() + Math.random().toString(36).substr(2, 9);
        const groupHtml = `
          <div class="modifier-group-card" id="${groupId}" style="background: var(--color-surface-lowest); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-surface-variant);">
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
              <input type="text" class="filter-modern group-name-input" placeholder="Nama Grup (cth: Ukuran)" required style="flex-grow: 1; border: 1px solid var(--color-surface-variant); padding: 8px;" value="${group.name}">
              <button type="button" class="btn-icon" onclick="this.closest('.modifier-group-card').remove()" style="color: #dc3545;" title="Hapus Grup">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
            <div class="modifier-options-container" style="display: flex; flex-direction: column; gap: 8px;">
              ${group.options.map(opt => `
                <div class="modifier-option-row" style="display: flex; gap: 8px; align-items: center;">
                  <span class="material-symbols-outlined" style="color: var(--color-text-light); font-size: 16px;">drag_indicator</span>
                  <input type="text" class="filter-modern option-name-input" placeholder="Nama Opsi" required style="flex-grow: 1; border: 1px solid var(--color-surface-variant); padding: 6px;" value="${opt.name}">
                  <input type="number" class="filter-modern option-price-input" placeholder="Harga (Rp)" required style="width: 120px; border: 1px solid var(--color-surface-variant); padding: 6px;" min="0" value="${opt.priceAdd}">
                  <button type="button" class="btn-icon" onclick="this.closest('.modifier-option-row').remove()" style="color: var(--color-text-light); padding: 4px;">
                    <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
                  </button>
                </div>
              `).join('')}
            </div>
            <button type="button" class="btn btn-outline btn-add-option" style="margin-top: 12px; font-size: 12px; padding: 4px 12px; display: inline-flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined" style="font-size: 14px;">add</span> Tambah Opsi
            </button>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', groupHtml);
      });
    }
  }

  const viewMenu = document.getElementById('view-menu');
  const viewEdit = document.getElementById('view-edit-menu');
  
  if (viewMenu && viewEdit) {
    viewMenu.classList.remove('active');
    viewEdit.classList.add('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const editImageInput = document.getElementById('edit-menu-image');
  if (editImageInput) {
    editImageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        editBase64Image = event.target.result;
        const preview = document.getElementById('edit-menu-preview');
        preview.src = editBase64Image;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  const btnCancelEdit = document.getElementById('btn-cancel-edit-menu');
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
      const viewEdit = document.getElementById('view-edit-menu');
      const viewMenu = document.getElementById('view-menu');
      if (viewEdit) viewEdit.classList.remove('active');
      if (viewMenu) viewMenu.classList.add('active');
    });
  }

  const editForm = document.getElementById('edit-menu-form');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-menu-id').value;
      const modifierGroups = [];
      
      const container = document.getElementById('modifier-groups-container-edit');
      if (container) {
        const groupCards = container.querySelectorAll('.modifier-group-card');
        groupCards.forEach(card => {
          const groupName = card.querySelector('.group-name-input').value.trim();
          if (groupName) {
            const options = [];
            card.querySelectorAll('.modifier-option-row').forEach(row => {
              const optName = row.querySelector('.option-name-input').value.trim();
              const optPrice = parseInt(row.querySelector('.option-price-input').value) || 0;
              if (optName) {
                options.push({ name: optName, priceAdd: optPrice });
              }
            });
            if (options.length > 0) {
              modifierGroups.push({
                name: groupName,
                type: 'single',
                required: true,
                options: options
              });
            }
          }
        });
      }

      const updatedMenu = {
        name: document.getElementById('edit-menu-name').value.trim(),
        category: document.getElementById('edit-menu-category').value.trim(),
        price: parseInt(document.getElementById('edit-menu-price').value),
        desc: document.getElementById('edit-menu-desc').value.trim(),
        modifierGroups: modifierGroups
      };

      if (editBase64Image) {
        updatedMenu.image = editBase64Image;
      }

      Store.updateMenu(id, updatedMenu);
      alert('Perubahan menu berhasil disimpan!');
      
      const viewEdit = document.getElementById('view-edit-menu');
      const viewMenu = document.getElementById('view-menu');
      if (viewEdit) viewEdit.classList.remove('active');
      if (viewMenu) viewMenu.classList.add('active');
      if (typeof renderMenuTable === 'function') renderMenuTable();
    });
  }
});

// =======================
// CATEGORY MANAGEMENT
// =======================
window.renderCategoryOptions = function() {
  const datalist = document.getElementById('category-list-options');
  if (!datalist) return;
  const categories = Store.getCategories();
  datalist.innerHTML = categories.map(cat => `<option value="${cat}">`).join('');
};

window.setupCategoryManager = function() {
  const btnKelola = document.getElementById('btn-kelola-kategori');
  const btnBack = document.getElementById('btn-back-kategori');
  const viewManage = document.getElementById('view-manage-categories');
  const viewMenu = document.getElementById('view-menu');

  if (btnKelola) {
    btnKelola.addEventListener('click', () => {
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
    btnAdd.addEventListener('click', () => {
      const input = document.getElementById('new-category-name');
      const name = input.value.trim();
      if (name) {
        const categories = Store.getCategories();
        if (!categories.includes(name)) {
          categories.push(name);
          Store.saveCategories(categories);
          input.value = '';
          renderCategoryManagerTable();
        } else {
          alert('Kategori sudah ada!');
        }
      }
    });
  }
};

window.renderCategoryManagerTable = function() {
  const tbody = document.getElementById('category-table-body');
  if (!tbody) return;
  const categories = Store.getCategories();
  
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

window.updateCategoryName = function(index, newName) {
  newName = newName.trim();
  if (!newName) return;
  const categories = Store.getCategories();
  const oldName = categories[index];
  
  if (newName !== oldName && categories.includes(newName)) {
    alert('Nama kategori sudah digunakan!');
    renderCategoryManagerTable(); // revert
    return;
  }

  categories[index] = newName;
  Store.saveCategories(categories);
  
  // Update all menus that used the old category name
  const menus = Store.getMenu();
  let menuUpdated = false;
  menus.forEach(m => {
    if (m.category === oldName) {
      Store.updateMenu(m.id, { category: newName });
      menuUpdated = true;
    }
  });

  if (!menuUpdated) {
    // Manually render table if no menu was updated (since updateMenu fires storage event)
    renderCategoryManagerTable();
  }
};

window.moveCategory = function(index, direction) {
  const categories = Store.getCategories();
  if (index + direction < 0 || index + direction >= categories.length) return;

  // Swap elements
  const temp = categories[index];
  categories[index] = categories[index + direction];
  categories[index + direction] = temp;

  Store.saveCategories(categories);
  renderCategoryManagerTable();
};

window.deleteCategory = function(index) {
  const categories = Store.getCategories();
  const catName = categories[index];
  
  // Check if any menus are using this category
  const menus = Store.getMenu();
  const menusUsingCat = menus.filter(m => m.category === catName);
  
  if (menusUsingCat.length > 0) {
    alert(`Tidak bisa menghapus kategori ini karena masih digunakan oleh ${menusUsingCat.length} menu. Pindahkan menu ke kategori lain terlebih dahulu.`);
    return;
  }

  if (confirm(`Hapus kategori "${catName}"?`)) {
    categories.splice(index, 1);
    Store.saveCategories(categories);
    renderCategoryManagerTable();
  }
};

// ADD MENU & EDIT MENU LOGIC
document.addEventListener('DOMContentLoaded', () => {
  const btnTambah = document.getElementById('btn-tambah-menu');
  const btnCancelAdd = document.getElementById('btn-cancel-add-menu');
  const btnCancelEdit = document.getElementById('btn-cancel-edit-menu');
  
  if (btnTambah) {
    btnTambah.addEventListener('click', () => {
      // Setup datalist
      renderCategoryOptions('category-list-options');
      
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

  const addImageInput = document.getElementById('add-menu-image');
  if (addImageInput) {
    addImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const preview = document.getElementById('add-menu-preview');
          preview.src = e.target.result;
          preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
      }
    });
  }

  const editImageInput = document.getElementById('edit-menu-image');
  if (editImageInput) {
    editImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const preview = document.getElementById('edit-menu-preview');
          preview.src = e.target.result;
          preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
      }
    });
  }

  const addForm = document.getElementById('add-menu-form');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('add-menu-name').value;
      const category = document.getElementById('add-menu-category').value;
      const price = parseInt(document.getElementById('add-menu-price').value);
      const desc = document.getElementById('add-menu-desc').value;
      const imgPreview = document.getElementById('add-menu-preview');
      const img = imgPreview.style.display === 'block' ? imgPreview.src : '';

      const id = name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 10) + '_' + Date.now().toString().slice(-4);

      Store.addMenu({
        id: id,
        name: name,
        category: category,
        price: price,
        desc: desc,
        img: img,
        available: true
      });

      // Save category if it's new
      const categories = Store.getCategories();
      if (!categories.includes(category)) {
        categories.push(category);
        Store.saveCategories(categories);
      }

      alert('Menu berhasil ditambahkan!');
      addForm.reset();
      imgPreview.style.display = 'none';
      document.getElementById('view-add-menu').classList.remove('active');
      document.getElementById('view-menu').classList.add('active');
      renderMenuTable();
    });
  }

  const editForm = document.getElementById('edit-menu-form');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-menu-id').value;
      const name = document.getElementById('edit-menu-name').value;
      const category = document.getElementById('edit-menu-category').value;
      const price = parseInt(document.getElementById('edit-menu-price').value);
      const desc = document.getElementById('edit-menu-desc').value;
      
      const updateData = { name, category, price, desc };
      
      const fileInput = document.getElementById('edit-menu-image');
      if (fileInput.files.length > 0) {
        updateData.img = document.getElementById('edit-menu-preview').src;
      }

      Store.updateMenu(id, updateData);

      // Save category if it's new
      const categories = Store.getCategories();
      if (!categories.includes(category)) {
        categories.push(category);
        Store.saveCategories(categories);
      }

      alert('Menu berhasil diupdate!');
      document.getElementById('view-edit-menu').classList.remove('active');
      document.getElementById('view-menu').classList.add('active');
      renderMenuTable();
    });
  }
});

function renderCategoryOptions(datalistId) {
  const datalist = document.getElementById(datalistId);
  if (!datalist) return;
  datalist.innerHTML = '';
  Store.getCategories().forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    datalist.appendChild(opt);
  });
}

window.openEditMenu = function(id) {
  const menu = Store.getMenu().find(m => m.id === id);
  if (!menu) return;
  
  renderCategoryOptions('category-list-options-edit');

  document.getElementById('edit-menu-id').value = menu.id;
  document.getElementById('edit-menu-name').value = menu.name;
  document.getElementById('edit-menu-category').value = menu.category;
  document.getElementById('edit-menu-price').value = menu.price;
  document.getElementById('edit-menu-desc').value = menu.desc;
  
  if (menu.img) {
    const preview = document.getElementById('edit-menu-preview');
    preview.src = menu.img;
    preview.style.display = 'block';
  } else {
    document.getElementById('edit-menu-preview').style.display = 'none';
  }

  document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-edit-menu').classList.add('active');
};

window.deleteMenu = function(id) {
  if (confirm('Yakin ingin menghapus menu ini secara permanen?')) {
    Store.deleteMenu(id);
    alert('Menu berhasil dihapus!');
    renderMenuTable();
  }
};
