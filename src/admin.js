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
        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;">Edit</button>
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
