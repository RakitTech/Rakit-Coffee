import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        kitchen: resolve(__dirname, 'kitchen.html'),
        admin: resolve(__dirname, 'admin.html'),
        login: resolve(__dirname, 'login.html'),
        admin_analytics: resolve(__dirname, 'admin-analytics.html'),
        admin_manage: resolve(__dirname, 'admin-manage.html'),
        admin_cms: resolve(__dirname, 'admin-cms.html'),
        admin_stok: resolve(__dirname, 'admin-stok.html')
      }
    }
  }
});
