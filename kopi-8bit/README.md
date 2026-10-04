# ☕ KOPI 8-BIT — Website Usaha Kopi Retro Arcade

Website usaha kedai kopi interaktif bergaya **Retro 8-Bit / Pixel Arcade** dengan beragam fitur canggih, interaktif, dan audio sintetis Web Audio API tanpa perlu aset eksternal.

---

## 🎮 Fitur Utama

1. **Start Screen Arcade (Press Start to Website)**:
   - Tampilan pembuka bergaya ding-dong arcade klasik (*"INSERT COIN TO PLAY"*, tombol *"PRESS START TO BREW"*).
   - Animasi maskot cangkir pixel melayang.
   - Suara start fanfare dan aktivasi otomatis BGM chiptune begitu tombol ditekan.
   - Tombol **RESTART** di navbar untuk memutar ulang intro kapan saja.

2. **Musik Chiptune & Efek Suara 8-Bit (Web Audio API)**:
   - 100% audio sintetis real-time murni dari browser (bebas ketergantungan file `.mp3` eksternal).
   - Pilihan track: *"Cozy 8-Bit Cafe"* & *"Pixel Cold Brew Beat"*.
   - Kontrol Musik ON/OFF, ganti lagu, dan kontrol SFX ON/OFF.
   - Efek suara interaktif: koin saat tambah ke keranjang, tombol blip, power-up fanfare, buzzer cetak struk matrix printer.

3. **Cangkir Interaktif ("Lihat Cangkirnya Berubah")**:
   - Visualisasi cangkir kopi pixel yang bereaksi secara real-time saat Anda mengklik menu apa pun.
   - Level dan warna cairan kopi berubah dinamis (espresso pekat, latte susu, matcha hijau, dsb).
   - Tombol pengatur suhu:
     - **Dingin (Es)**: Memunculkan balok es pixel yang terapung di cangkir.
     - **Panas**: Memunculkan animasi kepulan uap pixel yang membubung ke atas.
   - Tampilan bar meter RPG: **Caffeine Boost**, **Energy Level**, dan **Sweetness**.

4. **Fitur Cetak Struk Thermal (Thermal Receipt)**:
   - Form pemesanan lengkap: Nama/Gamer Tag, Nomor WhatsApp, Tipe Pesanan (Antar ke Alamat 20 Menit, Dine In, Takeaway), dan Pilihan Pembayaran (QRIS, Tunai/COD, Transfer).
   - Animasi struk keluar dari mesin printer disertai efek suara mesin printer dot-matrix.
   - Struk memuat: Logo toko, No. Pesanan `#8BIT-XXXX`, rincian item, subtotal, diskon, kode barcode & pixel QR code.
   - Pilihan aksi:
     - 🖨️ **Cetak Struk (Print)**: Diformat khusus agar hanya struk yang dicetak saat print (`@media print`).
     - 💬 **Kirim ke WhatsApp**: Format struk siap kirim langsung ke nomor WhatsApp pesanan.
     - 💾 **Simpan Struk (.TXT)**: Unduh file teks struk langsung ke komputer.

5. **Mini-Game Arcade: "Tangkap Biji Kopi"**:
   - Game 25 detik berbasis HTML5 Canvas & Web Audio SFX.
   - Tangkap biji kopi biasa & biji emas, hindari serangga glitch.
   - Dapatkan voucher diskon langsung:
     - Skor $\ge 50$: Voucher Diskon 10% (`PIXEL10`).
     - Skor $\ge 100$: Voucher Diskon 20% (`BOSSBEANS20`).
     - Voucher otomatis memotong total harga di keranjang belanja!

6. **Radar Pengantaran Kopi (20 Menit)**:
   - Motor kurir pixel yang bergerak melintasi radar pengantaran (Pesanan Diterima $\rightarrow$ Diseduh Barista $\rightarrow$ Kurir On The Way $\rightarrow$ Kopi Sampai).

7. **Filter Layar Monitor CRT (Scanlines)**:
   - Tombol **CRT** di navbar untuk menyalakan/mematikan efek garis scanline televisi tabung jadul.

8. **Secret Konami Code (Easter Egg)**:
   - Ketik kombinasi rahasia pada keyboard:  
     `↑ ↑ ↓ ↓ ← → ← → B A`
   - Membuka diskon rahasia 30% dan gratis 1 **Power Donut Pixel**!

---

## 🚀 Cara Menjalankan Website

Cukup buka file `index.html` langsung di browser favorit Anda (Google Chrome, Microsoft Edge, Firefox, dll), atau klik kanan file `index.html` dan pilih **Open with Live Server** / **Buka dengan Browser**.
