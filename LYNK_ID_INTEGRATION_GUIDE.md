# Panduan Integrasi Otomatisasi Lynk.id ➔ Amara (amarawedding.id)

Dokumentasi ini menjelaskan cara mengaktifkan pemrosesan akses otomatis untuk pembeli Amara dari **Lynk.id** tanpa perlu vendor pihak ketiga (tanpa Resend / WA Gateway), memanfaatkan sistem notifikasi & invoice bawaan Lynk.id dan Supabase Edge Functions.

---

## 🎯 Cara Kerja Sistem (User Experience)

Sistem ini menggunakan pendekatan **Dual-System (Otomatis & Fleksibel)**:

### 1. Auto-Unlock by Email (Alur Utama - Tanpa Perlu Masukkan Kode)
1. Pembeli checkout produk Amara di Lynk.id menggunakan email (misal: `budi@gmail.com`).
2. Begitu pembayaran selesai, Lynk.id otomatis memanggil webhook Supabase Amara.
3. Supabase langsung menandai email `budi@gmail.com` sebagai pembeli berbayar aktif.
4. Lynk.id mengirimkan email konfirmasi / invoice resmi yang berisi tombol **"Akses Produk"** menuju `https://amarawedding.id`.
5. Pembeli klik link tersebut dan login/daftar menggunakan Google atau Email `budi@gmail.com`.
6. **Amara langsung terbuka penuh seketika tanpa perlu memasukkan kode akses apa pun!**

### 2. Order ID Fallback (Alur Cadangan - Jika Email Berbeda)
1. Jika pembeli checkout di Lynk.id menggunakan email A (misal email kantor), tetapi ingin mendaftar Amara menggunakan email B (email pribadi).
2. Di invoice / email Lynk.id, selalu tercantum nomor **No. Pesanan / Order ID / Ref ID** (contoh: `ORD-98214` atau `REF-849201`).
3. Webhook Supabase otomatis mendaftarkan Order ID tersebut sebagai kode akses.
4. Pembeli cukup memasukkan Order ID tersebut di kolom **"Kode Akses / Order ID Lynk.id"** di Amara.
5. Akun langsung aktif!

---

## 🛠️ Langkah-Langkah Konfigurasi (Setup)

### Langkah 1: Jalankan SQL Migration di Supabase
1. Buka [Dashboard Supabase](https://supabase.com/dashboard) Anda.
2. Pilih project Amara Anda.
3. Masuk ke menu **SQL Editor** di sidebar kiri.
4. Klik **New Query**.
5. Buka file [`supabase/lynk-webhook-setup.sql`](./supabase/lynk-webhook-setup.sql), salin seluruh isinya, lalu paste ke SQL Editor.
6. Klik tombol **Run** (atau tekan `Ctrl+Enter`).
7. Pastikan muncul notifikasi **"Success. No rows returned"**.

---

### Langkah 2: Deploy Edge Function ke Supabase

File Edge Function sudah tersedia di:  
[`supabase/functions/lynk-webhook/index.ts`](./supabase/functions/lynk-webhook/index.ts)

Anda dapat men-deploy-nya dengan salah satu dari dua cara berikut:

#### Opsi A: Lewat Dashboard Supabase (Paling Mudah)
1. Di Dashboard Supabase, klik menu **Edge Functions** di sidebar kiri.
2. Klik tombol **Create a new function** atau **New Function**.
3. Beri nama: `lynk-webhook`.
4. Salin seluruh isi file [`supabase/functions/lynk-webhook/index.ts`](./supabase/functions/lynk-webhook/index.ts) dan paste ke editor browser.
5. Klik tombol **Deploy**.
6. **PENTING (Matikan Enforce JWT Verification)**:
   - Klik nama function **`lynk-webhook`**.
   - Buka tab/menu **Settings** (atau ikon titik tiga `...`).
   - Pada opsi **"Enforce JWT Verification"**, ubah menjadi **OFF (dinonaktifkan)** lalu klik **Save**.
   *(Hal ini wajib dimatikan karena Lynk.id adalah webhook eksternal yang tidak membawa token login Supabase).*
7. Salin URL endpoint function Anda. Formatnya:
   ```
   https://<PROJECT_REF>.supabase.co/functions/v1/lynk-webhook
   ```
   *(Catatan: ganti `<PROJECT_REF>` dengan ID project Supabase Anda)*

#### Opsi B: Lewat Terminal / Supabase CLI
Jalankan perintah berikut di folder proyek:
```bash
npx supabase functions deploy lynk-webhook --no-verify-jwt
```

> **Keamanan Tambahan (Opsional):**  
> Jika Anda ingin memvalidasi signature webhook, buka **Edge Functions** > **lynk-webhook** > **Secrets** (atau Project Settings > Edge Functions > Secrets) dan tambahkan:  
> `LYNK_WEBHOOK_SECRET` = `merchant-key-dari-lynk-id`

---

### Langkah 3: Konfigurasi Webhook di Lynk.id
1. Login ke akun [Lynk.id](https://lynk.id) Anda.
2. Buka **Settings** ➔ **Integrations** ➔ **Webhooks**.
3. Di kolom URL Webhook, masukkan URL Edge Function Anda:
   ```
   https://<PROJECT_REF>.supabase.co/functions/v1/lynk-webhook
   ```
4. Klik **Save URL**.
5. Lynk.id akan menampilkan status aktif dan memberikan *Merchant Key*.

---

### Langkah 4: Konfigurasi Produk Amara di Lynk.id
1. Masuk ke halaman **Products** / kelola produk digital Amara Anda di Lynk.id.
2. Pada bagian tautan / **Link Akses Produk**, masukkan:
   ```
   https://amarawedding.id
   ```
3. Pada bagian **Custom Receipt / Thank You Note / Pesan Setelah Pembayaran**, masukkan teks berikut:

```markdown
Terima kasih atas pembelian Amara Wedding Organizer! ✨

Untuk mulai menggunakan Amara:
1. Klik tombol "Akses Produk" di bawah atau buka https://amarawedding.id
2. Masuk / Daftar akun menggunakan email yang sama dengan pembelian ini untuk aktivasi otomatis (bisa gunakan "Lanjutkan dengan Google").
3. Jika Anda mendaftar dengan email berbeda, gunakan No. Pesanan (Order ID) pada bukti pembelian ini sebagai Kode Akses Anda.

Selamat merencanakan pernikahan impian Anda bersama Amara! 💍
```

---

## 🧪 Cara Uji Coba (Testing / Simulasi)

Untuk menguji apakah webhook berfungsi tanpa harus melakukan transaksi sungguhan, Anda bisa menjalankan simulasi `cURL` berikut dari terminal laptop Anda:

```bash
curl -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/lynk-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "TEST-LYNK-001",
    "customer_name": "Test User",
    "customer_email": "testbuyer@gmail.com",
    "status": "PAID"
  }'
```

**Respon Sukses yang Diharapkan:**
```json
{
  "success": true,
  "message": "Lynk.id order processed successfully",
  "code": "TEST-LYNK-001",
  "activation_url": "https://amarawedding.id/?code=TEST-LYNK-001"
}
```

Setelah itu:
1. Buka tabel `access_codes` di Supabase Table Editor. Anda akan melihat baris baru dengan kode `TEST-LYNK-001` dan email `testbuyer@gmail.com`.
2. Buka `https://amarawedding.id` di browser, coba daftar dengan email `testbuyer@gmail.com` atau masukkan kode `TEST-LYNK-001` ➔ Akun langsung aktif!

---

## 📋 Ringkasan File Terkait

| File | Keterangan |
| :--- | :--- |
| [`supabase/lynk-webhook-setup.sql`](./supabase/lynk-webhook-setup.sql) | Skrip SQL untuk update gatekeeper `check_user_access()` dan auto-link email |
| [`supabase/functions/lynk-webhook/index.ts`](./supabase/functions/lynk-webhook/index.ts) | Kode Supabase Edge Function penerima webhook POST dari Lynk.id |
| [`src/App.jsx`](./src/App.jsx) | Auto-claim jika URL membawa query `?code=` atau `?order_id=` saat user sudah login |
| [`src/components/AccessGatekeeperModal.jsx`](./src/components/AccessGatekeeperModal.jsx) | Modal gatekeeper dengan auto-fill URL, dukungan Order ID, dan tombol cek status email |
| [`src/pages/Auth.jsx`](./src/pages/Auth.jsx) | Halaman login/daftar yang mendukung auto-unlock via email Lynk.id dan Order ID |
