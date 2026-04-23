# NoteVault Pro

A premium Notes & Video Lecture Manager with a stunning dark theme UI, built on the MERN stack.

## Features
- **Authentication**: JWT-based authentication (Login, Register).
- **Notes Management**: Create, pin, delete, search, and filter notes. Grid/List view. Rich text support (UI).
- **Video Lectures**: Organize video lectures with progress tracking.
- **Subject Management**: Group content by custom subjects with emojis and colors.
- **Study Analytics**: Track study time and note creation activity with Recharts.
- **Pomodoro Timer**: Focus sessions directly from the dashboard.
- **Premium UI/UX**: Built with TailwindCSS & Framer Motion for sleek glassmorphism and animations.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion, Zustand (State), Recharts, Lucide React.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Multer.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)

### 1. Clone the repository
\`\`\`bash
git clone <repo-url>
cd NoteVaultPro
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd server
npm install

# Create a .env file based on .env.example
cp .env.example .env

# Start the development server
npm run dev
\`\`\`
The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
\`\`\`bash
cd ../client
npm install

# Create a .env file based on .env.example
cp .env.example .env

# Start the development server
npm run dev
\`\`\`
The frontend will run on `http://localhost:5173`.

## Folder Structure
- `/client`: React frontend using Vite.
  - `/src/components`: Reusable UI components.
  - `/src/pages`: Main application views.
  - `/src/store`: Zustand state management.
  - `/src/api`: Axios instance configuration.
- `/server`: Express backend API.
  - `/controllers`: API route logic.
  - `/models`: Mongoose database schemas.
  - `/routes`: Express router definitions.
  - `/middleware`: Authentication and upload middlewares.

## API Endpoints (Summary)
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Notes**: `/api/notes` (GET, POST), `/api/notes/:id` (PUT, DELETE), `/api/notes/:id/pin` (POST)
- **Videos**: `/api/videos` (GET, POST), `/api/videos/:id` (PUT, DELETE), `/api/videos/:id/progress` (PUT)
- **Subjects**: `/api/subjects` (GET, POST), `/api/subjects/:id` (PUT, DELETE)
- **Analytics**: `/api/analytics/overview`, `/api/analytics/weekly`
