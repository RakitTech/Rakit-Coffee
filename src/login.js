import { Store } from './store.js';

document.addEventListener('DOMContentLoaded', async () => {
  await Store.applyGlobalTheme();
  // Redirect to admin if already authenticated
  if (Store.isAuthenticated()) {
    window.location.replace('/admin.html');
    return;
  }

  const loginForm = document.getElementById('login-form');
  const btnSubmit = document.getElementById('btn-submit');
  const errorMsg = document.getElementById('error-msg');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // UI Loading state
    btnSubmit.disabled = true;
    const originalText = btnSubmit.textContent;
    btnSubmit.textContent = 'Memproses...';
    errorMsg.style.display = 'none';

    try {
      const success = await Store.login(username, password);
      
      if (success) {
        window.location.replace('/admin.html');
      } else {
        errorMsg.style.display = 'block';
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = 'Terjadi kesalahan sistem.';
      errorMsg.style.display = 'block';
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = originalText;
    }
  });
});
