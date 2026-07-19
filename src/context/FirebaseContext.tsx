import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

interface FirebaseContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          const membroRef = doc(db, "membros", user.uid);
          const membroSnap = await getDoc(membroRef);
          if (membroSnap.exists()) {
            setProfile(membroSnap.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  };

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true); // Ensure loading is true while fetching profile
        setUser(firebaseUser);
        
        // Listen to users collection
        const docRef = doc(db, "users", firebaseUser.uid);
        unsubProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data());
            setLoading(false);
          } else {
            // Fallback to membros if not in users
            const membroRef = doc(db, "membros", firebaseUser.uid);
            getDoc(membroRef).then(membroSnap => {
              if (membroSnap.exists()) {
                setProfile(membroSnap.data());
              } else {
                setProfile(null);
              }
              setLoading(false);
            }).catch(error => {
              console.error("Error fetching user profile from membros:", error);
              setProfile(null);
              setLoading(false);
            });
          }
        }, (error) => {
           console.error("Error fetching user profile:", error);
           setProfile(null);
           setLoading(false);
        });

      } else {
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  return (
    <FirebaseContext.Provider
      value={{ user, profile, loading, refreshProfile }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
