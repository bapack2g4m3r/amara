// Data Rekomendasi Seserahan & Link Shopee Affiliate Amara
// Terpusat untuk mempermudah pembaruan harga, brand, foto, dan link affiliate

export const SESERAHAN_CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'ibadah', label: 'Perlengkapan Ibadah' },
  { id: 'perhiasan', label: 'Perhiasan' },
  { id: 'tidur', label: 'Alat Tidur' },
  { id: 'toiletries', label: 'Toiletries' },
  { id: 'pakaian', label: 'Pakaian' },
  { id: 'aksesoris', label: 'Aksesoris' },
  { id: 'kecantikan', label: 'Kecantikan & Body Care' }
];

export const SESERAHAN_AFFILIATES = [
  // 1. Perlengkapan Ibadah - Al Quran
  {
    id: 'al-quran',
    title: 'Al Quran',
    category: 'ibadah',
    categoryName: 'Perlengkapan Ibadah',
    keywords: ['quran', 'al-quran', 'al quran', 'alquran', 'kitab suci'],
    products: [
      {
        id: 'quran-1',
        brand: 'Madinaquran',
        name: 'Al-Quran Zhafira Pocket Special Edition',
        price: 119000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/6q0hUEPMEr',
        image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'quran-2',
        brand: 'Madinaquran',
        name: 'Al-Quran Fasya Pelangi Tajwid Terjemah A6',
        price: 139000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/9fKsrYWqg7',
        image: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'quran-3',
        brand: 'Madinaquran',
        name: 'Al-Quran Shafana Exclusive Box Hadiah Pernikahan',
        price: 189000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/1VzB8aBRUx',
        image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 2. Perlengkapan Ibadah - Mukena
  {
    id: 'mukena',
    title: 'Mukena',
    category: 'ibadah',
    categoryName: 'Perlengkapan Ibadah',
    keywords: ['mukena', 'telekung', 'rukuh', 'mukena silk', 'mukena renda'],
    products: [
      {
        id: 'mukena-1',
        brand: 'Tazbiya',
        name: 'Mukena Silk Rayon Daily Renda Cantik',
        price: 165000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/80Cese0ZiI',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'mukena-2',
        brand: 'Lozy',
        name: 'Mukena Silk Crinkle Soft & Flowy Series',
        price: 249000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/2BErvwD1qM',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'mukena-3',
        brand: 'Alluna',
        name: 'Mukena Silk Sutra French Exclusive Seserahan',
        price: 389000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/6q0hUWzfgX',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 3. Perlengkapan Ibadah - Sajadah
  {
    id: 'sajadah',
    title: 'Sajadah',
    category: 'ibadah',
    categoryName: 'Perlengkapan Ibadah',
    keywords: ['sajadah', 'sejadah', 'sajadah couple'],
    products: [
      {
        id: 'sajadah-1',
        brand: 'Howel and Co',
        name: 'Sajadah Traveling Pouch Lipat Premium',
        price: 89000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/2gB8X855EE',
        image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'sajadah-2',
        brand: 'Howel and Co',
        name: 'Sajadah Couple Exclusive Mahar Gift Box',
        price: 259000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/5fok6f74nE',
        image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'sajadah-3',
        brand: 'Nadaya Collection',
        name: 'Sajadah Couple Love Kubah Tebal Antislip (1 Set 2 pcs)',
        price: 239000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/8V8vTsueH6',
        image: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 4. Perhiasan - Set Perhiasan
  {
    id: 'set-perhiasan',
    title: 'Set Perhiasan',
    category: 'perhiasan',
    categoryName: 'Perhiasan',
    keywords: ['perhiasan', 'emas', 'kalung', 'cincin', 'gelang', 'anting', 'jewelry', 'logam mulia', 'mahar perhiasan'],
    products: [
      {
        id: 'perhiasan-1',
        brand: 'Lovetia',
        name: 'Set Perhiasan Kalung & Anting Crystal Elegan',
        price: 129000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/5q8AJ4pnQg',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'perhiasan-2',
        brand: 'Cranberry',
        name: 'Set Perhiasan Mewah Lapis Emas 18K Zirconia',
        price: 219000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/AKaZfMG2lf',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'perhiasan-3',
        brand: 'Lovetia',
        name: 'Bridal Luxury Jewelry Set Mahar Pernikahan',
        price: 349000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/5q8AJ6JmI5',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 5. Alat Tidur - Bedcover set
  {
    id: 'bedcover-set',
    title: 'Bedcover Set',
    category: 'tidur',
    categoryName: 'Alat Tidur',
    keywords: ['bedcover', 'sprei', 'bed cover', 'selimut', 'spree', 'sprei pengantin'],
    products: [
      {
        id: 'bedcover-1',
        brand: 'Kintakun',
        name: "Bedcover Set D'Luxe Microtex Lembut King Size",
        price: 289000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/1VzB9OL0nt',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'bedcover-2',
        brand: 'Finetrus',
        name: 'Bedcover Set Katun Jepang Jacquard Aesthetic',
        price: 450000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/1Lfkx86p5K',
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'bedcover-3',
        brand: 'Tulip Romantic',
        name: 'Bedcover Ruffle Sutra Tencel Luxury Bridal Series',
        price: 720000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/9AOcHYPPL5',
        image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 6. Toiletries - Handuk
  {
    id: 'handuk',
    title: 'Handuk',
    category: 'toiletries',
    categoryName: 'Toiletries',
    keywords: ['handuk', 'towel', 'handuk mandi', 'handuk couple'],
    products: [
      {
        id: 'handuk-1',
        brand: 'Morning Whistle',
        name: 'Handuk Mandi Bamboo Anti Bakteri Ultra Soft',
        price: 95000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/2BErx1uqCg',
        image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'handuk-2',
        brand: 'Terry Palmer',
        name: 'Handuk Couple Seserahan Signature 70x140cm',
        price: 189000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/6L4QufjiJL',
        image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'handuk-3',
        brand: 'Howel and Co',
        name: 'Handuk Couple Bordir Nama Exclusive Gift Box',
        price: 299000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/6VNr6xng10',
        image: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 7. Toiletries - Body Wash
  {
    id: 'body-wash',
    title: 'Body Wash',
    category: 'toiletries',
    categoryName: 'Toiletries',
    keywords: ['body wash', 'sabun mandi', 'shower gel', 'bath gel', 'sabun'],
    products: [
      {
        id: 'body-wash-1',
        brand: 'Grace and Glow',
        name: 'Black Opium Brightening Body Wash 400ml',
        price: 59000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/6q0hVpJoBS',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'body-wash-2',
        brand: 'Earth Love Life',
        name: 'Body Wash Relaxing Aromatherapy Botanical Care',
        price: 98000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/70K7i91vYO',
        image: 'https://images.unsplash.com/photo-1608248597359-2e06180a5e84?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'body-wash-3',
        brand: 'The Body Shop',
        name: 'British Rose Shower Gel 250ml Wangi Mewah',
        price: 149000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/3g3fjzoD6j',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 8. Toiletries - Shampoo
  {
    id: 'shampoo',
    title: 'Shampoo',
    category: 'toiletries',
    categoryName: 'Toiletries',
    keywords: ['shampoo', 'sampo', 'shampo', 'hair care', 'conditioner'],
    products: [
      {
        id: 'shampoo-1',
        brand: 'DSE',
        name: 'Hair Care Repair Shampoo Nourishing Formula',
        price: 68000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/7fZoVQjgGX',
        image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'shampoo-2',
        brand: 'Lavojoy',
        name: 'Hold Me Tight Pro Shampoo Hair Loss Prevention',
        price: 129000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/1gIbMOGHA5',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'shampoo-3',
        brand: 'Diane',
        name: 'Moist Diane Extra Damage Repair Botanical Hair Treatment',
        price: 175000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/2gB8YDPS9Y',
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 9. Toiletries - Sikat Gigi
  {
    id: 'sikat-gigi',
    title: 'Sikat Gigi',
    category: 'toiletries',
    categoryName: 'Toiletries',
    keywords: ['sikat gigi', 'tooth brush', 'toothbrush', 'dental care', 'odol', 'pasta gigi'],
    products: [
      {
        id: 'sikat-1',
        brand: 'Dr.Spock',
        name: 'Sikat Gigi Nanotech Ultra Soft Charcoal (2 pcs)',
        price: 39000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/5q8AK7zM8v',
        image: 'https://images.unsplash.com/photo-1559591937-e1032a265691?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'sikat-2',
        brand: 'Dr.Baek',
        name: 'Sonic Toothbrush Set Oral Care Gentle Clean',
        price: 89000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/6Al0iikGED',
        image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'sikat-3',
        brand: 'TIGALAB',
        name: 'Electric Toothbrush IPX7 Waterproof Smart Timer',
        price: 199000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/9fKst7SvsP',
        image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 10. Pakaian - Hijab
  {
    id: 'hijab',
    title: 'Hijab',
    category: 'pakaian',
    categoryName: 'Pakaian',
    keywords: ['hijab', 'jilbab', 'kerudung', 'pashmina', 'segi empat', 'segiempat', 'scarf'],
    products: [
      {
        id: 'hijab-1',
        brand: 'Diario',
        name: 'Hijab Segiempat Voal Ultrafine Plain Series',
        price: 65000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/1gIbMfzeh0',
        image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'hijab-2',
        brand: 'Zaskia Mecca',
        name: 'Scarf Motif Edisi Nusantara Voal Premium',
        price: 99000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/7ptEhz0uWo',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'hijab-3',
        brand: 'Heylocal',
        name: 'Signature Silk Laser Cut Square Scarf Exclusive',
        price: 159000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/40gW8x0jRV',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 11. Pakaian - Sarimbit
  {
    id: 'sarimbit',
    title: 'Sarimbit',
    category: 'pakaian',
    categoryName: 'Pakaian',
    keywords: ['sarimbit', 'baju couple', 'baju pasangan', 'batik couple', 'sarimbit pengantin'],
    products: [
      {
        id: 'sarimbit-1',
        brand: 'Ventedaily',
        name: 'Sarimbit Couple Casual Minimalis Rayon Adem',
        price: 199000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/6fhHJsl66x',
        image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'sarimbit-2',
        brand: 'Tazbiya',
        name: 'Sarimbit Pasangan & Keluarga Modern Silk Pattern',
        price: 329000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/2gB8YZv7se',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'sarimbit-3',
        brand: 'Kalasirs',
        name: 'Sarimbit Premium Silk Embroidery Luxury Couple Set',
        price: 489000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/8V8vVHLVNq',
        image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 12. Pakaian - Dress/Gamis/Tunik
  {
    id: 'dress-gamis-tunik',
    title: 'Dress / Gamis / Tunik',
    category: 'pakaian',
    categoryName: 'Pakaian',
    keywords: ['dress', 'gamis', 'tunik', 'abaya', 'baju wanita', 'gaun', 'kebaya', 'piyama'],
    products: [
      {
        id: 'dress-1',
        brand: 'MISTYVORI',
        name: 'Elegant Everyday Tunik Crinkle Premium Flowy',
        price: 145000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/qjUO4WWwt',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'dress-2',
        brand: 'Lozy',
        name: 'Long Dress Flowy Pleated Feminine Series',
        price: 229000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/1gIbMkyFoj',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'dress-3',
        brand: 'KALUNAR',
        name: 'Luxury Silk Brokat Dress Seserahan & Pesta',
        price: 369000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/1qc1Z5EkIr',
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 13. Aksesoris - Tas
  {
    id: 'tas',
    title: 'Tas',
    category: 'aksesoris',
    categoryName: 'Aksesoris',
    keywords: ['tas', 'bag', 'handbag', 'slingbag', 'tote bag', 'shoulder bag', 'clutch'],
    products: [
      {
        id: 'tas-1',
        brand: 'Nunine',
        name: 'Shoulder Bag Minimalis Kulit Sintetis Elegan',
        price: 129000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/W6dz4MSTI',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'tas-2',
        brand: 'PALOMINO',
        name: 'Handbag Formal Wanita Leather Motif Tekstur',
        price: 279000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/2LYIAWM7a2',
        image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'tas-3',
        brand: 'ROUNN',
        name: 'Genuine Leather Designer Bag Luxury Edition',
        price: 599000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/60RaXF3xbI',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 14. Aksesoris - Jam Tangan
  {
    id: 'jam-tangan',
    title: 'Jam Tangan',
    category: 'aksesoris',
    categoryName: 'Aksesoris',
    keywords: ['jam tangan', 'jam', 'arloji', 'watch', 'jam couple'],
    products: [
      {
        id: 'jam-1',
        brand: 'Elizabeth',
        name: 'Jam Tangan Wanita Strap Rantai Rose Gold Elegan',
        price: 189000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/4fwCwsOCcz',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'jam-2',
        brand: 'Casio',
        name: 'Jam Tangan Original Water Resistant Classic Series',
        price: 450000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/2BEryEvY6x',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'jam-3',
        brand: 'Alexandre Christie',
        name: 'Sapphire Classic Steel Luxury Couple/Bridal Watch',
        price: 890000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/AAH9Uxd41y',
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 15. Aksesoris - Dompet
  {
    id: 'dompet',
    title: 'Dompet',
    category: 'aksesoris',
    categoryName: 'Aksesoris',
    keywords: ['dompet', 'wallet', 'card holder', 'purse', 'dompet lipat'],
    products: [
      {
        id: 'dompet-1',
        brand: 'Prior',
        name: 'Card Holder & Mini Wallet Kulit Trendy Praktis',
        price: 59000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/5VVJxxmrk2',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'dompet-2',
        brand: 'Adorable Project',
        name: 'Long Zipper Wallet Aesthetic Pastel Design',
        price: 119000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/50Z3N5Hw07',
        image: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'dompet-3',
        brand: 'Oneda',
        name: 'Dompet Lipat Kulit Asli Kompartemen Luas',
        price: 189000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/2VriNNbj2a',
        image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 16. Skin Care
  {
    id: 'skin-care',
    title: 'Skin Care',
    category: 'kecantikan',
    categoryName: 'Kecantikan & Perawatan',
    keywords: ['skincare', 'skin care', 'serum', 'toner', 'moisturizer', 'perawatan wajah', 'cream wajah', 'facial'],
    products: [
      {
        id: 'skincare-1',
        brand: 'Wardah',
        name: 'Crystal Secret Glowing Skin Care 4-in-1 Starter Kit',
        price: 159000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/8fSLimQnMt',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'skincare-2',
        brand: 'NPURE',
        name: 'Cica Centella Asiatica Paket Lengkap Soothing Face Care',
        price: 249000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/AAH9WhVBYY',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'skincare-3',
        brand: 'Skintific',
        name: '5X Ceramide Barrier Repair Full Package Seserahan',
        price: 389000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/9peJ6vzoXe',
        image: 'https://images.unsplash.com/photo-1608248597359-2e06180a5e84?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 17. Body Care - Parfum
  {
    id: 'parfum',
    title: 'Parfum',
    category: 'kecantikan',
    categoryName: 'Kecantikan & Perawatan',
    keywords: ['parfum', 'perfume', 'parfume', 'wewangian', 'eau de parfum', 'cologne', 'fragrance'],
    products: [
      {
        id: 'parfum-1',
        brand: 'Iki Arum',
        name: 'Artisan Eau De Parfum Long Lasting Sweet Floral',
        price: 85000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/W6dzpcX6T',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'parfum-2',
        brand: 'HMNS',
        name: 'Orgasm / Farhampton Eau De Parfum 100ml Best Seller',
        price: 325000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/3qN5xwCZBq',
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'parfum-3',
        brand: 'Ahmed Al Maghribi',
        name: 'Luxury Arabian Perfume Oud & Rose Exclusive',
        price: 450000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/4AzwMX7mdY',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 18. Body Care - Body Care Set
  {
    id: 'body-care-set',
    title: 'Body Care Set',
    category: 'kecantikan',
    categoryName: 'Kecantikan & Perawatan',
    keywords: ['body care', 'body care set', 'body lotion', 'scrub', 'lulur', 'perawatan tubuh'],
    products: [
      {
        id: 'bodycare-1',
        brand: 'Herborist',
        name: 'Paket Lengkap Minyak Zaitun & Body Butter Spa Treatment',
        price: 89000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/7AdXw7lPDP',
        image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'bodycare-2',
        brand: 'Grace and Glow',
        name: 'Body Care Brightening Set Serum & Body Lotion',
        price: 149000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/1VzBBj2JQ4',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'bodycare-3',
        brand: 'Scarlett',
        name: 'Whitening Body Care Seserahan Special Box Bundle',
        price: 225000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/8V8vWYhcxV',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },

  // 19. Make Up
  {
    id: 'make-up',
    title: 'Make Up',
    category: 'kecantikan',
    categoryName: 'Kecantikan & Perawatan',
    keywords: ['make up', 'makeup', 'lipstik', 'bedak', 'cushion', 'eyeshadow', 'kosmetik', 'set makeup'],
    products: [
      {
        id: 'makeup-1',
        brand: 'Implora',
        name: 'Urban Lip Matte & Eye Makeup Essential Kit',
        price: 95000,
        tier: 'Pilihan hemat',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/8V8vXf5a3u',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'makeup-2',
        brand: 'Make Over',
        name: 'Powerstay Matte Cushion & Velvet Lip Complete Set',
        price: 269000,
        tier: 'Populer',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/905C7WzTmq',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'makeup-3',
        brand: 'Esqa',
        name: 'Goddess Flawless Complexion & Eyeshadow Palette Luxury',
        price: 399000,
        tier: 'Premium',
        checkedDate: 'Sep 2026',
        link: 'https://s.shopee.co.id/8KpVKLNcXm',
        image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&auto=format&fit=crop&q=80'
      }
    ]
  }
];

// Helper: Mencocokkan item seserahan dengan data rekomendasi affiliate
export const findAffiliateRecommendation = (itemTitle) => {
  if (!itemTitle || typeof itemTitle !== 'string') return null;
  const clean = itemTitle.toLowerCase().trim();

  // 1. Cek kecocokan langsung judul / id
  for (const aff of SESERAHAN_AFFILIATES) {
    if (clean === aff.title.toLowerCase()) return aff;
  }

  // 2. Cek apakah ada keyword yang terkandung dalam clean text
  for (const aff of SESERAHAN_AFFILIATES) {
    for (const kw of aff.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        return aff;
      }
    }
  }

  return null;
};
