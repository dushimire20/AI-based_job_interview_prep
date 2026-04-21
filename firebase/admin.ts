import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error(
        "❌ Missing Firebase credentials:",
        { projectId: !!projectId, clientEmail: !!clientEmail, privateKey: !!privateKey }
      );
      throw new Error(
        "Missing Firebase Admin SDK credentials. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set."
      );
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });

    console.log("✅ Firebase Admin SDK initialized");
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

export const { auth, db } = initFirebaseAdmin();