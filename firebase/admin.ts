import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail =
      process.env.FIREBASE_CLIENT_EMAIL || process.env["FIREBASE_CLIENT-EMAIL"];
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const useServiceAccount = Boolean(projectId && clientEmail && privateKey);

    initializeApp({
      credential: useServiceAccount
        ? cert({
            projectId,
            clientEmail,
            privateKey,
          })
        : applicationDefault(),
    });

    if (!useServiceAccount && process.env.NODE_ENV !== "production") {
      throw new Error(
        "Missing Firebase Admin service account credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment, or configure application default credentials."
      );
    }
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

export const { auth, db } = initFirebaseAdmin();