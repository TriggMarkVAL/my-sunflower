// ===== FIREBASE SETUP =====
// This site uses Firebase Firestore (free "Spark" plan — no billing needed) so the
// "together for" moment AND her photo are saved to the cloud and show correctly
// from ANY device — her phone, your phone, a PC, forever.
//
// SETUP (about 5 minutes, one time):
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" -> name it anything (e.g. "my-sunflower") -> follow the steps
//    (you can disable Google Analytics for this project, you don't need it)
// 3. Once inside the project, click "Build" -> "Firestore Database" -> "Create database"
//    -> choose "Start in test mode" for now -> pick any location -> Enable
// 4. Click the gear icon (top left, next to "Project Overview") -> "Project settings"
// 5. Scroll to "Your apps" -> click the </> (web) icon -> nickname it anything -> Register app
// 6. It will show you a firebaseConfig object like the one below — copy YOUR values
//    into the placeholders here.
// 7. IMPORTANT (security): in Firestore -> Rules tab, replace the rules with the ones
//    at the bottom of this file so random people on the internet can't overwrite your data.

const firebaseConfig = {
  apiKey: "AIzaSyAiXPBgjqrJpgzPCG3poHBfDzDY9yrR83Q",
  authDomain: "my-sunflower-08-01-26.firebaseapp.com",
  projectId: "my-sunflower-08-01-26",
  storageBucket: "my-sunflower-08-01-26.firebasestorage.app",
  messagingSenderId: "611181641325",
  appId: "1:611181641325:web:0bef25e88df48a4b2d8964"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Everything lives in one document: collection "sunflower", document "yesMoment"
const YES_DOC_REF = db.collection('sunflower').doc('yesMoment');

// Reads the saved moment. Returns { startISO, photo } or null if she hasn't said yes yet.
async function getYesMoment(){
  try{
    const snap = await YES_DOC_REF.get();
    if(snap.exists) return snap.data();
    return null;
  }catch(e){
    console.error('Firebase read error:', e);
    return null;
  }
}

// Saves/updates the moment. data = { startISO, photo (optional base64 string) }
async function saveYesMoment(data){
  try{
    await YES_DOC_REF.set(data, { merge: true });
  }catch(e){
    console.error('Firebase write error:', e);
  }
}

/* ===== RECOMMENDED FIRESTORE SECURITY RULES =====
Paste this in Firebase Console -> Firestore Database -> Rules tab -> Publish.
This locks reads/writes to ONLY the single "yesMoment" document this site uses,
instead of leaving your whole database wide open.

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sunflower/yesMoment {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
*/
