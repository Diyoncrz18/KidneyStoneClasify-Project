# KidneyStone Project AI Agent Instructions

## Project Architecture

This is a kidney stone detection application with a Next.js frontend and Flask backend architecture:

### Frontend (Next.js)

- Located in `/src/app/`
- Uses App Router pattern with TypeScript
- Key pages:
  - `/upload`: Main image upload and detection interface
  - `/dashboard`: Analytics dashboard
  - `/model`: Model information page

### Backend (Flask)

- Located in `/backend/`
- Core services:
  - `yolo_service.py`: Handles image detection using YOLOv8
  - `gemini_service.py`: Provides AI-powered descriptions
  - `detection_routes.py`: API endpoints for image processing

## Key Integration Points

1. Image Detection Flow:

   - Frontend uploads image to `/detect` endpoint
   - Backend processes with YOLO model at `app/model/best.pt`
   - Results include confidence scores and processed images

2. Environment Configuration:
   - Backend requires `.env` with `GEMINI_KEY`
   - Frontend uses `NEXT_PUBLIC_BASEURL_BE` for API connection

## Development Workflow

1. Frontend Development:

```bash
npm run dev  # Starts Next.js on http://localhost:3000
```

2. Backend Development:

```bash
cd backend
python -m flask run  # Starts Flask server
```

3. Configuration Setup:
   - Create `.env` in `/backend` with required API keys
   - CORS is configured for `localhost:3000` in `config.py`

## Project Conventions

1. File Structure:

   - React components in `/src/components/`
   - API routes in `/backend/app/routes/`
   - Static files in `/backend/app/static/uploads/`

2. Type Definitions:

   - Global types in `/types/global.d.ts`
   - Component-specific interfaces defined in component files

3. Error Handling:
   - Backend services use explicit error classes
   - Frontend handles errors with user-friendly messages

## AI Model Integration

1. YOLO Model:

   - Loaded once at service initialization
   - Model file: `app/model/best.pt`
   - Handles kidney stone detection in images

2. Gemini AI:
   - Used for generating detailed descriptions
   - Requires valid API key in environment

## Notes

- YOLO model is pre-trained specifically for kidney stone detection
- Image uploads are processed and stored in `/backend/app/static/uploads/`
- Frontend uses TailwindCSS for styling
