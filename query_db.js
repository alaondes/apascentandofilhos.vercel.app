import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "ai-studio-70eb843d-20fe-4241-82e8-1a54becf2c41"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const snap = await getDoc(doc(db, "content", "header_logo"));
  if (snap.exists()) {
    console.log(JSON.stringify(snap.data(), null, 2));
  } else {
    console.log("No data");
  }
}
main().catch(console.error);
