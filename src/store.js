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

if (!localStorage.getItem('rakit_orders') || localStorage.getItem('clear_old_orders_2') !== 'true') {
  localStorage.setItem('rakit_orders', JSON.stringify([]));
  localStorage.setItem('clear_old_orders_2', 'true');
}

const initialCmsSettings = {
  themeColor: '#AF8C53',
  fontFamily: "'Inter', sans-serif",
  heroTitle: 'Selamat Datang di Rakit Coffee',
  heroSubtitle: 'Nikmati racikan kopi premium dan hidangan lezat yang disiapkan khusus untuk menemani momen berharga Anda hari ini.',
  heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkraCqif2SxQdRwm0wKEz-FPHEhuYSr8Ko3_4FEPVLtungLI4aI0N2jmDKH9059vVGTBs09z-9fzaScFzSdQDsnKsOC6euhHRNeaIAlGovJZP2g2xD18ZvX7TsFD34tkMlMVL3LUoxlvRHwrv06fVIJmYnAEms23eZuoiyPnPFVrHUZTjE7KYnZpZr8VukCVoZTkQMdXyIsMK0X36VNerL8PCR5FCkjyqPU2lGiDg9jW42X2-w24ISH8RfpyVt2znhJu-sj2esU-U'
};

if (!localStorage.getItem('rakit_cms')) {
  localStorage.setItem('rakit_cms', JSON.stringify(initialCmsSettings));
}

export const Store = {
  // Auth methods
  async login(username, password) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
          localStorage.setItem('rakit_token', 'dummy_token_' + Date.now());
          resolve(true);
        } else {
          resolve(false);
        }
      }, 600);
    });
  },
  
  async logout() {
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.removeItem('rakit_token');
        resolve();
      }, 300);
    });
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('rakit_token');
  },

  async getMenu() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(JSON.parse(localStorage.getItem('rakit_menu') || '[]'));
      }, 500);
    });
  },
  
  async updateMenu(id, data) {
    return new Promise(resolve => {
      setTimeout(() => {
        const menus = JSON.parse(localStorage.getItem('rakit_menu') || '[]');
        const index = menus.findIndex(m => m.id === id);
        if (index !== -1) {
          menus[index] = { ...menus[index], ...data };
          localStorage.setItem('rakit_menu', JSON.stringify(menus));
          window.dispatchEvent(new Event('storage'));
        }
        resolve();
      }, 500);
    });
  },

  async addMenu(data) {
    return new Promise(resolve => {
      setTimeout(() => {
        const menus = JSON.parse(localStorage.getItem('rakit_menu') || '[]');
        menus.push(data);
        localStorage.setItem('rakit_menu', JSON.stringify(menus));
        window.dispatchEvent(new Event('storage'));
        resolve();
      }, 500);
    });
  },

  async deleteMenu(id) {
    return new Promise(resolve => {
      setTimeout(() => {
        let menus = JSON.parse(localStorage.getItem('rakit_menu') || '[]');
        menus = menus.filter(m => m.id !== id);
        localStorage.setItem('rakit_menu', JSON.stringify(menus));
        window.dispatchEvent(new Event('storage'));
        resolve();
      }, 500);
    });
  },

  async getCategories() {
    return new Promise(resolve => {
      setTimeout(() => {
        const cats = localStorage.getItem('rakit_categories');
        if (cats) return resolve(JSON.parse(cats));
        
        const menus = JSON.parse(localStorage.getItem('rakit_menu') || '[]');
        const uniqueCats = [...new Set(menus.map(m => m.category))];
        if (uniqueCats.length === 0) return resolve(['SIGNATURE', 'KOPI', 'NON-COFFEE', 'MAKANAN']);
        resolve(uniqueCats);
      }, 200);
    });
  },

  async saveCategories(categories) {
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem('rakit_categories', JSON.stringify(categories));
        window.dispatchEvent(new Event('storage'));
        resolve();
      }, 400);
    });
  },

  async getOrders() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(JSON.parse(localStorage.getItem('rakit_orders') || '[]'));
      }, 500);
    });
  },

  async addOrder(orderData) {
    return new Promise(resolve => {
      setTimeout(() => {
        const orders = JSON.parse(localStorage.getItem('rakit_orders') || '[]');
        const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        
        let calculatedTotal = 0;
        const itemsWithStatus = orderData.items.map(item => {
          const itemFinalPrice = item.price + (item.modifierTotal || 0);
          calculatedTotal += itemFinalPrice * item.qty;
          
          return {
            ...item,
            itemId: 'ITM-' + Math.floor(10000 + Math.random() * 90000),
            status: 'Diterima',
            completedAt: null
          };
        });

        const newOrder = {
          customerName: orderData.customerName,
          table: orderData.table || '12',
          id: orderId,
          items: itemsWithStatus,
          total: calculatedTotal,
          status: 'Diterima',
          timestamp: new Date().toISOString()
        };
        
        orders.push(newOrder);
        localStorage.setItem('rakit_orders', JSON.stringify(orders));
        window.dispatchEvent(new Event('storage'));
        resolve(newOrder);
      }, 800);
    });
  },

  async updateOrderStatus(orderId, newStatus) {
    return new Promise(resolve => {
      setTimeout(() => {
        const orders = JSON.parse(localStorage.getItem('rakit_orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        if (order) {
          order.status = newStatus;
          if (newStatus === 'Siap') {
            order.completedAt = new Date().toISOString();
          }
          localStorage.setItem('rakit_orders', JSON.stringify(orders));
          window.dispatchEvent(new Event('storage'));
        }
        resolve();
      }, 400);
    });
  },

  async updateOrderItemStatus(orderId, itemId, newStatus) {
    return new Promise(resolve => {
      setTimeout(() => {
        const orders = JSON.parse(localStorage.getItem('rakit_orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const item = order.items.find(i => i.itemId === itemId);
          if (item) {
            item.status = newStatus;
            if (newStatus === 'Siap') {
              item.completedAt = new Date().toISOString();
            }

            const allSiap = order.items.every(i => i.status === 'Siap');
            if (allSiap) {
              order.status = 'Siap';
              if (!order.completedAt) {
                order.completedAt = new Date().toISOString();
              }
            } else {
              const anyDimasak = order.items.some(i => i.status === 'Dimasak' || i.status === 'Siap');
              if (anyDimasak && order.status === 'Diterima') {
                order.status = 'Dimasak';
              }
            }

            localStorage.setItem('rakit_orders', JSON.stringify(orders));
            window.dispatchEvent(new Event('storage'));
          }
        }
        resolve();
      }, 300);
    });
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
  },

  // CMS Methods
  async getCmsSettings() {
    return new Promise(resolve => {
      const settings = JSON.parse(localStorage.getItem('rakit_cms')) || initialCmsSettings;
      resolve(settings);
    });
  },

  async saveCmsSettings(settings) {
    return new Promise(resolve => {
      localStorage.setItem('rakit_cms', JSON.stringify(settings));
      window.dispatchEvent(new Event('storage'));
      resolve(true);
    });
  }
};
