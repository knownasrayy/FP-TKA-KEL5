# Final Project Kelompok 5 — Order Processing Service

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

---

## 1. Introduction

Final Project ini merupakan implementasi dari mata kuliah Teknologi Komputasi Awan, di mana kelompok kami bertindak sebagai Cloud Engineer yang diminta mendeploy, mengonfigurasi, dan mengoptimalkan sebuah **Order Processing Service** untuk sebuah startup e-commerce. Layanan ini menjadi inti dari proses transaksi pelanggan: membuat pesanan, mengecek status pesanan, dan menampilkan riwayat transaksi.

Backend disediakan dalam bentuk REST API berbasis **Python (Flask)** dengan database **MongoDB**, dideploy menggunakan **Gunicorn** sebagai WSGI server di belakang **Nginx** sebagai load balancer. Tantangan utama dari proyek ini adalah merancang arsitektur cloud yang mampu menangani lonjakan traffic (misalnya saat flash sale atau promo) secara stabil, namun tetap berada dalam batas anggaran maksimal **Rp 1.300.000/bulan (~$75)**.

Untuk mengukur kemampuan sistem dalam menangani beban, dilakukan **load testing** menggunakan Locust dengan lima skenario pengujian berbeda, dijalankan dari host yang terpisah dari server aplikasi agar hasil pengujian tidak terdistorsi oleh resource lokal.

---

## 2. Arsitektur Cloud

![Arsitektur Cloud](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/Arsitektur%20Cloud%20FP%20Kel%205.png)

Sistem dideploy menggunakan ekosistem **Microsoft Azure**, dengan tiga Virtual Machine yang masing-masing memiliki peran terpisah agar beban kerja tidak saling mengganggu satu sama lain:

- **VM 1 (`tka-loadbalancer`)** — menjalankan Nginx sebagai reverse proxy/load balancer sekaligus menyajikan file frontend.
- **VM 2 (`tka-backend-1`)** — menjalankan backend Flask di belakang dua proses Gunicorn (port 5001 dan 5002, masing-masing 3 worker), yang di-load balance oleh Nginx secara round-robin.
- **VM 3 (`tka-database`)** — menjalankan MongoDB sebagai database terpisah dari application server, sesuai rekomendasi soal agar performa query tidak terganggu oleh proses aplikasi.

### Spesifikasi VM & Estimasi Biaya

Kami memilih *ARM-based processors* (Ampere Altra) untuk efisiensi *price-to-performance*.

| Komponen Server | Fungsi Utama | Ukuran (Size) Azure | Harga per Bulan |
|---|---|---|---|
| **VM 1 (`tka-loadbalancer`)** | Frontend Web Server & Nginx Load Balancer | `Standard_B2ats_v2` (2 vCPU, 1GB RAM) | $7.81 |
| **VM 2 (`tka-backend-1`)** | Python Flask Backend API (Gunicorn) | `Standard_B2als_v2` (2 vCPU, 4GB RAM) | $31.24 |
| **VM 3 (`tka-database`)** | MongoDB Database Server | `Standard_B2als_v2` (2 vCPU, 4GB RAM) | $31.24 |
| **TOTAL BIAYA** | | | **$70.29** |

Total biaya berada di bawah batas anggaran maksimal $75/bulan yang ditentukan pada soal.

### Alasan Pemilihan Konfigurasi

Backend mendapat alokasi RAM lebih besar (4GB) dibanding load balancer (1GB) karena backend menjalankan proses Python/Gunicorn yang lebih berat dibanding Nginx yang relatif ringan untuk fungsi reverse proxy. Database dipisah ke VM tersendiri dengan spesifikasi yang sama dengan backend, mengikuti tips soal bahwa memisahkan MongoDB dari application server biasanya meningkatkan performa secara signifikan, karena I/O database tidak akan bersaing dengan proses komputasi aplikasi.

---

## 3. Implementasi

### 3.1 Backend (Flask + Gunicorn)

Backend dijalankan dengan dua proses Gunicorn terpisah pada port yang berbeda (5001 dan 5002), masing-masing dengan 3 worker:

```bash
./venv/bin/gunicorn -w 3 -b 0.0.0.0:5001 app:app --daemon
./venv/bin/gunicorn -w 3 -b 0.0.0.0:5002 app:app --daemon
```

> *(Catatan untuk Anggota 3: lampirkan juga konfigurasi systemd service yang digunakan agar Gunicorn otomatis menyala saat VM restart, sesuai pembagian tugas tim.)*

### 3.2 Load Balancer (Nginx)

Nginx dikonfigurasi sebagai reverse proxy yang meneruskan request dengan prefix `/api/` ke backend pool (round-robin antara dua proses Gunicorn), dan meneruskan request lainnya ke frontend:

```nginx
upstream backend_servers {
    server 98.70.0.131:5001;
    server 98.70.0.131:5002;
}

server {
    listen 80 default_server;
    root /var/www/html;

    location /api/ {
        rewrite ^/api(/.*)$ $1 break;
        proxy_pass http://backend_servers;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### 3.3 Database (MongoDB)

MongoDB dijalankan sebagai service tersendiri di VM 3, dan dikonfigurasi agar dapat diakses dari VM backend melalui jaringan internal (private). Database diisi (seed) menggunakan `mongorestore` dengan data awal yang terdiri dari produk, pengguna, dan riwayat pesanan.

> *(Catatan untuk Anggota 4: lampirkan detail index yang dibuat pada field `order_id` dan `created_at`, beserta perintah yang digunakan, misalnya:)*
> ```js
> db.orders.createIndex({ order_id: 1 })
> db.orders.createIndex({ created_at: -1 })
> ```

### 3.4 Frontend

Frontend dibangun menggunakan React (TanStack Start) yang melakukan request ke backend melalui Nginx. Frontend menyajikan halaman katalog produk, keranjang belanja, riwayat pesanan, autentikasi (login), dan dashboard admin.

---

## 4. Hasil Pengujian Endpoint

Pengujian setiap endpoint dilakukan menggunakan Postman terhadap base URL `http://20.198.72.134`.

| Endpoint | Method | Hasil | Screenshot |
|---|---|---|---|
| `/auth/login` | POST | 200 OK — berhasil login (admin), mengembalikan JWT token | `Screenshot (3484).png` |
| `/products` | GET | 200 OK — mengembalikan daftar produk dari MongoDB | `Screenshot (3485).png` |
| `/orders` | POST | 201 Created — order baru berhasil dibuat | `Screenshot (3486).png` |
| `/orders` (history) | GET | 200 OK — riwayat order berhasil diambil | `Screenshot (3487).png` |
| `/orders/<id>` | GET | 200 OK — detail/status order berhasil diambil | `Screenshot (3488).png` |
| `/orders/<id>/status` | PUT | 200 OK — status order berhasil diperbarui | `Screenshot (3489).png` |

Seluruh endpoint utama yang diuji mengembalikan response sesuai ekspektasi (2xx). Screenshot detail tersedia di folder `result/tka/`.

### Tampilan Frontend

> *(Sertakan screenshot halaman utama, login, cart, dan order history dari frontend yang sudah berjalan di sini.)*

---

## 5. Hasil Load Testing (Locust)

Pengujian dilakukan dari laptop yang terhubung pada jaringan yang berbeda dari server (sesuai ketentuan soal), menggunakan `Resources/Test/locustfile.py` terhadap host `http://20.198.72.134`.

> **⚠️ Status: hasil di bawah ini adalah hasil run sebelumnya dan BELUM final, perlu retest.** Ditemukan dua masalah pada run ini:
> 1. Koleksi `orders` di database saat ini hanya berisi 6 dokumen (seharusnya 10.000 dokumen seed) karena belum direstore ulang setelah dibersihkan pasca-testing. Query `GET /orders` yang diuji di sini kemungkinan tidak merepresentasikan performa sebenarnya saat data sudah menumpuk.
> 2. Skenario 5 pada run ini menggunakan **spawn rate 300**, padahal soal final (lihat `SOAL FP.md`) meminta **spawn rate 500**. Baris Skenario 5 di bawah perlu diulang dengan parameter yang benar.
>
> Angka RPS Aggregated diambil dari tab **Statistics** Locust (bukan grafik real-time di tab Charts, yang menunjukkan RPS sesaat dan cenderung lebih rendah dari rata-rata kumulatif).

| Skenario | Spawn Rate (user/detik) | User Diuji | Total Request | Failure | RPS Aggregated | Response Time (median / p99, ms) | Status |
|---|---|---|---|---|---|---|---|
| 1 — Maksimum RPS | 1 | 100 | 8.263 | 0 (0%) | **34.8** | 130 / 1.223 | 0% failure tercapai |
| 1 — Maksimum RPS | 1 | 110 | 10.401 | 110 (1,06%) | 40.4 | 130 / 2.466 | Failure pertama muncul |
| 2 — Peak Concurrency | 50 | 250 | 10.891 | 0 (0%) | 28.1 | 1.200 / 21.277 | 0% failure, tapi latensi sudah sangat tinggi |
| 3 — Peak Concurrency | 100 | 300 | 8.477 | 3 (0,035%) | 33.9 | 3.200 / 74.991 | Failure minor mulai muncul |
| 4 — Peak Concurrency | 200 | 200 | 9.946| 330 (1%) | 1.734,35 | 784,57 / 20.000 | Terjadi lonjakan eror dan latensi ekstrem. |
| 5 — Peak Concurrency | ~~300~~ **500** | 300 (parameter salah) | 4.762 | 52 (1,1%) | 99 | 840 / 4.160 | **Perlu retest dengan spawn rate 500** |

> **Rata-rata RPS tertinggi dengan failure 0% (Skenario 1): 34,8 RPS**, tercapai pada 100 concurrent user. Berdasarkan skala penilaian soal (200 RPS = 30 poin), ini setara kurang lebih (34,8/200) × 30 ≈ 5,2 poin — masih jauh dari optimal, sehingga sangat disarankan melakukan tuning (jumlah worker Gunicorn, index MongoDB pada `orders`, connection pool) sebelum laporan final disusun.

> **Catatan tambahan dari data Statistics:** pada Skenario 2 dan 3, failure rate memang masih mendekati/sama dengan 0%, namun response time p99 sudah mencapai puluhan detik (21–75 detik). Ini mengindikasikan request tidak gagal, tapi mengalami *queueing* parah — gejala umum dari kurangnya jumlah worker backend atau koneksi MongoDB yang menjadi bottleneck. Hal ini layak dibahas di bagian Kesimpulan, karena "0% failure" tidak selalu berarti sistem benar-benar sehat pada beban tersebut.

### Dokumentasi Resource Utilization

> **⚠️ Belum ada di repository.** Soal poin 3 secara eksplisit meminta "screenshot resource utilization (CPU, memory) server selama pengujian" (misalnya output `htop` atau Azure Monitor) — ini belum ditemukan di folder `result/`. Anggota 6 (Data & Metric Monitor) perlu melampirkan ini sebelum submission final.

### Dokumentasi Grafik & Statistik Locust

Setiap skenario memiliki dua jenis dokumentasi: grafik real-time (tab **Charts**, file `scene N_X.png`) dan tabel statistik kumulatif (tab **Statistics**, file `N_X.png`).

#### Skenario 1 — Spawn Rate = 1; User 10→100→110
![Charts 100 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/scene%201_100.png)
![Stats 100 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/1_100.png)
![Charts 110 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/scene%201_110.png)
![Stats 110 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/1_110.png)

#### Skenario 2 — Spawn Rate = 50; User 50→250→300
![Charts 250 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/scene%202_250.png)
![Stats 250 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/2_250.png)
![Charts 300 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/scene%202_300.png)

#### Skenario 3 — Spawn Rate = 100; User 100→300→400
![Charts 300 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/scene%203_300.png)
![Stats 300 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/3_300.png)
![Charts 400 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/scene%203_400.png)

#### Skenario 4 — Spawn Rate = 200; User 200
![Charts 200 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/scene%204_200.png)
![Stats 200 user](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/4_200.png)

#### Skenario 5 — **Perlu retest dengan Spawn Rate = 500** (run sebelumnya memakai spawn rate 300)
![Charts 300 user (run lama, akan diganti)](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/scene%205_300.png)
![Stats 300 user (run lama, akan diganti)](https://github.com/knownasrayy/FP-TKA-KEL5/blob/main/result/5_300.png)

---

## 6. Kesimpulan dan Saran

- Pemisahan komponen ke dalam tiga VM (load balancer+frontend, backend, database) memudahkan isolasi beban kerja dan memungkinkan masing-masing komponen di-scale secara independen di masa depan.
- RPS tertinggi dengan failure 0% yang berhasil dicapai sistem saat ini adalah **34,8 RPS** (pada 100 concurrent user, spawn rate 1). Angka ini relatif rendah dibanding skala penilaian soal (200 RPS), sehingga ada ruang besar untuk optimasi sebelum laporan final.
- Temuan penting: pada Skenario 2 dan 3, failure rate memang mendekati 0%, namun response time p99 melonjak hingga 21–75 detik. Ini menunjukkan bottleneck bukan pada *crash* atau error eksplisit, melainkan pada *queueing* — request tetap "berhasil" tapi pengguna nyata akan mengalami waktu tunggu yang sangat lama. Hal ini kemungkinan disebabkan oleh jumlah worker Gunicorn yang terbatas (saat ini 2 proses × 3 worker) atau connection pool MongoDB yang belum dioptimalkan.
- Index pada field `order_id` dan `created_at` penting untuk menjaga performa query `GET /orders` tetap stabil seiring data bertambah; tanpa index ini, query history akan melakukan full collection scan yang semakin lambat saat data menumpuk. Hal ini perlu diverifikasi sudah diterapkan dengan benar sebelum load testing final, karena baseline data saat ini belum dalam kondisi 10.000 dokumen seed yang seharusnya.
- Untuk deployment produksi nyata, disarankan menambahkan auto-scaling group untuk backend, menambah jumlah worker Gunicorn atau menambah VM backend tambahan, serta mempertimbangkan caching (misalnya Redis) untuk endpoint yang sering diakses seperti daftar produk.

---

## Struktur Repository

```
FP-TKA-KEL5/
├── README.md
├── Resources/
│   ├── BE/        # Backend Flask
│   ├── DB/        # Dump seed MongoDB
│   ├── FE/        # Frontend
│   └── Test/      # Locustfile
└── result/        # Screenshot Postman, Locust, htop, arsitektur
```
