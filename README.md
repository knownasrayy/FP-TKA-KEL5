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

![Arsitektur Cloud](Dokumentasi/Arsitektur_Cloud_FP_Kel_26.png)
