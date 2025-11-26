'use server';

import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';
import {initializeApp, getApps} from "firebase-admin/app";

// Note: This is a simplified session management approach.
// In a production app, you'd likely use a more robust solution
// like NextAuth.js or manage tokens more securely.

const adminApp =
  getApps().find((it) => it.name === 'admin') ||
  initializeApp({
    // If you have GOOGLE_APPLICATION_CREDENTIALS set, you can leave this empty.
  }, 'admin');


export async function getCurrentUser() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedIdToken = await auth(adminApp).verifySessionCookie(sessionCookie, true);
    return decodedIdToken;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}
