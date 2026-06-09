import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "ai-studio-70eb843d-20fe-4241-82e8-1a54becf2c41"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const docRef = doc(db, "content", "header_logo");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log("Current data:", JSON.stringify(snap.data().links));
    
    // Create the exact dropdown requested
    const newLinks = [
      { name: "Início", path: "/" },
      { name: "Quem Somos", path: "/quem-somos" },
      {
        name: "Ministérios",
        path: "#",
        subLinks: [
          { name: "Edificado Matrimônio", path: "/edificado-matrimonio" },
          { name: "MAF Kids", path: "/maf-kids" },
          { name: "Filhos de Paz", path: "/filhos-de-paz" },
          { name: "Jovens MAF", path: "/jovens-maf" },
          { name: "Homens de Temor", path: "/homens-de-temor" }
        ]
      },
      { name: "Cursos", path: "/cursos" },
      { name: "Contato", path: "/contato" }
    ];

    await updateDoc(docRef, { links: newLinks });
    console.log("Successfully updated links with dropdown!");
  } else {
    console.log("No header_logo document found, skipping update.");
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
