import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!admin.apps.length) {
  // 1. PRODUCTION: Read credentials from environment variable (set in hosting dashboard)
  //    export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account", ...}'
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (err) {
      process.exit(1);
    }
  } else {
    // 2. DEVELOPMENT: Fall back to local JSON file
    const serviceAccountPathConfig = path.resolve(__dirname, "./serviceAccountKey.json");
    const serviceAccountPathRoot = path.resolve(__dirname, "../../serviceAccountKey.json");

    const serviceAccountPath = fs.existsSync(serviceAccountPathConfig)
      ? serviceAccountPathConfig
      : fs.existsSync(serviceAccountPathRoot)
      ? serviceAccountPathRoot
      : null;

    if (serviceAccountPath) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      // 3. Last resort — will likely fail on token verification
      console.warn("⚠️  No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT in production.");
      admin.initializeApp();
    }
  }
}

export const firebaseAdmin = admin;
