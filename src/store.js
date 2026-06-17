// Fallback Menu (Jika terjadi kegagalan koneksi API)
const initialMenu = [
  {
    id: 'm1',
    name: 'Gula Aren Latte',
    category: 'SIGNATURE',
    desc: 'Paduan sempurna espresso house blend kami dengan susu segar dan manisnya gula aren murni.',
    price: 25000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf_BWfX68hgiD3S4o0IBT1z_7_D_4LjqjJcQWTCJGm1iS9aU_EtAdfn3w0ZiGiPRP1MQED__yWrV5sjw5ptfVqRGNRZk6Vb9Z1zayQcieYSLYWLPOo9ekRokJWDP4Vtb6NyA1sun_liGLB1a8eVPBvrsoobnMil74YJAc4OR0u8387qHNXPc3sgJscyDHH6GXIVAWYqZ7nn5QDMRv4FDDt1_bWE1u0X_zIIsgm8JuDHEzorQ6ip--4MG8oMu-LJmpigLb5LAZeZB4',
    available: true
  }
];

const initialCmsSettings = {
  themeColor: '#AF8C53',
  fontFamily: "'Inter', sans-serif",
  heroTitle: 'Selamat Datang di Rakit Coffee',
  heroSubtitle: 'Nikmati racikan kopi premium dan hidangan lezat yang disiapkan khusus untuk menemani momen berharga Anda hari ini.',
  heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkraCqif2SxQdRwm0wKEz-FPHEhuYSr8Ko3_4FEPVLtungLI4aI0N2jmDKH9059vVGTBs09z-9fzaScFzSdQDsnKsOC6euhHRNeaIAlGovJZP2g2xD18ZvX7TsFD34tkMlMVL3LUoxlvRHwrv06fVIJmYnAEms23eZuoiyPnPFVrHUZTjE7KYnZpZr8VukCVoZTkQMdXyIsMK0X36VNerL8PCR5FCkjyqPU2lGiDg9jW42X2-w24ISH8RfpyVt2znhJu-sj2esU-U',
  heroTitleColor: '#ffeec5',
  heroSubtitleColor: '#ffffff',
  heroTitleFont: '',
  heroSubtitleFont: '',
  paymentAccName: 'Rakit Coffee',
  paymentAccNo: '123-456-7890',
  paymentQris: ''
};

const API_BASE_URL = 'http://localhost:3001/api';

// Helper header untuk requests
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('rakit_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Trigger sinkronisasi real-time lintas tab via Event storage
function triggerSync() {
  localStorage.setItem('rakit_db_sync', Date.now().toString());
}

export const Store = {
  // Auth methods
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('rakit_token', data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Store.login]', err);
      return false;
    }
  },
  
  async logout() {
    localStorage.removeItem('rakit_token');
    return Promise.resolve();
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('rakit_token');
  },

  async getMenu() {
    try {
      const res = await fetch(`${API_BASE_URL}/menus`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      return await res.json();
    } catch (err) {
      console.error('[Store.getMenu]', err);
      return initialMenu;
    }
  },
  
  async updateMenu(id, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/menus/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update menu');
      triggerSync();
    } catch (err) {
      console.error('[Store.updateMenu]', err);
    }
  },

  async addMenu(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/menus`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add menu');
      triggerSync();
    } catch (err) {
      console.error('[Store.addMenu]', err);
    }
  },

  async deleteMenu(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/menus/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete menu');
      triggerSync();
    } catch (err) {
      console.error('[Store.deleteMenu]', err);
    }
  },

  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return await res.json();
    } catch (err) {
      console.error('[Store.getCategories]', err);
      return ['SIGNATURE', 'KOPI', 'NON-COFFEE', 'MAKANAN'];
    }
  },

  async saveCategories(categories) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(categories)
      });
      if (!res.ok) throw new Error('Failed to save categories');
      triggerSync();
    } catch (err) {
      console.error('[Store.saveCategories]', err);
    }
  },

  async getOrders() {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return await res.json();
    } catch (err) {
      console.error('[Store.getOrders]', err);
      return [];
    }
  },

  async addOrder(orderData) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create order');
      }
      const newOrder = await res.json();
      triggerSync();
      return newOrder;
    } catch (err) {
      console.error('[Store.addOrder]', err);
      throw err;
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update order status');
      triggerSync();
    } catch (err) {
      console.error('[Store.updateOrderStatus]', err);
    }
  },

  async updateOrderItemStatus(orderId, itemId, newStatus) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/items/${itemId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update order item status');
      triggerSync();
    } catch (err) {
      console.error('[Store.updateOrderItemStatus]', err);
    }
  },

  async updateOrderPayment(orderId, paymentStatus, paymentMethod) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ paymentStatus, paymentMethod })
      });
      if (!res.ok) throw new Error('Failed to update order payment status');
      triggerSync();
    } catch (err) {
      console.error('[Store.updateOrderPayment]', err);
    }
  },

  // Helper listener sinkronisasi tab
  subscribe(callback) {
    window.addEventListener('storage', callback);
    // Intersep localStorage.setItem lokal agar mentrigger event storage pada tab yang sama
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const event = new Event('storage');
      originalSetItem.apply(this, arguments);
      window.dispatchEvent(event);
    };
  },

  // CMS Methods
  async getCmsSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/cms`);
      if (!res.ok) throw new Error('Failed to fetch CMS settings');
      return await res.json();
    } catch (err) {
      console.error('[Store.getCmsSettings]', err);
      return initialCmsSettings;
    }
  },

  async saveCmsSettings(settings) {
    try {
      const res = await fetch(`${API_BASE_URL}/cms`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save CMS settings');
      triggerSync();
      return true;
    } catch (err) {
      console.error('[Store.saveCmsSettings]', err);
      return false;
    }
  },

  async applyGlobalTheme(options = { headerOnly: false }) {
    const settings = await this.getCmsSettings();
    
    // Set warna header kitchen
    document.documentElement.style.setProperty('--kitchen-header-bg', settings.themeColor);

    if (options.headerOnly) {
      return settings;
    }

    // Terapkan warna CSS Variables secara global ke tema frontend
    document.documentElement.style.setProperty('--color-accent', settings.themeColor);
    document.documentElement.style.setProperty('--color-accent-light', settings.themeColor + '26');
    document.documentElement.style.setProperty('--color-accent-hover', settings.themeColor + '0D');
    
    document.documentElement.style.setProperty('--color-accent-05', settings.themeColor + '0D');
    document.documentElement.style.setProperty('--color-accent-10', settings.themeColor + '1A');
    document.documentElement.style.setProperty('--color-accent-15', settings.themeColor + '26');
    document.documentElement.style.setProperty('--color-accent-20', settings.themeColor + '33');
    
    document.documentElement.style.setProperty('--shadow-accent', `0 8px 30px ${settings.themeColor}4D`);
    document.documentElement.style.setProperty('--font-heading', settings.fontFamily);

    // Fungsi memuat Google Fonts secara dinamis
    const loadGoogleFont = (fontString) => {
      if (!fontString) return;
      if (fontString.includes('Lora') || fontString.includes('Montserrat') || 
          fontString.includes('Poppins') || fontString.includes('Oswald')) {
        const fontName = fontString.split(',')[0].replace(/'/g, '').trim();
        const existingLink = document.querySelector(`link[href*="${fontName.replace(/ /g, '+')}"]`);
        if (!existingLink) {
          const link = document.createElement('link');
          link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;600;700&display=swap`;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
      }
    };

    loadGoogleFont(settings.fontFamily);
    loadGoogleFont(settings.heroTitleFont);
    loadGoogleFont(settings.heroSubtitleFont);

    return settings;
  }
};
