# JastipDigitalBase44

_Modular Vite + React app scaffolded by Base44, customized for JastipDigital._

JastipDigitalBase44 adalah fondasi aplikasi jastip digital yang scalable dan compliant, dengan fitur opsional seperti pelacakan GPS, penyesuaian harga berbasis cuaca, dan audit trail untuk kepatuhan PSE.

---

## 🚀 Menjalankan Aplikasi

```bash
npm install
npm run dev
npm run build
jastip-digital-base44/
├── .gitignore              # File pengecualian Git
├── components.json         # Metadata atau konfigurasi komponen
├── eslint.config.js        # Konfigurasi linting JavaScript
├── index.html              # Entry point HTML untuk Vite
├── jsconfig.json           # Konfigurasi path dan IntelliSense
├── package.json            # Metadata dan dependensi proyek
├── postcss.config.js       # Konfigurasi PostCSS
├── tailwind.config.js      # Konfigurasi Tailwind CSS
├── vite.config.js          # Konfigurasi Vite bundler
├── README.md               # Dokumentasi proyek
└── src/                    # Source code utama
    ├── api/
    │   ├── base44client/
    │   ├── entities/
    │   ├── functions/
    │   └── integrations/
    ├── components/
    │   ├── admin/
    │   ├── donation/
    │   ├── driver/
    │   ├── hooks/
    │   ├── maps/
    │   ├── notifications/
    │   ├── order/
    │   ├── payment/
    │   ├── services/
    │   ├── support/
    │   ├── ui/
    │   ├── utils/
    │   └── wallet/
    ├── hooks/
    │   └── use-mobile.js
    ├── lib/
    │   └── utils.js
    ├── pages/
    │   └── [>30 halaman modular seperti Dashboard, DriverActivation, Wallet, dll.]
    ├── utils/
    │   └── index.ts
    ├── App.css
    ├── App.js
    ├── index.css
    └── main.js
🧩 Fitur Modular
✅ Penyesuaian harga berdasarkan GPS/cuaca

🔐 Role-based access & audit trail

🧠 Integrasi AI agent untuk migrasi & compliance

📝 Draft pakta integritas dan PSE-ready config
