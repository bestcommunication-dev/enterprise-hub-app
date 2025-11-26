'use server';

import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

const ADMIN_APP_NAME = 'firebase-admin';

function getAdminApp(): App {
  if (getApps().some(app => app.name === ADMIN_APP_NAME)) {
    return getApp(ADMIN_APP_NAME);
  }
  // If you have GOOGLE_APPLICATION_CREDENTIALS set, you can leave the config empty.
  // The SDK will automatically detect the credentials.
  return initializeApp({}, ADMIN_APP_NAME);
}

const adminApp = getAdminApp();
const firestore = getFirestore(adminApp);
const storage = getStorage(adminApp);
const auth = getAuth(adminApp);

export { adminApp, firestore, storage, auth };
