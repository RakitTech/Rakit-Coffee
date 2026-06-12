import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { Store } from './store.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Load existing settings
  const settings = await Store.getCmsSettings();
  
  const themeInput = document.getElementById('cms-theme');
  const fontInput = document.getElementById('cms-font');
  const titleInput = document.getElementById('cms-hero-title');
  const subtitleInput = document.getElementById('cms-hero-subtitle');
  const titleColorInput = document.getElementById('cms-hero-title-color');
  const subtitleColorInput = document.getElementById('cms-hero-subtitle-color');
  const titleFontInput = document.getElementById('cms-hero-title-font');
  const subtitleFontInput = document.getElementById('cms-hero-subtitle-font');
  const previewImg = document.getElementById('cms-hero-preview');

  if (themeInput) themeInput.value = settings.themeColor;
  if (fontInput) fontInput.value = settings.fontFamily;
  if (titleInput) titleInput.value = settings.heroTitle;
  if (subtitleInput) subtitleInput.value = settings.heroSubtitle;
  if (titleColorInput && settings.heroTitleColor) titleColorInput.value = settings.heroTitleColor;
  if (subtitleColorInput && settings.heroSubtitleColor) subtitleColorInput.value = settings.heroSubtitleColor;
  if (titleFontInput && settings.heroTitleFont) titleFontInput.value = settings.heroTitleFont;
  if (subtitleFontInput && settings.heroSubtitleFont) subtitleFontInput.value = settings.heroSubtitleFont;
  
  if (settings.heroImage && previewImg) {
    previewImg.src = settings.heroImage;
    previewImg.style.display = 'block';
  }

  // Handle Image Upload and Cropper
  let currentCropper = null;

  const openCropperModal = (file) => {
    if (currentCropper) {
      currentCropper.destroy();
      currentCropper = null;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const cropTarget = document.getElementById('crop-image-target');
      cropTarget.src = e.target.result;
      document.getElementById('crop-image-modal').style.display = 'flex';
      
      setTimeout(() => {
        currentCropper = new Cropper(cropTarget, {
          aspectRatio: 16 / 9, // Wide banner ratio
          viewMode: 1,
        });
      }, 100);
    };
    reader.readAsDataURL(file);
  };

  const imageInput = document.getElementById('cms-hero-image');
  if (imageInput) {
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) openCropperModal(file);
    });
  }

  const closeCrop = () => {
    document.getElementById('crop-image-modal').style.display = 'none';
    if (currentCropper) {
      currentCropper.destroy();
      currentCropper = null;
    }
    document.getElementById('cms-hero-image').value = '';
  };

  document.getElementById('btn-cancel-crop')?.addEventListener('click', closeCrop);
  document.getElementById('close-crop-modal')?.addEventListener('click', closeCrop);

  document.getElementById('btn-save-crop')?.addEventListener('click', () => {
    if (!currentCropper) return;
    // We want a high-res banner image
    const croppedImageBase64 = currentCropper.getCroppedCanvas({
      width: 1200,
      height: 675,
      fillColor: '#fff',
    }).toDataURL('image/jpeg', 0.8);

    if (previewImg) {
      previewImg.src = croppedImageBase64;
      previewImg.style.display = 'block';
    }
    closeCrop();
  });

  // Handle Form Submit
  const cmsForm = document.getElementById('cms-form');
  if (cmsForm) {
    cmsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const newSettings = {
        themeColor: themeInput.value,
        fontFamily: fontInput.value,
        heroTitle: titleInput.value.trim(),
        heroSubtitle: subtitleInput.value.trim(),
        heroTitleColor: titleColorInput ? titleColorInput.value : '#ffeec5',
        heroSubtitleColor: subtitleColorInput ? subtitleColorInput.value : '#ffffff',
        heroTitleFont: titleFontInput ? titleFontInput.value : '',
        heroSubtitleFont: subtitleFontInput ? subtitleFontInput.value : '',
        heroImage: previewImg.style.display === 'block' ? previewImg.src : settings.heroImage
      };

      await Store.saveCmsSettings(newSettings);
      alert('Pengaturan tampilan pelanggan berhasil disimpan!');
    });
  }

  // Logout Logic
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      await Store.logout();
      window.location.replace('/login.html');
    });
  }
  // Initialize custom dropdowns
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
