import { Store } from './store.js';

document.addEventListener('DOMContentLoaded', async () => {
  await Store.applyGlobalTheme({ headerOnly: true });
  if (!Store.isAuthenticated()) {
    window.location.replace('/login.html');
    return;
  }

  startClock();
  renderBoard();

  Store.subscribe(() => {
    renderBoard();
  });

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await Store.logout();
      window.location.replace('/login.html');
    });
  }
});

function startClock() {
  const clockEl = document.getElementById('clock');
  setInterval(() => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('id-ID');
  }, 1000);
  
  // Refresh board periodically to clear old orders
  setInterval(() => {
    renderBoard();
  }, 10000);
}

async function renderBoard() {
  const orders = await Store.getOrders();
  
  const cols = {
    'Diterima': document.getElementById('col-diterima'),
    'Dimasak': document.getElementById('col-dimasak'),
    'Siap': document.getElementById('col-siap')
  };
  
  const counts = {
    'Diterima': 0,
    'Dimasak': 0,
    'Siap': 0
  };

  // Clear columns
  Object.values(cols).forEach(col => {
    if (col) col.innerHTML = '';
  });
  
  const now = Date.now();

  orders.forEach(order => {
    // Hanya tampilkan pesanan yang sudah lunas dibayar
    if (order.paymentStatus !== 'Lunas') return;

    order.items.forEach(item => {
      // Compatibility with old orders that might not have item.status
      const itemStatus = item.status || 'Diterima';
      const itemId = item.itemId || 'unknown';

      if (itemStatus === 'Siap' && item.completedAt) {
        const completedTime = new Date(item.completedAt).getTime();
        if (now - completedTime > 60000) { // 1 menit (60,000 ms)
          return; // Lewati item ini (sembunyikan)
        }
      }

      if (cols[itemStatus]) {
        counts[itemStatus]++;
        
        const card = document.createElement('div');
        card.className = 'kds-card';
        
        // Hitung durasi (mock)
        const orderTime = new Date(order.timestamp);
        const timeStr = orderTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        let itemsHtml = '<ul class="kds-item-list" style="margin-top: 12px;">';
        let noteHtml = '';
        if (item.sugar && item.sugar !== 'Normal') {
          noteHtml += `<span class="kds-item-note" style="display: block;">Gula: ${item.sugar}</span>`;
        }
        if (item.selectedModifiers && item.selectedModifiers.length > 0) {
          item.selectedModifiers.forEach(modGroup => {
            const selectedNames = modGroup.selected.map(s => s.name).join(', ');
            noteHtml += `<span class="kds-item-note" style="display: block;">${modGroup.groupName}: ${selectedNames}</span>`;
          });
        }
        if (item.note) {
          noteHtml += `<span class="kds-item-note" style="display: block;">Catatan: ${item.note}</span>`;
        }
        
        itemsHtml += `
          <li>
            <div class="kds-item" style="font-size: 18px; font-weight: bold;">${item.qty}x ${item.name}</div>
            ${noteHtml ? `<div style="margin-top: 4px;">${noteHtml}</div>` : ''}
          </li>
        `;
        itemsHtml += '</ul>';

        let actionHtml = '';
        if (itemStatus === 'Diterima') {
          actionHtml = `<button class="btn btn-primary" onclick="updateItemStatus('${order.id}', '${itemId}', 'Dimasak')">Proses</button>`;
        } else if (itemStatus === 'Dimasak') {
          actionHtml = `<button class="btn" style="background-color: var(--color-success); color: white;" onclick="updateItemStatus('${order.id}', '${itemId}', 'Siap')">Selesai</button>`;
        } else if (itemStatus === 'Siap') {
          actionHtml = `<span style="color: var(--color-success); font-weight: bold; text-align: center; display: block; width: 100%;">Menunggu Diambil Pelayan</span>`;
        }

        card.innerHTML = `
          <div class="kds-card-header">
            <span class="kds-card-table">Meja ${order.table}</span>
            <span class="kds-card-time">${timeStr}</span>
          </div>
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--color-text-muted);">Pesanan: ${order.customerName}</div>
          ${itemsHtml}
          <div class="kds-card-actions">
            ${actionHtml}
          </div>
        `;
        
        cols[itemStatus].appendChild(card);
      }
    });
  });

  // Update counts
  document.getElementById('count-diterima').textContent = counts['Diterima'];
  document.getElementById('count-dimasak').textContent = counts['Dimasak'];
  document.getElementById('count-siap').textContent = counts['Siap'];
}

window.updateStatus = async function(orderId, newStatus) {
  await Store.updateOrderStatus(orderId, newStatus);
};

window.updateItemStatus = async function(orderId, itemId, newStatus) {
  await Store.updateOrderItemStatus(orderId, itemId, newStatus);
};
