# KidneyStone Detection System

Sistem deteksi batu ginjal menggunakan YOLOv8 dan Gemini AI untuk analisis CT Scan.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Chart.js
- **Backend**: Flask, Python, MongoDB, YOLOv8, Google Gemini AI
- **Cloud Storage**: Cloudinary (optional, dengan base64 fallback)

## Getting Started

### Prerequisites

- Node.js 18+ dan npm/yarn
- Python 3.10+
- MongoDB (local atau cloud)
- Google Gemini API Key

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_BASEURL_BE=http://localhost:5000
```

3. Run development server:
```bash
npm run dev
```

Frontend akan berjalan di [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy environment example:
```bash
cp env.example .env
```

5. Edit `.env` file and fill in:
```env
GEMINI_KEY=your_gemini_api_key_here
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=kidneystone_db
CLOUDINARY_CLOUD_NAME=your_cloud_name  # Optional
CLOUDINARY_API_KEY=your_api_key        # Optional
CLOUDINARY_API_SECRET=your_api_secret  # Optional
CORS_ORIGINS=http://localhost:3000
DEBUG=True
SECRET_KEY=your-secret-key-here
```

6. Place YOLOv8 model file at `backend/app/model/best.pt`

7. Run backend:
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
