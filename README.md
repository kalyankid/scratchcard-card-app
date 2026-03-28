# Coupon / Scratch Card App

This monorepo contains three parts:

```
coupon-app/
├── backend/               → Node.js + Express REST API
├── frontend/
│   ├── admin-dashboard/   → React (Vite) web app for admins
│   └── userApp/           → React Native (Expo) mobile app for users
```

---

## Prerequisites

Install these before starting:

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) → `npm install -g expo-cli`
- [EAS CLI](https://docs.expo.dev/build/setup/) → `npm install -g eas-cli` (for mobile builds)

---

## 1. Backend Setup

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://username:password@host:27017/dbname
JWT_SECRET=any_random_secret_string
```

Start the server:

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`.

> The `uploads/` folder is created automatically when files are uploaded. You do not need to create it manually.

---

## 2. Admin Dashboard Setup

```bash
cd frontend/admin-dashboard
npm install
```

Copy the example env file:

```bash
cp .env.example .env
```

Edit `frontend/admin-dashboard/.env`:

```
VITE_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
# Output is in the dist/ folder — deploy to any static host (Netlify, Vercel, Nginx, etc.)
```

---

## 3. User App Setup (React Native / Expo)

```bash
cd frontend/userApp
npm install
```

Copy the example env file:

```bash
cp .env.example .env
```

Edit `frontend/userApp/.env`:

```
EXPO_PUBLIC_BASE_URL=http://<your-local-ip>:5000
```

> Use your machine's local IP (e.g. `192.168.1.x`) instead of `localhost` so the phone/emulator can reach the backend.

### Run on device / emulator

```bash
# Start Expo dev server
npm start

# Or directly target a platform
npm run android
npm run ios
```

### Build APK (Android) via EAS

```bash
# Login to your Expo account first
eas login

# Build a preview APK (internal distribution)
eas build --platform android --profile preview

# Build a production APK
eas build --platform android --profile production
```

> EAS builds happen in the cloud. You need a free [Expo account](https://expo.dev/).

---

## Deployment Summary

| Part            | Local Dev                  | Production                                      |
|-----------------|----------------------------|-------------------------------------------------|
| Backend         | `npm run dev` (port 5000)  | Deploy to any Node.js host (Railway, Render, EC2, VPS) |
| Admin Dashboard | `npm run dev` (Vite)       | `npm run build` → deploy `dist/` to Netlify / Vercel / Nginx |
| User App        | `npm start` (Expo Go)      | `eas build` → download APK → install on device |

---

## Environment Variables Reference

| File                                  | Variable                | Description                        |
|---------------------------------------|-------------------------|------------------------------------|
| `backend/.env`                        | `PORT`                  | Port the API runs on               |
| `backend/.env`                        | `MONGO_URI`             | MongoDB connection string          |
| `backend/.env`                        | `JWT_SECRET`            | Secret key for JWT signing         |
| `frontend/admin-dashboard/.env`       | `VITE_API_URL`          | Backend API base URL               |
| `frontend/userApp/.env`               | `EXPO_PUBLIC_BASE_URL`  | Backend API base URL for mobile    |
