/**
 * Tutorial Amara Wedding Companion
 * Playlist 8 video edukasi step-by-step oleh Dhova & Maipa
 */

export const TUTORIAL_VIDEOS = [
  {
    id: 1,
    part: 'Part #1',
    title: 'Tampilan Awal & Beranda',
    duration: '1:22',
    videoId: 'YdnkMuMj4OA',
    youtubeUrl: 'https://youtu.be/YdnkMuMj4OA?si=H48yZwDMyAdOcZIs',
    relatedPath: '/overview',
    relatedName: 'Buka Beranda',
    description: 'Kenali gambaran umum dashboard Amara, countdown hari H, ringkasan progres keseluruhan, dan cara membaca grafik kolaborasi tugas bersama pasangan.',
    tags: ['Beranda', 'Dashboard', 'Countdown']
  },
  {
    id: 2,
    part: 'Part #2',
    title: 'Menambahkan & Custom Tugas Persiapan Pernikahan',
    duration: '2:18',
    videoId: 'U33AZvEfcIE',
    youtubeUrl: 'https://youtu.be/U33AZvEfcIE?si=D7-IYtpJt6CtzK7H',
    relatedPath: '/activities',
    relatedName: 'Buka Aktivitas',
    description: 'Panduan menyusun checklist aktivitas pernikahan, membagi tugas ke calon pengantin pria (CPP), calon pengantin wanita (CPW), atau tugas bersama, serta menambahkan kategori kustom.',
    tags: ['Checklist', 'Bagi Tugas', 'Aktivitas']
  },
  {
    id: 3,
    part: 'Part #3',
    title: 'Menyusun Timeline Persiapan Pernikahan',
    duration: '1:38',
    videoId: 'KAlbjNB0bps',
    youtubeUrl: 'https://youtu.be/KAlbjNB0bps?si=MpzXm34K2B95r6ei',
    relatedPath: '/timeline',
    relatedName: 'Buka Jadwal',
    description: 'Cara mengatur batas waktu (deadline) setiap agenda persiapan pernikahan agar terstruktur rapi dari hitungan bulan ke belakang hingga mendekati hari pernikahan.',
    tags: ['Jadwal', 'Timeline', 'Deadline']
  },
  {
    id: 4,
    part: 'Part #4',
    title: 'Mengelola Tabungan, Budgeting, & Pengeluaran Nikah',
    duration: '5:55',
    videoId: 'B8ckgyK1YSk',
    youtubeUrl: 'https://youtu.be/B8ckgyK1YSk?si=TTkoTVj8tq4JIA4s',
    relatedPath: '/budget',
    relatedName: 'Buka Anggaran',
    description: 'Pelajari cara menghitung target tabungan nikah bulanan, mengalokasikan pos anggaran (venue, katering, busana, dll), serta mencatat DP dan pelunasan vendor secara transparan.',
    tags: ['Budget', 'Dana Nikah', 'Tabungan']
  },
  {
    id: 5,
    part: 'Part #5',
    title: 'Menentukan & Mengelola Seserahan dengan Mudah',
    duration: '1:44',
    videoId: 'jEIPlogmbsA',
    youtubeUrl: 'https://youtu.be/jEIPlogmbsA?si=DCsiHSSPOLZUVz10',
    relatedPath: '/seserahan',
    relatedName: 'Buka Seserahan',
    description: 'Panduan mengelompokkan barang seserahan ke dalam baki/kotak, mencatat estimasi biaya, menandai barang yang sudah terbeli, dan melihat rekomendasi produk.',
    tags: ['Seserahan', 'Baki', 'Hantaran']
  },
  {
    id: 6,
    part: 'Part #6',
    title: 'Menentukan Vendor Pernikahan Terbaik',
    duration: '1:52',
    videoId: 'Yhf8Okc6zgY',
    youtubeUrl: 'https://youtu.be/Yhf8Okc6zgY?si=2-UAsaqk3bJr3_Mh',
    relatedPath: '/vendor',
    relatedName: 'Buka Vendor',
    description: 'Cara membandingkan beberapa opsi vendor per kategori, menyimpan kontak WhatsApp PIC, menandai vendor terpilih, dan menyinkronkan biayanya ke anggaran.',
    tags: ['Vendor', 'Fotografer', 'Katering']
  },
  {
    id: 7,
    part: 'Part #7',
    title: 'Lebih Mudah dalam Mengelola Daftar Tamu',
    duration: '2:30',
    videoId: 'e3Gc8nDvBdc',
    youtubeUrl: 'https://youtu.be/e3Gc8nDvBdc?si=67XVWSZVc-woPfiw',
    relatedPath: '/guest-list',
    relatedName: 'Buka Tamu',
    description: 'Mengatur daftar tamu undangan keluarga pria, wanita, maupun teman kantor, memisahkan tamu VIP, memantau jumlah pax, serta mengirimkan RSVP langsung via WhatsApp.',
    tags: ['Tamu', 'Undangan', 'RSVP']
  },
  {
    id: 8,
    part: 'Part #8',
    title: 'Pengaturan & Cara Kolaborasi dengan Calon Pasangan',
    duration: '2:15',
    videoId: '1ialem-BAww',
    youtubeUrl: 'https://youtu.be/1ialem-BAww?si=6y8M1AOywSa7u_85',
    relatedPath: '/settings',
    relatedName: 'Buka Pengaturan',
    description: 'Cara mengundang calon pasangan via link/kode akses bersama agar kedua akun terhubung secara real-time, sinkronisasi data instan, dan melengkapi data profil pernikahan.',
    tags: ['Kolaborasi', 'Invite Pasangan', 'Pengaturan']
  }
];

export const getTutorialByPath = (pathname) => {
  if (!pathname) return null;
  const clean = pathname.split('?')[0].toLowerCase();
  return TUTORIAL_VIDEOS.find(v => v.relatedPath.toLowerCase() === clean) || null;
};
