# User App — Scratch And Win

React Native (Expo) mobile app for end users.

## Setup

```bash
npm install
cp .env.example .env   # set EXPO_PUBLIC_BASE_URL to your backend IP
npm start              # run with Expo Go
```

## Build APK

```bash
eas login
eas build --platform android --profile production
```

See the root [README](../../README.md) for full details.
