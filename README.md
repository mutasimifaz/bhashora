# ভাষোরা (Bhashora)

বাংলাভাষী নতুন শিক্ষার্থীদের জন্য React + Vite + Firebase ভিত্তিক PWA। সম্পূর্ণ JavaScript/JSX; TypeScript নেই।

## চালু করুন

1. Node.js 20 বা তার পরের LTS সংস্করণ ইনস্টল করুন।
2. `.env.example` কপি করে `.env` নামে রাখুন। Firebase Console-এর Project settings → Your apps → Web app থেকে `VITE_FIREBASE_*` মানগুলো বসান।
3. Firebase Console → Authentication → Sign-in method থেকে Email/Password চালু করুন এবং Authentication → Settings → Authorized domains-এ `localhost` রাখুন।
4. Firebase Console → Build → Firestore Database থেকে database তৈরি করুন। `firestore.rules` প্রকাশ করুন।
5. Firebase Console → AI Services → AI Logic-এ গিয়ে Gemini Developer API / Firebase AI Logic চালু করুন এবং আপনার প্রকল্পের জন্য নির্দেশিত setup সম্পন্ন করুন। AI সহায়তার জন্য এই ধাপটি আবশ্যক।
6. Sarvam voice চালু করতে `.env` ফাইলে `VITE_SARVAM_API_KEY` দিন। বাংলা কণ্ঠের জন্য Bulbul v3 `roopa`, ইংরেজির জন্য `ishita` ব্যবহার করা হয়।
7. টার্মিনালে চালান:

```bash
npm install
npm run dev
```

## অন্তর্ভুক্ত সুবিধা

- Firebase Email/Password signup, login, password reset এবং logout
- Firebase AI Logic দিয়ে বাংলা AI সহায়তা; কথোপকথনের প্রসঙ্গ এবং নির্বাচিত screenshot Gemini-তে পাঠানো হয়
- Web Speech API-ভিত্তিক বাংলা voice input (সমর্থিত browser/HTTPS এবং microphone permission প্রয়োজন)
- Sarvam AI Bulbul v3 দিয়ে বাংলা ও ইংরেজি শব্দ/বাক্য শোনা (API key প্রয়োজন)
- আগের পাঠ, কুইজ/গেম, অগ্রগতি, streak, বড় লেখা, dark mode এবং mobile bottom navigation
- Signed-in user-এর পাঠ সম্পন্নের তালিকা, শেখার দিন, আজকের কুইজ, পছন্দের সেটিংস এবং সাম্প্রতিক chat text Cloud Firestore-এ UID-ভিত্তিকভাবে সংরক্ষণ ও লগইনের পর পুনরুদ্ধার
- SVG logo, favicon, Open Graph artwork এবং PWA manifest

## ডেটা সংরক্ষণ সম্পর্কে

- Firestore-এর `users/{uid}/appData/main` ডকুমেন্টে অগ্রগতি, কুইজ, সেটিংস এবং সাম্প্রতিক ৪০টি chat text রাখা হয়। পুরোনো সংস্করণের `dailyProgress` ডকুমেন্ট থাকলে প্রথমবার লগইনের সময় সেগুলো থেকেও অগ্রগতি পুনরুদ্ধারের চেষ্টা করা হয়।
- Chat-এর screenshot/image ফাইল এই সংস্করণে স্থায়ীভাবে সংরক্ষণ করা হয় না; সেগুলো স্থায়ী করতে Firebase Storage upload এবং Storage Rules আলাদাভাবে যুক্ত করতে হবে।
- নতুন ডেটা Firestore-এ লেখার আগে cloud restore শেষ হওয়ার অপেক্ষা করে। Firestore Rules প্রকাশিত না থাকলে read/write ব্যর্থ হবে।

## গুরুত্বপূর্ণ সীমাবদ্ধতা

- Microphone speech-to-text browser-এর Web Speech API-এর ওপর নির্ভর করে। Chrome/Edge-এ সমর্থন ভিন্ন হতে পারে; কিছু browser-এ voice recognition অনুপস্থিত বা network-নির্ভর। localhost বা HTTPS ব্যবহার করুন এবং microphone permission দিন।
- AI ব্যবহারে Firebase AI Logic/Gemini setup, প্রকল্পের region/availability এবং billing/quota নীতি প্রযোজ্য হতে পারে। প্রথমবার AI না চললে Firebase Console-এর AI Logic setup status ও browser console error দেখুন।
- Screenshot পাঠালে ছবিটি AI service-এ বিশ্লেষণের জন্য পাঠানো হয়। OTP, password, bank details বা ব্যক্তিগত গোপন তথ্যযুক্ত screenshot পাঠাবেন না।
- Firebase Web config browser-এ দৃশ্যমান থাকে; Firestore Security Rules দিয়ে user data সুরক্ষিত রাখুন। Service account key কখনো frontend-এ রাখবেন না। `VITE_SARVAM_API_KEY`-ও Vite build-এর সময় browser bundle-এ প্রকাশিত হয়; production-এ গোপন রাখতে হলে server-side proxy প্রয়োজন।

## Brand assets

- `public/logo.svg` — wordmark
- `public/mark.svg` — symbol mark
- `public/favicon.svg` — browser favicon
- `public/og-image.png` — social preview image


## Public routes and SEO

- `/` — public landing page
- `/digital-help` — Digital Help service page
- `/english-learning` — English learning page
- `/about` — about page
- `/login` — sign in / sign up
- `/app` and `/app/*` — signed-in learning app routes

The deployment host must rewrite unknown paths to `/index.html` (the included `public/_redirects` covers Netlify). Replace the example `https://bhashora.com` domain in `public/sitemap.xml` and `public/robots.txt` with the final production domain before submitting the sitemap in Google Search Console.


## Firebase AI Logic setup (important)

This project uses Firebase AI Logic with the **Gemini Developer API** provider (`GoogleAIBackend`). The app cannot create or repair the provider configuration in your Firebase project from browser code.

1. In Firebase Console, open **AI Services → AI Logic** for the same project ID used in `.env`.
2. Confirm that Gemini Developer API onboarding completed successfully. AI Logic provider setup is project-level: do not repeat the onboarding or create another Firebase project to retry. If two AI Logic entries/apps were accidentally added, use the Web app whose Firebase config matches this project's `VITE_FIREBASE_PROJECT_ID`; do not assume a second entry fixes a missing backend config.
3. In Google Cloud APIs, confirm `generativelanguage.googleapis.com` and `firebasevertexai.googleapis.com` are enabled for that same project.
4. Confirm the Firebase Web API key in `.env` belongs to the same project. If the key has API restrictions, allow Firebase AI Logic API (`firebasevertexai.googleapis.com`).
5. Firebase AI Logic setup now enforces App Check. During `npm run dev`, this project uses `DebugProvider`; the browser console prints a debug token. Register that token under Firebase Console → App Check → Apps → your Web app → Manage debug tokens.
6. For production, set `VITE_RECAPTCHA_V3_SITE_KEY` to a reCAPTCHA v3 site key registered for your production domain. Never deploy the local debug provider or share its debug token.

If the UI reports `Firebase AI Logic genai config not found`, the provider setup is still missing or incomplete on Firebase's backend. The official Firebase troubleshooting guide identifies this as a project/provider configuration issue, not a prompt or CSS issue:
https://firebase.google.com/docs/ai-logic/error-codes

## Typography and design

English text uses Poppins. Bengali glyphs fall back to Hind Siliguri (the earlier Bengali font). The visual system uses solid navy, teal, gold and warm off-white colours; navigation uses a slim teal active indicator rather than a gold pill.
