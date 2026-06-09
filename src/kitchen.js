import { Store } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  startClock();
  renderBoard();

  Store.subscribe(() => {
    renderBoard();
  });
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

function renderBoard() {
  const orders = Store.getOrders();
  
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
    if (order.status === 'Siap' && order.completedAt) {
      const completedTime = new Date(order.completedAt).getTime();
      if (now - completedTime > 60000) { // 1 menit (60,000 ms)
        return; // Lewati order ini (sembunyikan)
      }
    }

    if (cols[order.status]) {
      counts[order.status]++;
      
      const card = document.createElement('div');
      card.className = 'kds-card';
      
      // Hitung durasi (mock)
      const orderTime = new Date(order.timestamp);
      const timeStr = orderTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      let itemsHtml = '<ul class="kds-item-list">';
      order.items.forEach(item => {
        let noteHtml = '';
        if (item.sugar && item.sugar !== 'Normal') noteHtml += `<span class="kds-item-note">Gula: ${item.sugar}</span> `;
        if (item.note) noteHtml += `<span class="kds-item-note">Catatan: ${item.note}</span>`;
        
        itemsHtml += `
          <li>
            <div class="kds-item">${item.qty}x ${item.name}</div>
            ${noteHtml ? `<div>${noteHtml}</div>` : ''}
          </li>
        `;
      });
      itemsHtml += '</ul>';

      let actionHtml = '';
      if (order.status === 'Diterima') {
        actionHtml = `<button class="btn btn-primary" onclick="updateStatus('${order.id}', 'Dimasak')">Proses</button>`;
      } else if (order.status === 'Dimasak') {
        actionHtml = `<button class="btn" style="background-color: var(--color-success); color: white;" onclick="updateStatus('${order.id}', 'Siap')">Selesai</button>`;
      } else if (order.status === 'Siap') {
        actionHtml = `<span style="color: var(--color-success); font-weight: bold; text-align: center; display: block; width: 100%;">Menunggu Diambil Pelayan</span>`;
      }

      card.innerHTML = `
        <div class="kds-card-header">
          <span class="kds-card-table">Meja ${order.table}</span>
          <span class="kds-card-time">${timeStr}</span>
        </div>
        <div style="font-weight: 600; margin-bottom: 8px;">${order.customerName}</div>
        ${itemsHtml}
        <div class="kds-card-actions">
          ${actionHtml}
        </div>
      `;
      
      cols[order.status].appendChild(card);
    }
  });

  // Update counts
  document.getElementById('count-diterima').textContent = counts['Diterima'];
  document.getElementById('count-dimasak').textContent = counts['Dimasak'];
  document.getElementById('count-siap').textContent = counts['Siap'];
}

window.updateStatus = function(orderId, newStatus) {
  Store.updateOrderStatus(orderId, newStatus);
};
