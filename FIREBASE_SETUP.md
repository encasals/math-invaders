# Firebase Setup Guide for Math Invaders

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "math-invaders")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project console, go to **Authentication** → **Sign-in method**
2. Enable the following sign-in providers:
   - **Email/Password**: Click to enable
   - **Google**: Click to enable and configure
   - **Anonymous**: Click to enable (for guest users)

## 3. Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (you can secure it later)
3. Select a location for your database
4. Click "Done"

## 4. Get your Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General** tab
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app (`</>`  icon)
4. Enter your app nickname (e.g., "math-invaders-web")
5. Check "Also set up Firebase Hosting" if you plan to deploy
6. Click "Register app"
7. Copy the `firebaseConfig` object

## 5. Update Configuration

Replace the placeholder values in `src/firebase/config.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 6. Test Your Setup

1. Run your development server: `npm run dev`
2. Open your browser to the local development URL
3. You should see the authentication screen
4. Try creating an account or signing in with Google
5. Play the game and verify that scores are saved to your Firestore database

## 7. Security Rules (Optional but Recommended)

Go to **Firestore Database** → **Rules** and update your security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 8. Deploy (Optional)

If you enabled Firebase Hosting:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize hosting: `firebase init hosting`
4. Build your app: `npm run build`
5. Deploy: `firebase deploy`

## Features Included

- ✅ Email/Password authentication
- ✅ Google Sign-In
- ✅ Anonymous/Guest play
- ✅ High score tracking per user
- ✅ User profile management
- ✅ Automatic auth state management
- ✅ Logout functionality

Your Math Invaders game now has full Firebase authentication integration!