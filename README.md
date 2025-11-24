# KidneyStone Detection System

Sistem deteksi batu ginjal menggunakan YOLOv8 dan Gemini AI untuk analisis CT Scan.

## Backend Repository
Backend Flask tersedia di repo terpisah:
https://github.com/grenly-del/project_AI 
## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Chart.js
- **Backend**: Flask, Python, MongoDB, YOLOv8, Google Gemini AI
- **Cloud Storage**: Cloudinary (dengan base64 fallback)

## Getting Started

### Prerequisites

- Node.js 18+ dan npm/yarn
- Python 3.10+
- MongoDB (local atau cloud)
- Google Gemini API Key

### Frontend Setup


1. Clone Frontend:
```bash
git clone https://github.com/Diyoncrz18/KidneyStoneClasify-Project.git
```
2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_BASEURL_BE=http://127.0.0.1:5000
BASEURL_BE=http://127.0.0.1:5000
```

4. Run development server:
```bash
npm run dev
```

Frontend akan berjalan di [http://localhost:3000](http://localhost:3000)

### Backend Setup
1. Clone Backend:
```bash
git clone https://github.com/grenly-del/project_AI.git
```

2. Navigate to backend directory:
```bash
cd backend
```

3. Create virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Copy environment example:
```bash
cp env.example .env
```

6. Edit `.env` file and fill in:
```env
FLASK_ENV=development
FLASK_APP=app.py
SECRET_KEY=supersecretkey
GEMINI_KEY=<masukkan key>

MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB_NAME=kidneystone_db

CLOUDINARY_CLOUD_NAME=dedu45dov
CLOUDINARY_API_KEY=173836476677588
CLOUDINARY_API_SECRET=HLfZoX-0ogbTsTYFyEEw-scehcw

```

7. Place YOLOv8 model file at `backend/app/model/best.pt`

8. Run backend:
```bash
python wsgi.py
```

Backend akan berjalan di [http://localhost:5000](http://localhost:5000)

## Features

- ✅ Upload dan analisis gambar CT Scan
- ✅ Deteksi batu ginjal menggunakan YOLOv8
- ✅ Visualisasi Grad-CAM
- ✅ Analisis AI menggunakan Gemini
- ✅ Manajemen pasien dan riwayat scan
- ✅ Dashboard dengan analytics
- ✅ Model performance tracking
- ✅ Notifikasi sistem
- ✅ Settings dan preferences

## Project Structure

```
kidneystonefe/
├── backend/              # Flask backend
│   ├── app/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── model/        # YOLOv8 model
│   ├── config.py         # Configuration
│   └── wsgi.py           # WSGI entry point
├── src/                  # Next.js frontend
│   ├── app/              # App router pages
│   └── components/       # React components
└── package.json          # Frontend dependencies
```

## Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_BASEURL_BE`: Backend API URL

### Backend (.env)
- `GEMINI_KEY`: Google Gemini API key (required)
- `MONGO_URI`: MongoDB connection string
- `MONGO_DB_NAME`: Database name
- `CLOUDINARY_*`: Cloudinary credentials (optional)
- `CORS_ORIGINS`: Allowed CORS origins
- `DEBUG`: Debug mode
- `SECRET_KEY`: Flask secret key

## Notes

- Cloudinary adalah optional. Jika tidak dikonfigurasi, aplikasi akan menggunakan base64 encoding untuk gambar.
- Pastikan model YOLOv8 (`best.pt`) ada di `backend/app/model/`
- Untuk production, ubah `SECRET_KEY` dan `DEBUG=False`

## License

Private project
