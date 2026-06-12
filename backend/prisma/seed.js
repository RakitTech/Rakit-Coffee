const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialCategories = [
  { name: 'SIGNATURE' },
  { name: 'KOPI' },
  { name: 'NON-COFFEE' },
  { name: 'MILK SERIES' },
  { name: 'MAIN COURSE' },
  { name: 'PIZZA SERIES' },
  { name: 'MAKANAN' },
  { name: 'CAMILAN' }
];

const initialMenus = [
  {
    id: 'm1',
    name: 'Gula Aren Latte',
    category: 'SIGNATURE',
    desc: 'Paduan sempurna espresso house blend kami dengan susu segar dan manisnya gula aren murni.',
    price: 25000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf_BWfX68hgiD3S4o0IBT1z_7_D_4LjqjJcQWTCJGm1iS9aU_EtAdfn3w0ZiGiPRP1MQED__yWrV5sjw5ptfVqRGNRZk6Vb9Z1zayQcieYSLYWLPOo9ekRokJWDP4Vtb6NyA1sun_liGLB1a8eVPBvrsoobnMil74YJAc4OR0u8387qHNXPc3sgJscyDHH6GXIVAWYqZ7nn5QDMRv4FDDt1_bWE1u0X_zIIsgm8JuDHEzorQ6ip--4MG8oMu-LJmpigLb5LAZeZB4',
    available: true,
    modifierGroups: [
      {
        name: 'Tingkat Kemanisan',
        type: 'single',
        required: true,
        options: [
          { name: 'Normal Sugar', priceAdd: 0 },
          { name: 'Less Sugar (50%)', priceAdd: 0 },
          { name: 'No Sugar', priceAdd: 0 }
        ]
      },
      {
        name: 'Ekstra Topping',
        type: 'multiple',
        required: false,
        options: [
          { name: 'Espresso Shot', priceAdd: 5000 },
          { name: 'Cokelat Parut', priceAdd: 3000 }
        ]
      }
    ]
  },
  {
    id: 'm2',
    name: 'Classic Cappuccino',
    category: 'KOPI',
    desc: 'Espresso kaya rasa dengan foam susu lembut dan sentuhan latte art.',
    price: 28000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuKVSDARztF9ggKjG1Ao8J4wZ-vYp73FhIsSPh6aOBa2mtmv8tIpThI7nxoeFsG9uYK9S-2YMVwpRheNOftNDWyWrPWC-FIS20My7N9l9BgtF6TYw7fLzOxxlLT2y2TYPsPlVN48tzWp8gB5lNykqD3TWKyZs5N5Pm0N0bRZIk-McWeDgzLn8CWfQNFhNLGs-srbFDcsicR0bHkxrEgpc1ugX222HLQPpik3uEYbY1ABqSianV4feM9sW1lHIZ8uuAQs215tJJoZ0',
    available: true,
    modifierGroups: [
      {
        name: 'Suhu',
        type: 'single',
        required: true,
        options: [
          { name: 'Panas', priceAdd: 0 },
          { name: 'Dingin (Es)', priceAdd: 2000 }
        ]
      }
    ]
  },
  {
    id: 'm3',
    name: 'V60 Manual Brew',
    category: 'KOPI',
    desc: 'Pilihan biji kopi single origin yang diseduh presisi untuk menonjolkan karakter rasa yang unik.',
    price: 30000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB9TEfVn9mqV8-63wepir3BEkxgi1SeX_q-z8qBDxJrN2Lofl0LH7BzJPqgxMSIPK839Ot_dkBkSRpxXnFsczaxpB84g3jYiLbTl4oMk-B1aRvULBdJv6ZV9jTZpG9V_R3NANbOZAdrLpdk7PcVvWzUykM09v2rGpQW3wOrXw9FNsc3iDswpUe8oiwH7WR66MZM2vC4lx_oMbuOsbbBfd_Uq_8SndUnEhCNzNsX-T2VT4SEEb-eRXalWnWiLRyRxrbfGH-dFLxf1o',
    available: true,
    modifierGroups: [
      {
        name: 'Biji Kopi (Beans)',
        type: 'single',
        required: true,
        options: [
          { name: 'Aceh Gayo (Fruity)', priceAdd: 0 },
          { name: 'Java Ijen (Nutty)', priceAdd: 0 }
        ]
      }
    ]
  },
  {
    id: 'm4',
    name: 'Butter Croissant',
    category: 'MAKANAN',
    desc: 'Croissant mentega klasik yang renyah di luar dan lembut berlapis di dalam. Disajikan hangat.',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
    available: true,
    modifierGroups: [
      {
        name: 'Pemanasan',
        type: 'single',
        required: true,
        options: [
          { name: 'Hangatkan', priceAdd: 0 },
          { name: 'Biasa (Suhu Ruang)', priceAdd: 0 }
        ]
      }
    ]
  },
  {
    id: 'm5',
    name: 'Chocolate Croissant',
    category: 'MAKANAN',
    desc: 'Croissant renyah dengan isian cokelat Belgia leleh yang melimpah. Disajikan hangat.',
    price: 26000,
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=500&auto=format&fit=crop&q=60',
    available: true,
    modifierGroups: [
      {
        name: 'Pemanasan',
        type: 'single',
        required: true,
        options: [
          { name: 'Hangatkan', priceAdd: 0 },
          { name: 'Biasa (Suhu Ruang)', priceAdd: 0 }
        ]
      }
    ]
  },
  {
    id: 'm6',
    name: 'Mix Platter',
    category: 'CAMILAN',
    desc: 'Kombinasi kentang goreng renyah, sosis sapi panggang, dan nugget ayam gurih. Disajikan dengan saus sambal dan mayones.',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60',
    available: true,
    modifierGroups: [
      {
        name: 'Saus Tambahan',
        type: 'multiple',
        required: false,
        options: [
          { name: 'Saus Keju', priceAdd: 3000 },
          { name: 'Ekstra Mayones', priceAdd: 1000 }
        ]
      }
    ]
  },
  {
    id: 'm7',
    name: 'French Fries',
    category: 'CAMILAN',
    desc: 'Kentang goreng renyah bumbu bawang putih gurih dengan taburan daun peterseli.',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60',
    available: true,
    modifierGroups: [
      {
        name: 'Bumbu Kentang',
        type: 'single',
        required: true,
        options: [
          { name: 'Asin Gurih (Original)', priceAdd: 0 },
          { name: 'Pedas Keju', priceAdd: 1000 }
        ]
      }
    ]
  },
  {
    id: 'm8',
    name: 'Matcha Sakura Latte',
    category: 'MILK SERIES',
    desc: 'Kombinasi susu segar, Uji Matcha premium, dan ekstrak bunga sakura aromatik.',
    price: 27000,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60',
    available: true,
    modifierGroups: [
      {
        name: 'Tingkat Kemanisan',
        type: 'single',
        required: true,
        options: [
          { name: 'Normal Sugar', priceAdd: 0 },
          { name: 'Less Sugar', priceAdd: 0 }
        ]
      }
    ]
  },
  {
    id: 'm9',
    name: 'Strawberry Fresh Milk',
    category: 'MILK SERIES',
    desc: 'Susu segar dingin dipadukan dengan selai strawberry manis dan asam segar.',
    price: 26000,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60',
    available: true,
    modifierGroups: [
      {
        name: 'Ekstra Topping',
        type: 'multiple',
        required: false,
        options: [
          { name: 'Rainbow Jelly', priceAdd: 3000 },
          { name: 'Whipped Cream', priceAdd: 4000 }
        ]
      }
    ]
  },
  {
    id: 'm10',
    name: 'Katsu Ayam',
    category: 'MAIN COURSE',
    desc: 'Dada ayam fillet goreng tepung panir renyah disajikan dengan nasi putih hangat, salad kol segar, dan saus katsu gurih.',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60',
    available: true,
    modifierGroups: [
      {
        name: 'Karbohidrat',
        type: 'single',
        required: true,
        options: [
          { name: 'Nasi Putih', priceAdd: 0 },
          { name: 'Kentang Goreng', priceAdd: 5000 }
        ]
      }
    ]
  },
  {
    id: 'm11',
    name: 'Fried Chicken',
    category: 'MAIN COURSE',
    desc: 'Ayam goreng tepung renyah dan juicy, disajikan dengan nasi putih hangat dan saus pilihan.',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&auto=format&fit=crop&q=60',
    available: true,
    modifierGroups: [
      {
        name: 'Bagian Ayam',
        type: 'single',
        required: true,
        options: [
          { name: 'Paha Bawah (Drumstick)', priceAdd: 0 },
          { name: 'Dada (Breast)', priceAdd: 2000 },
          { name: 'Paha Atas (Thigh)', priceAdd: 2000 }
        ]
      }
    ]
  },
  {
    id: 'm12',
    name: 'Pizza Slice Mozarella',
    category: 'PIZZA SERIES',
    desc: 'Satu slice pizza dengan lelehan keju mozarella premium melimpah di atas saus tomat buatan sendiri yang gurih.',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
    available: true,
    modifierGroups: [
      {
        name: 'Ekstra Keju',
        type: 'single',
        required: false,
        options: [
          { name: 'Ekstra Mozarella', priceAdd: 4000 }
        ]
      }
    ]
  },
  {
    id: 'm13',
    name: 'Slice Pepperoni',
    category: 'PIZZA SERIES',
    desc: 'Satu slice pizza dengan topping potongan daging pepperoni sapi melimpah dan keju mozarella meleleh.',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60',
    available: true,
    modifierGroups: [
      {
        name: 'Ekstra Topping',
        type: 'multiple',
        required: false,
        options: [
          { name: 'Ekstra Pepperoni', priceAdd: 5000 },
          { name: 'Ekstra Jalapeno', priceAdd: 2000 }
        ]
      }
    ]
  }
];

const defaultCmsSettings = {
  id: 1,
  themeColor: '#AF8C53',
  fontFamily: "'Inter', sans-serif",
  heroTitle: 'Selamat Datang di Rakit Coffee',
  heroSubtitle: 'Nikmati racikan kopi premium dan hidangan lezat yang disiapkan khusus untuk menemani momen berharga Anda hari ini.',
  heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkraCqif2SxQdRwm0wKEz-FPHEhuYSr8Ko3_4FEPVLtungLI4aI0N2jmDKH9059vVGTBs09z-9fzaScFzSdQDsnKsOC6euhHRNeaIAlGovJZP2g2xD18ZvX7TsFD34tkMlMVL3LUoxlvRHwrv06fVIJmYnAEms23eZuoiyPnPFVrHUZTjE7KYnZpZr8VukCVoZTkQMdXyIsMK0X36VNerL8PCR5FCkjyqPU2lGiDg9jW42X2-w24ISH8RfpyVt2znhJu-sj2esU-U',
  heroTitleColor: '#ffeec5',
  heroSubtitleColor: '#ffffff',
  heroTitleFont: '',
  heroSubtitleFont: ''
};

async function main() {
  console.log('🌱 Memulai seeding database PostgreSQL...');

  // 0. Bersihkan data lama agar bersih
  console.log('🧹 Membersihkan database dari data lama...');
  await prisma.menu.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.cmsSetting.deleteMany({});

  // 1. Seed Categories
  console.log('📦 Seeding Categories...');
  for (const cat of initialCategories) {
    await prisma.category.create({
      data: cat
    });
  }

  // 2. Seed Menus
  console.log('📋 Seeding Menus...');
  for (const menu of initialMenus) {
    await prisma.menu.create({
      data: {
        id: menu.id,
        name: menu.name,
        category: menu.category,
        desc: menu.desc,
        price: menu.price,
        image: menu.image,
        available: menu.available,
        modifierGroups: menu.modifierGroups
      }
    });
  }

  // 3. Seed CMS Settings
  console.log('⚙️ Seeding CMS Settings...');
  await prisma.cmsSetting.create({
    data: defaultCmsSettings
  });

  console.log('🎉 Seeding database selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
