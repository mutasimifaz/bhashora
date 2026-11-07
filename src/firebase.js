import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend
} from 'firebase/ai'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseReady = Boolean(
  config.apiKey &&
  config.authDomain &&
  config.projectId &&
  config.appId
)

export const app = firebaseReady
  ? (getApps().find(x => x.name === '[DEFAULT]') || initializeApp(config))
  : null

// App Check must initialize before Firebase services are accessed.
if (app) {
  try {
    const isLocal = import.meta.env.DEV

    const siteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY

    if (isLocal) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('none'),
        isTokenAutoRefreshEnabled: true,
      })
    } else if (siteKey) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      })
    } else {
      console.error('Production App Check site key is missing.')
    }
  } catch (error) {
    console.error('Firebase App Check initialization failed:', error)
  }
}
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

export const helpModel = app
  ? getGenerativeModel(
      getAI(app, { backend: new GoogleAIBackend() }),
      {
        model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.8-flash',
        systemInstruction:
          'তুমি ভাষোরা অ্যাপের একজন ধৈর্যশীল, বিনয়ী ও সহানুভূতিশীল বাংলা ডিজিটাল সহকারী। সহজ, পরিষ্কার, সম্মানজনক বাংলায় ধাপে ধাপে সাহায্য করবে। একবারে একটি ছোট ধাপ বলবে, ছোট বাক্য ব্যবহার করবে, প্রয়োজন হলে নম্বর দিয়ে নির্দেশনা দেবে। বয়স্ক ব্যবহারকারীর উপযোগী ধীর, ধৈর্যশীল ও আশ্বস্ত করার ভঙ্গি রাখবে। অপ্রয়োজনীয় ইংরেজি পরিভাষা এড়িয়ে চলবে। পাসওয়ার্ড, OTP বা ব্যাংকের গোপন তথ্য চাইবে না। স্ক্রিনশট পেলে দৃশ্যমান তথ্য দেখে ব্যাখ্যা করবে; অনুমানকে নিশ্চিত তথ্য হিসেবে বলবে না।'
      }
    )
  : null
