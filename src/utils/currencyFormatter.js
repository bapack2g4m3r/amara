/**
 * Utility untuk memformat input nominal harga dengan pemisah ribuan otomatis (titik).
 * Contoh: 114000 -> "114.000", 2500000 -> "2.500.000"
 */

// Format string atau number menjadi string berpemisah ribuan Indonesia (titik)
export const formatThousand = (val) => {
  if (val === '' || val === null || val === undefined) return '';
  const str = String(val).trim();
  
  // Ambil hanya digit angka
  const clean = str.replace(/\D/g, '');
  if (!clean) return '';

  return new Intl.NumberFormat('id-ID').format(Number(clean));
};

// Mengubah string berpemisah ribuan menjadi number murni untuk disimpan ke database
export const parseThousand = (val) => {
  if (val === '' || val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  const clean = String(val).replace(/\D/g, '');
  return Number(clean) || 0;
};

// Format mata uang Rupiah lengkap (Rp 114.000)
export const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};
