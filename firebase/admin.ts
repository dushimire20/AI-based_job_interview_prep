let firebaseInstance: { auth: any; db: any } | null = null;

function initFirebaseAdmin() {
  const { initializeApp, getApps, cert, applicationDefault } =
    require("firebase-admin/app");
  const { getAuth } = require("firebase-admin/auth");
  const { getFirestore } = require("firebase-admin/firestore");

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

export function getFirebase() {
  if (!firebaseInstance) {
    firebaseInstance = initFirebaseAdmin();
  }
  return firebaseInstance;
}

export const auth = new Proxy({}, {
  get: () => getFirebase().auth,
});

export const db = new Proxy({}, {
  get: (target, prop) => getFirebase().db[prop as string],
});