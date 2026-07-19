# Firebase Setup — Pleyi

Google sign-in and cloud storage for saved games + play history.

## 1. Create Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or use existing)
3. **Build → Authentication → Sign-in method → Google → Enable**
4. Add authorized domain: `localhost` (and your production domain)

## 2. Create Firestore database

1. **Build → Firestore Database → Create database**
2. Start in **production mode**
3. Deploy security rules from `firestore.rules` in this repo:

```bash
firebase deploy --only firestore:rules
```

Or paste the rules manually in the Firebase Console → Firestore → Rules.

## 3. Create composite indexes

Firestore will prompt for indexes on first query. Or create manually:

| Collection   | Fields                                      |
|-------------|---------------------------------------------|
| savedGames  | userId Asc, updatedAt Desc                  |
| playHistory | userId Asc, playedAt Desc                   |

## 4. Web app config

1. **Project settings → General → Your apps → Web**
2. Register app and copy config
3. Copy `data/firebase.json.example` → `data/firebase.json` and fill values

**Or** set environment variables (Render, etc.):

```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

## 4b. Server-side Firestore access (premium subscriptions)

Subscription/premium status (`lib/premium.js`) is written from the server, not
the browser, so it needs its own credential — the public web config above
doesn't grant server access.

1. **Project settings → Service accounts → Generate new private key** (downloads a JSON file)
2. Locally: save it as `data/firebase-service-account.json` (already gitignored)
3. In production (Render, etc.): set env var `FIREBASE_SERVICE_ACCOUNT` to the full JSON contents, on one line

Without this credential, premium status falls back to a local JSON file
(`data/premium-subscriptions.json`) — fine for local dev, but it resets on every
deploy/restart on platforms without a persistent disk (e.g. Render's free tier).

## 5. Test locally

```bash
npm start
```

Open `/games` → **התחברות** → **Google** → create a custom game → **שמור לחשבון**.

## Data model

### `users/{uid}`
Profile synced on login: name, email, photoURL.

### `savedGames/{id}`
Teacher-created custom games:
- userId, title, subject, gameId, content, items[], createdAt, updatedAt

### `playHistory/{id}`
Each completed solo game:
- userId, gameId, gameTitle, customGameId?, isCustom, score, reason, playedAt

## Notes

- Firebase web API keys are public; security is enforced by Firestore rules + Auth.
- Without config, the site works as before — login shows a setup message.
- Play history is saved when a logged-in user finishes a solo game.
