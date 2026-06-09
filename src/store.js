// Mock Data untuk Menu
const initialMenu = [
  {
    id: 'm1',
    name: 'Gula Aren Latte',
    category: 'SIGNATURE',
    desc: 'Paduan sempurna espresso house blend kami dengan susu segar dan manisnya gula aren murni.',
    price: 25000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf_BWfX68hgiD3S4o0IBT1z_7_D_4LjqjJcQWTCJGm1iS9aU_EtAdfn3w0ZiGiPRP1MQED__yWrV5sjw5ptfVqRGNRZk6Vb9Z1zayQcieYSLYWLPOo9ekRokJWDP4Vtb6NyA1sun_liGLB1a8eVPBvrsoobnMil74YJAc4OR0u8387qHNXPc3sgJscyDHH6GXIVAWYqZ7nn5QDMRv4FDDt1_bWE1u0X_zIIsgm8JuDHEzorQ6ip--4MG8oMu-LJmpigLb5LAZeZB4',
    available: true
  },
  {
    id: 'm2',
    name: 'Classic Cappuccino',
    category: 'KOPI',
    desc: 'Espresso kaya rasa dengan foam susu lembut dan sentuhan latte art.',
    price: 28000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuKVSDARztF9ggKjG1Ao8J4wZ-vYp73FhIsSPh6aOBa2mtmv8tIpThI7nxoeFsG9uYK9S-2YMVwpRheNOftNDWyWrPWC-FIS20My7N9l9BgtF6TYw7fLzOxxlLT2y2TYPsPlVN48tzWp8gB5lNykqD3TWKyZs5N5Pm0N0bRZIk-McWeDgzLn8CWfQNFhNLGs-srbFDcsicR0bHkxrEgpc1ugX222HLQPpik3uEYbY1ABqSianV4feM9sW1lHIZ8uuAQs215tJJoZ0',
    available: true
  },
  {
    id: 'm3',
    name: 'V60 Manual Brew',
    category: 'KOPI',
    desc: 'Pilihan biji kopi single origin yang diseduh presisi untuk menonjolkan karakter rasa yang unik.',
    price: 30000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB9TEfVn9mqV8-63wepir3BEkxgi1SeX_q-z8qBDxJrN2Lofl0LH7BzJPqgxMSIPK839Ot_dkBkSRpxXnFsczaxpB84g3jYiLbTl4oMk-B1aRvULBdJv6ZV9jTZpG9V_R3NANbOZAdrLpdk7PcVvWzUykM09v2rGpQW3wOrXw9FNsc3iDswpUe8oiwH7WR66MZM2vC4lx_oMbuOsbbBfd_Uq_8SndUnEhCNzNsX-T2VT4SEEb-eRXalWnWiLRyRxrbfGH-dFLxf1o',
    available: true
  }
];

// Initialize Store
if (!localStorage.getItem('rakit_menu')) {
  localStorage.setItem('rakit_menu', JSON.stringify(initialMenu));
}

if (!localStorage.getItem('rakit_orders') || localStorage.getItem('clear_old_orders_1') !== 'true') {
  localStorage.setItem('rakit_orders', JSON.stringify([]));
  localStorage.setItem('clear_old_orders_1', 'true');
}

export const Store = {
  getMenu() {
    return JSON.parse(localStorage.getItem('rakit_menu') || '[]');
  },
  
  updateMenu(id, data) {
    const menus = this.getMenu();
    const index = menus.findIndex(m => m.id === id);
    if (index !== -1) {
      menus[index] = { ...menus[index], ...data };
      localStorage.setItem('rakit_menu', JSON.stringify(menus));
      window.dispatchEvent(new Event('storage')); // Trigger update across tabs
    }
  },

  getOrders() {
    return JSON.parse(localStorage.getItem('rakit_orders') || '[]');
  },

  addOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      ...orderData,
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      status: 'Diterima', // Diterima -> Dimasak -> Siap
      timestamp: new Date().toISOString()
    };
    orders.push(newOrder);
    localStorage.setItem('rakit_orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('storage'));
    return newOrder;
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      if (newStatus === 'Siap') {
        order.completedAt = new Date().toISOString();
      }
      localStorage.setItem('rakit_orders', JSON.stringify(orders));
      window.dispatchEvent(new Event('storage'));
    }
  },

  // Helper untuk mendengarkan perubahan dari tab lain
  subscribe(callback) {
    window.addEventListener('storage', callback);
    // Custom event untuk perubahan dari window yang sama
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const event = new Event('storage');
      originalSetItem.apply(this, arguments);
      window.dispatchEvent(event);
    };
  }
};
