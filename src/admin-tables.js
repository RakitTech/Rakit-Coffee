import { Store } from './store.js';

document.addEventListener('DOMContentLoaded', async () => {
  await Store.applyGlobalTheme();
  
  // Check auth
  if (!Store.isAuthenticated()) {
    window.location.replace('/login.html');
    return;
  }

  // Logout handler
  document.getElementById('btn-logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await Store.logout();
    window.location.replace('/login.html');
  });

  const btnGenerate = document.getElementById('btn-generate-qr');
  const btnPrint = document.getElementById('btn-print-qr');
  const previewContainer = document.getElementById('qr-preview-container');

  function generateQRCodes() {
    const startVal = parseInt(document.getElementById('start-table').value) || 1;
    const endVal = parseInt(document.getElementById('end-table').value) || 10;

    if (startVal > endVal) {
      alert('Nomor meja awal tidak boleh lebih besar dari nomor meja akhir!');
      return;
    }

    previewContainer.innerHTML = '';

    for (let tableNum = startVal; tableNum <= endVal; tableNum++) {
      const cardWrapper = document.createElement('div');
      cardWrapper.className = 'qr-card-wrapper';

      const card = document.createElement('div');
      card.className = 'qr-card';

      const origin = window.location.origin;
      const targetUrl = `${origin}/?table=${tableNum}`;
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}&color=0f172a&bgcolor=ffffff&qzone=1`;

      card.innerHTML = `
        <div class="qr-card-logo">Rakit Coffee</div>
        <div class="qr-card-tagline">Coffee & Eatery</div>
        <div class="qr-card-divider"></div>
        <div class="qr-image-frame">
          <img src="${qrApiUrl}" crossorigin="anonymous" alt="QR Meja ${tableNum}" class="qr-image" />
        </div>
        <div class="qr-card-instructions">PESAN & BAYAR DARI MEJA</div>
        <div class="qr-steps-list">
          <div class="qr-step-item">
            <div class="qr-step-icon">1</div>
            <div>Pindai QR Code di meja ini</div>
          </div>
          <div class="qr-step-item">
            <div class="qr-step-icon">2</div>
            <div>Pilih menu & kustomisasi sesukamu</div>
          </div>
          <div class="qr-step-item">
            <div class="qr-step-icon">3</div>
            <div>Selesaikan pesanan & bayar langsung</div>
          </div>
        </div>
        <div class="qr-table-banner">MEJA ${tableNum}</div>
      `;

      // Download Card Button (renders only the .qr-card element, excluding the button itself!)
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'btn btn-outline no-print';
      downloadBtn.style.width = '100%';
      downloadBtn.style.maxWidth = '320px';
      downloadBtn.style.display = 'flex';
      downloadBtn.style.alignItems = 'center';
      downloadBtn.style.justifyContent = 'center';
      downloadBtn.style.gap = '6px';
      downloadBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">download</span> Unduh Kartu PNG';

      downloadBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px; animation: spin 1s linear infinite;">sync</span> Generating Image...';
        
        try {
          // Wait briefly to ensure the QR code image element is fully loaded from the server
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Render the .qr-card container using html2canvas
          const canvas = await html2canvas(card, {
            useCORS: true,
            scale: 3, // 3x scale renders high-quality print output
            backgroundColor: '#ffffff'
          });
          
          const blobUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `Rakit_Coffee_Meja_${tableNum}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (error) {
          console.error('html2canvas rendering error:', error);
          alert('Gagal mengunduh kartu lengkap. Membuka file gambar QR saja...');
          window.open(qrApiUrl, '_blank');
        } finally {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">download</span> Unduh Kartu PNG';
        }
      });

      cardWrapper.appendChild(card);
      cardWrapper.appendChild(downloadBtn);
      previewContainer.appendChild(cardWrapper);
    }
  }

  // Bind events
  btnGenerate?.addEventListener('click', generateQRCodes);
  
  btnPrint?.addEventListener('click', () => {
    const cards = previewContainer.querySelectorAll('.qr-card');
    if (cards.length === 0) {
      alert('Silakan generate QR Code terlebih dahulu sebelum mencetak!');
      return;
    }
    window.print();
  });

  // Initial generation on load
  generateQRCodes();
});
