# CineMania (MoviesApp-Expo)

A React Native + Expo mobile app to browse movies and TV series from The Movie Database (TMDb), with Firebase accounts, favorites and star-rated reviews.

<p align="center">
  <img src="DemoImages/IMG_5730.PNG" width="220" alt="Movie list">
  <img src="DemoImages/IMG_5733.PNG" width="220" alt="Movie detail with review form">
  <img src="DemoImages/IMG_5737.PNG" width="220" alt="Favorites">
</p>

<sub>Screenshots are from an earlier build; the current UI is in Spanish and has four bottom tabs.</sub>

## Features

- Email/password sign-up and sign-in with Firebase Authentication; user profiles stored in Firestore.
- Movies and Series tabs fed by TMDb `discover` endpoints (Spanish locale), with genre filter (Action, Drama, Mystery) and search by title.
- Detail screens for movies and series with overview, cast (TMDb credits) and community reviews.
- Favorites: add/remove from the detail screen, listed in their own tab (Firestore `favorites` collection, per user).
- Reviews: 1–5 star rating plus comment, written from the detail screen or the Reviews tab (Firestore `reviews` collection).
- Profile screen with the user's favorites and reviews, password change and sign-out.
- Navigation: stack for auth, drawer + bottom tabs (Películas, Series, Reseñas, Favoritos) once signed in.

## Tech stack

- Expo SDK 52, React Native 0.76.3, React 18.3
- React Navigation 6 (stack, drawer, bottom tabs), Reanimated 3, Gesture Handler
- Firebase 10 (Authentication + Cloud Firestore)
- TMDb REST API via `fetch`
- React Context for auth and favorites state
- `@react-native-picker/picker`, `@expo/vector-icons`

## Getting started

Requirements: Node.js 18+, the Expo Go app on a device (or an Android emulator / iOS simulator), a Firebase project with Email/Password auth and Firestore enabled, and a TMDb API key.

```bash
git clone https://github.com/JoseBurgoss/MoviesApp-Expo.git
cd MoviesApp-Expo
npm install
npm start          # expo start -c (clears the Metro cache)
```

Then scan the QR code with Expo Go, or press `a` (Android) / `i` (iOS). `npm run android`, `npm run ios` and `npm run web` are also available.

### Configuration

- **Firebase:** `firebase.js` reads `process.env.FIREBASE_*` (API key, auth domain, project ID, storage bucket, sender ID, app ID, measurement ID). Expo SDK 52 only inlines variables prefixed with `EXPO_PUBLIC_`, so either rename them (for example `EXPO_PUBLIC_FIREBASE_API_KEY`, in `.env` and in `firebase.js`) or set your config values directly.
- **TMDb:** the API key is defined as `API_KEY` inside the list, detail and review screens in `screens/`. Replace it with your own key.

## Project structure

```text
App.js                 # Auth stack, drawer and stack navigators
firebase.js            # Firebase app, Auth and Firestore instances
context/
├── AuthContext.js     # Sign-in, sign-up, sign-out, current user
└── FavoritesContext.js
screens/
├── HomeScreen.js      # Bottom tabs: movies, series, reviews, favorites
├── MovieListScreen.js / SeriesListScreen.js
├── MovieDetailScreen.js / SeriesDetailScreen.js
├── ReviewScreen.js, FavoritesScreen.js, ProfileScreen.js
└── SignInScreen.js / SignUpScreen.js
shared/                # CustomInput, MovieReviewForm, Stars
DemoImages/            # Screenshots
```

## Español

App móvil hecha con React Native y Expo para explorar películas y series de TMDb. Incluye registro e inicio de sesión con Firebase, búsqueda y filtro por género, favoritos y reseñas con estrellas guardadas en Firestore, y un perfil con cambio de contraseña.

---

Author: José Burgos — https://jose-burgos-portfolio.vercel.app · https://www.linkedin.com/in/jose-burgos-/
