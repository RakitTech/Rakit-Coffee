const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

const DEFAULT_SETTINGS = {
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

// ============================================================
// GET /api/cms
// Ambil pengaturan CMS
// ============================================================
router.get('/', async (req, res) => {
  try {
    let settings = await prisma.cmsSetting.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = await prisma.cmsSetting.create({
        data: { id: 1, ...DEFAULT_SETTINGS }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('[GET /cms]', error);
    res.status(500).json({ error: 'Gagal mengambil pengaturan CMS.' });
  }
});

// ============================================================
// POST /api/cms
// Simpan/perbarui pengaturan CMS
// ============================================================
router.post('/', async (req, res) => {
  try {
    const data = req.body;

    const settings = await prisma.cmsSetting.upsert({
      where: { id: 1 },
      update: {
        themeColor: data.themeColor,
        fontFamily: data.fontFamily,
        heroTitle: data.heroTitle,
        heroSubtitle: data.heroSubtitle,
        heroImage: data.heroImage,
        heroTitleColor: data.heroTitleColor,
        heroSubtitleColor: data.heroSubtitleColor,
        heroTitleFont: data.heroTitleFont || '',
        heroSubtitleFont: data.heroSubtitleFont || '',
        paymentAccName: data.paymentAccName || 'Rakit Coffee',
        paymentAccNo: data.paymentAccNo || '123-456-7890',
        paymentQris: data.paymentQris || ''
      },
      create: {
        id: 1,
        themeColor: data.themeColor,
        fontFamily: data.fontFamily,
        heroTitle: data.heroTitle,
        heroSubtitle: data.heroSubtitle,
        heroImage: data.heroImage,
        heroTitleColor: data.heroTitleColor,
        heroSubtitleColor: data.heroSubtitleColor,
        heroTitleFont: data.heroTitleFont || '',
        heroSubtitleFont: data.heroSubtitleFont || '',
        paymentAccName: data.paymentAccName || 'Rakit Coffee',
        paymentAccNo: data.paymentAccNo || '123-456-7890',
        paymentQris: data.paymentQris || ''
      }
    });

    res.json(settings);
  } catch (error) {
    console.error('[POST /cms]', error);
    res.status(500).json({ error: 'Gagal memperbarui pengaturan CMS.' });
  }
});

module.exports = router;
