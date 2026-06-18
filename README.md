# Final Project Kelompok 5

## Anggota

| NRP         | Nama                           |
|-------------|--------------------------------|
| 5027241007  | Revalina Erica Permatasari     |
| 5027241028  | Hansen Chang                   |
| 5027241043  | Azaria Raissa M                |
| 5027241052  | Salsa Bil Ulla                 |
| 5027241090  | Tiara Fatimah Azzahra          |
| 5027241095  | Nafis Faqih Almuzaky Maolidi   |
| 5027241102  | Rayhan Agnan Kusuma            |
| 5027241120  | Mohamad Arkan Zahir Asyafiq    |

## Spesifikasi VM & Alokasi Anggaran (Budget)

Kami mendeploy sistem ini menggunakan ekosistem **Microsoft Azure** dengan spesifikasi *ARM-based processors* (Ampere Altra) untuk efisiensi *price-to-performance* terbaik.

| Komponen Server | Fungsi Utama | Ukuran (Size) Azure | Harga per Bulan |
|---|---|---|---|
| **VM 1 (`tka-loadbalancer`)** | Frontend Web Server & Nginx Load Balancer | `Standard_B2ats_v2` (2 vCPU, 1GB RAM) | $7.81 |
| **VM 2 (`tka-backend-1`)** | Python Flask Backend API (Gunicorn) | `Standard_B2als_v2` (2 vCPU, 4GB RAM) | $31.24 |
| **VM 3 (`tka-database`)** | MongoDB Database Server | `Standard_B2als_v2` (2 vCPU, 4GB RAM) | $31.24 |
| **TOTAL BIAYA** | | | **$70.29** |

## Arsitektur Cloud

![Arsitektur Cloud](Dokumentasi/Arsitektur%20Cloud%20FP%20Kel%205.png)

## Locust Tester

| Skenario | Spawn Rate (Beban/Detik) | Tahapan User yang Diuji | Hasil Akhir & Titik Kegagalan | Kapasitas Maksimal Aman |Interpretasi|
|---|---|---|---|---|---|
| Skenario 1| 1 |10, 20, 30, .., 110| Failure 1% muncul di 110 user| 100 user|Batas throughput murni server. Karena dinaikkan sangat halus (1 user/detik), server punya waktu untuk bersiap. Angka 100 user adalah titik kestabilan tertinggi di mana CPU/RAM dan database MongoDB bekerja di kapasitas optimalnya tanpa menghasilkan eror.|
|Skenario 2| 50| 50, 100, 150, .., 300| Failure 1% muncul di 300 user|250 user|Server sanggup menerima gelombang user berskala 50 user sekaligus. Angka 250 user menunjukkan batas atas jumlah sesi aktif yang bisa dikelola aplikasi secara paralel sebelum antrean request mulai menumpuk.|
|Skenario 3|100|100, 200, 300, 400| Failure 1% muncul di 400 user|300 user|Server bisa menampung hingga 300 user jika diberikan 100 user sekaligus. Namun begitu menyentuh 400 user, memori backend atau connection pool MongoDB habis, menyebabkan 1% request hang/gagal.|
|Skenario 4| 200|200, 400| Warm-up spike tinggi di awal (kaget)|<200 user|Server mengalami Cold Start/Warm-up Spike. Masuknya 200 user dalam 1 detik membuat sistem kaget karena koneksi database belum siap. Meskipun akhirnya turun ke 1%, lonjakan eror di detik-detik awal membuat skenario ini dikategorikan tidak aman.|
|Skenario 5| 300|300, 600| Warm-up spike tinggi di awal (kaget)|<300 user|Gempuran 300 user dalam waktu bersamaan langsung membuat server mengalami bottleneck instan di awal. Sistem tidak mampu melakukan scaling secepat kedatangan user.|
