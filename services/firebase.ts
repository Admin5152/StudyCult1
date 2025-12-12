import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPdaNHemO6R1VkMnjiR8wp5vJYZR9lApQ",
  authDomain: "cultists-52082.firebaseapp.com",
  projectId: "cultists-52082",
  storageBucket: "cultists-52082.firebasestorage.app",
  messagingSenderId: "395376469588",
  appId: "1:395376469588:web:b278a3743af2a35a3a2fc1",
  measurementId: "G-4VXNC5YB1X"
};

const app = initializeApp(firebaseConfig);

// Export auth and db services
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- Auth Helpers ---
export const logoutUser = () => signOut(auth);

// --- Database Helpers ---

export const saveStudySet = async (userId: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, "decks"), {
      ...data,
      userId,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const getUserDecks = async (userId: string) => {
  const q = query(
    collection(db, "decks"), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};